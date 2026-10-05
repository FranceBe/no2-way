import type { Arrival, BikePoint, Stop, Timetable, Weather } from "@no2-way/shared";
import { LOCATIONS } from "../shared/locations";
import { fetchJson, tflUrl, cached } from "../shared/http";
import { type Query, HttpError, LINE_ID, STOP_ID, requireLocation, requireParam } from "../shared/response";

// ---------- Weather ----------

interface OpenMeteoCurrent {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number; // WMO weather code
    is_day: number; // 1 = day, 0 = night
    precipitation: number;
    wind_speed_10m: number;
  };
}

// GET /weather?location=camden (defaults to the first location)
export async function getWeather(q: Query): Promise<Weather> {
  const loc = q.location ? requireLocation(q) : LOCATIONS[0];

  return cached(`weather:${loc.id}`, 10 * 60_000, async () => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code,is_day,precipitation,wind_speed_10m`;
    const { current } = await fetchJson<OpenMeteoCurrent>(url);

    return {
      time: current.time,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      precipitation: current.precipitation,
      windSpeed: current.wind_speed_10m,
    };
  });
}

// ---------- Stations of a line ----------

interface TflStopPoint {
  naptanId: string;
  commonName: string;
}

// GET /lines/stops?line=northern
export async function getLineStops(q: Query): Promise<Stop[]> {
  const line = requireParam(q, "line", LINE_ID);

  // Stations rarely change: cache for 24h
  return cached(`stops:${line}`, 24 * 3600_000, async () => {
    const stops = await fetchJson<TflStopPoint[]>(tflUrl(`/Line/${line}/StopPoints`));
    return stops
      .map((stop) => ({ id: stop.naptanId, name: stop.commonName }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}

// ---------- Next arrivals ----------

interface TflArrival {
  lineId: string;
  lineName: string;
  platformName: string;
  direction?: string;
  destinationName?: string;
  towards?: string;
  timeToStation: number; // seconds
  expectedArrival: string;
}

// GET /arrivals?stop=940GZZLUKSX&line=northern&direction=outbound
export async function getArrivals(q: Query): Promise<Arrival[]> {
  const stop = requireParam(q, "stop", STOP_ID);
  const line = q.line ? requireParam(q, "line", LINE_ID) : undefined;
  const direction = q.direction;
  if (direction && direction !== "inbound" && direction !== "outbound") {
    throw new HttpError(400, "direction must be inbound or outbound");
  }

  // Cache per station, filter afterwards: one TfL call serves every line/direction
  const arrivals = await cached(`arrivals:${stop}`, 20_000, () =>
    fetchJson<TflArrival[]>(tflUrl(`/StopPoint/${stop}/Arrivals`))
  );

  return arrivals
    .filter((a) => !line || a.lineId === line)
    .filter((a) => !direction || a.direction === direction)
    .map((a) => ({
      line: a.lineId,
      lineName: a.lineName,
      platform: a.platformName,
      direction: a.direction ?? null,
      destination: a.destinationName ?? null,
      towards: a.towards ?? null,
      minutes: Math.floor(a.timeToStation / 60),
      expected: a.expectedArrival,
    }))
    .sort((a, b) => a.minutes - b.minutes); // TfL returns arrivals unordered
}

// ---------- Bikes ----------

interface TflBikePoint {
  id: string;
  commonName: string;
  lat: number;
  lon: number;
  additionalProperties: { key: string; value: string }[];
}

// Counters are stored as key/value pairs, with string values
const prop = (bike: TflBikePoint, key: string): number =>
  Number(bike.additionalProperties.find((p) => p.key === key)?.value ?? 0);

// Haversine formula: distance between two GPS points, in metres
const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a));
};

// GET /bikes?location=camden&radius=500
export async function getBikes(q: Query): Promise<BikePoint[]> {
  const loc = requireLocation(q);
  const radius = Math.min(Number(q.radius ?? 500) || 500, 2000);

  // ~800 stations in one call, shared by all locations
  const bikePoints = await cached("bikepoints", 60_000, () =>
    fetchJson<TflBikePoint[]>(tflUrl("/BikePoint"), 10_000)
  );

  return bikePoints
    .map((bike) => ({
      id: bike.id,
      name: bike.commonName,
      lat: bike.lat,
      lon: bike.lon,
      bikes: prop(bike, "NbBikes"),
      emptyDocks: prop(bike, "NbEmptyDocks"),
      docks: prop(bike, "NbDocks"),
      distance: Math.round(distanceMeters(loc.lat, loc.lon, bike.lat, bike.lon)),
    }))
    .filter((bike) => bike.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20);
}

// ---------- Timetable (first and last trains) ----------

interface TflKnownJourney {
  hour: string;
  minute: string;
}

interface TflSchedule {
  name: string; // e.g. "Saturday (also Good Friday)"
  knownJourneys?: TflKnownJourney[];
}

interface TflTimetableResponse {
  timetable?: { routes?: { schedules?: TflSchedule[] }[] };
}

// Trains before 04:00 belong to the previous day's service (e.g. 00:31 is a "last train")
const SERVICE_DAY_START = 4 * 60;

const toServiceMinutes = (journey: TflKnownJourney): number => {
  const minutes = Number(journey.hour) * 60 + Number(journey.minute);
  return minutes < SERVICE_DAY_START ? minutes + 24 * 60 : minutes;
};

const toHHMM = (minutes: number): string => {
  const hour = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
};

// GET /timetable?line=northern&stop=940GZZLUKSX&direction=outbound
export async function getTimetable(q: Query): Promise<Timetable> {
  const line = requireParam(q, "line", LINE_ID);
  const stop = requireParam(q, "stop", STOP_ID);
  const direction = q.direction ?? "outbound";
  if (direction !== "inbound" && direction !== "outbound") {
    throw new HttpError(400, "direction must be inbound or outbound");
  }

  // Timetables rarely change: cache for 24h
  return cached(`timetable:${line}:${stop}:${direction}`, 24 * 3600_000, async () => {
    const data = await fetchJson<TflTimetableResponse>(
      tflUrl(`/Line/${line}/Timetable/${stop}`, { direction }),
      10_000
    );

    // Merge every route (branches) per day: earliest first train, latest last train
    const byName = new Map<string, { first: number; last: number }>();
    for (const route of data.timetable?.routes ?? []) {
      for (const schedule of route.schedules ?? []) {
        const times = (schedule.knownJourneys ?? []).map(toServiceMinutes);
        if (times.length === 0) continue;

        const first = Math.min(...times);
        const last = Math.max(...times);
        const existing = byName.get(schedule.name);
        byName.set(schedule.name, {
          first: existing ? Math.min(existing.first, first) : first,
          last: existing ? Math.max(existing.last, last) : last,
        });
      }
    }

    const schedules = [...byName.entries()].map(([name, { first, last }]) => ({
      name,
      first: toHHMM(first),
      last: toHHMM(last),
    }));

    return { line, stop, direction, schedules };
  });
}