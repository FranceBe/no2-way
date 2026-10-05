import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../test/server";
import { getArrivals, getBikes, getLineStops, getTimetable, getWeather } from "./live";

const TFL = "https://api.tfl.gov.uk";

// Answers `path` with `body` and records every URL requested
const stub = (url: string, body: unknown) => {
  const requested: URL[] = [];
  server.use(
    http.get(url, ({ request }) => {
      requested.push(new URL(request.url));
      return HttpResponse.json(body as object);
    })
  );
  return requested;
};

describe("getWeather", () => {
  const openMeteo = {
    current: {
      time: "2026-10-05T12:15",
      temperature_2m: 14.2,
      apparent_temperature: 12.9,
      weather_code: 61,
      is_day: 1,
      precipitation: 0.4,
      wind_speed_10m: 18.3,
    },
  };

  it("asks Open-Meteo for the location's coordinates and renames the fields", async () => {
    const requested = stub("https://api.open-meteo.com/v1/forecast", openMeteo);

    expect(await getWeather({ location: "camden" })).toEqual({
      time: "2026-10-05T12:15",
      temperature: 14.2,
      feelsLike: 12.9,
      weatherCode: 61,
      isDay: true,
      precipitation: 0.4,
      windSpeed: 18.3,
    });
    expect(requested[0].searchParams.get("latitude")).toBe("51.539");
    expect(requested[0].searchParams.get("longitude")).toBe("-0.142");
  });

  it("maps is_day=0 to night", async () => {
    stub("https://api.open-meteo.com/v1/forecast", { current: { ...openMeteo.current, is_day: 0 } });
    expect(await getWeather({ location: "camden" })).toMatchObject({ isDay: false });
  });

  it("defaults to the first location", async () => {
    const requested = stub("https://api.open-meteo.com/v1/forecast", openMeteo);
    await getWeather({});
    expect(requested[0].searchParams.get("latitude")).toBe("51.497"); // Westminster
  });

  it("caches per location", async () => {
    const requested = stub("https://api.open-meteo.com/v1/forecast", openMeteo);

    await getWeather({ location: "camden" });
    await getWeather({ location: "camden" });
    await getWeather({ location: "hackney" });

    expect(requested.map((url) => url.searchParams.get("latitude"))).toEqual(["51.539", "51.545"]);
  });

  it("rejects an unknown location", async () => {
    await expect(getWeather({ location: "atlantis" })).rejects.toMatchObject({ status: 400 });
  });
});

describe("getLineStops", () => {
  it("returns the stations of the line sorted by name", async () => {
    stub(`${TFL}/Line/northern/StopPoints`, [
      { naptanId: "940GZZLUKSX", commonName: "King's Cross St. Pancras Underground Station" },
      { naptanId: "940GZZLUCTN", commonName: "Camden Town Underground Station" },
    ]);

    expect(await getLineStops({ line: "northern" })).toEqual([
      { id: "940GZZLUCTN", name: "Camden Town Underground Station" },
      { id: "940GZZLUKSX", name: "King's Cross St. Pancras Underground Station" },
    ]);
  });

  it("rejects an invalid line before calling TfL", async () => {
    await expect(getLineStops({ line: "Northern/../Road" })).rejects.toMatchObject({ status: 400 });
  });
});

describe("getArrivals", () => {
  const arrival = (overrides: object) => ({
    lineId: "northern",
    lineName: "Northern",
    platformName: "Northbound - Platform 1",
    direction: "outbound",
    destinationName: "Edgware Underground Station",
    towards: "Edgware",
    timeToStation: 120,
    expectedArrival: "2026-10-05T12:02:00Z",
    ...overrides,
  });

  const arrivals = [
    arrival({ timeToStation: 419 }),
    arrival({ timeToStation: 59, direction: "inbound" }),
    arrival({ timeToStation: 181, lineId: "victoria", lineName: "Victoria" }),
  ];

  it("returns the next trains, soonest first, in whole minutes", async () => {
    stub(`${TFL}/StopPoint/940GZZLUKSX/Arrivals`, arrivals);

    const result = await getArrivals({ stop: "940GZZLUKSX" });

    expect(result.map((a) => [a.line, a.minutes])).toEqual([
      ["northern", 0],
      ["victoria", 3],
      ["northern", 6],
    ]);
    expect(result[2]).toEqual({
      line: "northern",
      lineName: "Northern",
      platform: "Northbound - Platform 1",
      direction: "outbound",
      destination: "Edgware Underground Station",
      towards: "Edgware",
      minutes: 6,
      expected: "2026-10-05T12:02:00Z",
    });
  });

  it("filters by line and direction", async () => {
    stub(`${TFL}/StopPoint/940GZZLUKSX/Arrivals`, arrivals);

    const result = await getArrivals({ stop: "940GZZLUKSX", line: "northern", direction: "outbound" });

    expect(result.map((a) => a.minutes)).toEqual([6]);
  });

  it("calls TfL once per station, whatever the filters", async () => {
    const requested = stub(`${TFL}/StopPoint/940GZZLUKSX/Arrivals`, arrivals);

    await getArrivals({ stop: "940GZZLUKSX", line: "northern" });
    await getArrivals({ stop: "940GZZLUKSX", line: "victoria" });

    expect(requested).toHaveLength(1);
  });

  it("returns null for the optional fields TfL leaves out", async () => {
    stub(`${TFL}/StopPoint/940GZZLUKSX/Arrivals`, [
      arrival({ direction: undefined, destinationName: undefined, towards: undefined }),
    ]);

    expect(await getArrivals({ stop: "940GZZLUKSX" })).toEqual([
      expect.objectContaining({ direction: null, destination: null, towards: null }),
    ]);
  });

  it.each([
    [{}, "Invalid or missing stop"],
    [{ stop: "940GZZLUKSX", line: "../x" }, "Invalid or missing line"],
    [{ stop: "940GZZLUKSX", direction: "north" }, "direction must be inbound or outbound"],
  ])("rejects %j", async (query, message) => {
    await expect(getArrivals(query)).rejects.toMatchObject({ status: 400, message });
  });
});

describe("getBikes", () => {
  // Camden is at 51.539, -0.142; 0.0027° of latitude is about 300 m
  const bikePoint = (id: string, latOffset: number, bikes = "5") => ({
    id,
    commonName: id,
    lat: 51.539 + latOffset,
    lon: -0.142,
    additionalProperties: [
      { key: "NbBikes", value: bikes },
      { key: "NbEmptyDocks", value: "7" },
      { key: "NbDocks", value: "12" },
    ],
  });

  it("returns the docks within 500 m, nearest first, with their counters", async () => {
    stub(`${TFL}/BikePoint`, [bikePoint("300m", 0.0027), bikePoint("here", 0), bikePoint("1.5km", 0.0135)]);

    expect(await getBikes({ location: "camden" })).toEqual([
      { id: "here", name: "here", lat: 51.539, lon: -0.142, bikes: 5, emptyDocks: 7, docks: 12, distance: 0 },
      expect.objectContaining({ id: "300m", distance: 300 }),
    ]);
  });

  it.each([
    ["2000", ["here", "300m", "1.5km"]],
    ["5000", ["here", "300m", "1.5km"]], // capped at 2 km
    ["100", ["here"]],
    ["abc", ["here", "300m"]], // invalid: 500 m
  ])("radius=%s", async (radius, ids) => {
    stub(`${TFL}/BikePoint`, [bikePoint("here", 0), bikePoint("300m", 0.0027), bikePoint("1.5km", 0.0135), bikePoint("3km", 0.027)]);

    const result = await getBikes({ location: "camden", radius });
    expect(result.map((bike) => bike.id)).toEqual(ids);
  });

  it("returns 20 docks at most", async () => {
    stub(`${TFL}/BikePoint`, Array.from({ length: 30 }, (_, i) => bikePoint(`dock-${i}`, i * 0.0001)));
    expect(await getBikes({ location: "camden" })).toHaveLength(20);
  });

  it("counts a missing counter as 0", async () => {
    stub(`${TFL}/BikePoint`, [{ ...bikePoint("here", 0), additionalProperties: [] }]);
    expect(await getBikes({ location: "camden" })).toEqual([
      expect.objectContaining({ bikes: 0, emptyDocks: 0, docks: 0 }),
    ]);
  });

  it("calls TfL once for every location", async () => {
    const requested = stub(`${TFL}/BikePoint`, [bikePoint("here", 0)]);

    await getBikes({ location: "camden" });
    await getBikes({ location: "hackney" });

    expect(requested).toHaveLength(1);
  });
});

describe("getTimetable", () => {
  const journey = (time: string) => {
    const [hour, minute] = time.split(":");
    return { hour, minute };
  };

  const timetable = (routes: { name: string; times: string[] }[][]) => ({
    timetable: {
      routes: routes.map((schedules) => ({
        schedules: schedules.map(({ name, times }) => ({ name, knownJourneys: times.map(journey) })),
      })),
    },
  });

  it("returns the first and last train of each day, after midnight trains counting as the day before", async () => {
    const requested = stub(
      `${TFL}/Line/northern/Timetable/940GZZLUKSX`,
      timetable([[{ name: "Monday - Friday", times: ["05:43", "12:00", "23:58", "00:31"] }]])
    );

    expect(await getTimetable({ line: "northern", stop: "940GZZLUKSX" })).toEqual({
      line: "northern",
      stop: "940GZZLUKSX",
      direction: "outbound",
      schedules: [{ name: "Monday - Friday", first: "05:43", last: "00:31" }],
    });
    expect(requested[0].searchParams.get("direction")).toBe("outbound");
  });

  it("merges the branches of a line: earliest first train, latest last train", async () => {
    stub(
      `${TFL}/Line/northern/Timetable/940GZZLUKSX`,
      timetable([
        [{ name: "Saturday", times: ["06:10", "23:40"] }],
        [
          { name: "Saturday", times: ["05:55", "23:20"] },
          { name: "Sunday", times: ["07:00", "23:00"] },
        ],
      ])
    );

    const { schedules } = await getTimetable({ line: "northern", stop: "940GZZLUKSX", direction: "inbound" });

    expect(schedules).toEqual([
      { name: "Saturday", first: "05:55", last: "23:40" },
      { name: "Sunday", first: "07:00", last: "23:00" },
    ]);
  });

  it("skips days without journeys and tolerates a missing timetable", async () => {
    stub(`${TFL}/Line/northern/Timetable/940GZZLUKSX`, timetable([[{ name: "Christmas Day", times: [] }]]));
    expect((await getTimetable({ line: "northern", stop: "940GZZLUKSX" })).schedules).toEqual([]);

    stub(`${TFL}/Line/victoria/Timetable/940GZZLUKSX`, {});
    expect((await getTimetable({ line: "victoria", stop: "940GZZLUKSX" })).schedules).toEqual([]);
  });

  it("rejects an unknown direction", async () => {
    await expect(getTimetable({ line: "northern", stop: "940GZZLUKSX", direction: "up" })).rejects.toMatchObject({
      status: 400,
    });
  });
});
