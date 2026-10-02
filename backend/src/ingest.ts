import { LOCATIONS } from "./shared/locations";
import { airKey, toMinute } from "./shared/keys";
import { fetchJson } from "./shared/http";
import { writeAll, type Item } from "./shared/db";

const VARS = ["pm2_5", "pm10", "nitrogen_dioxide", "ozone", "european_aqi"] as const;
type Pollutant = (typeof VARS)[number];

interface OpenMeteoAirResponse {
  latitude: number; // centre of the model grid cell, not the requested point
  longitude: number;
  hourly: { time: string[] } & Record<Pollutant, (number | null)[]>;
}

// Rewrite the last hours on each run: idempotent, and fills gaps after a failed run
const HOURS_TO_KEEP = 3;

export const handler = async (): Promise<{ ok: boolean; count: number }> => {
  const now = Date.now();
  const from = toMinute(new Date(now - HOURS_TO_KEEP * 3600e3));
  const to = toMinute(new Date(now));
  const items: Item[] = [];

  for (const loc of LOCATIONS) {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${loc.lat}&longitude=${loc.lon}&hourly=${VARS.join(",")}&past_days=1&forecast_days=1`;
    const { latitude, longitude, hourly } = await fetchJson<OpenMeteoAirResponse>(url);
    const grid = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;

    for (const [i, ts] of hourly.time.entries()) {
      if (ts < from || ts > to) continue;
      items.push({
        pk: airKey(loc.id),
        sk: ts,
        grid,
        ...Object.fromEntries(VARS.map((v) => [v, hourly[v][i]])),
      });
    }
  }

  await writeAll(items);
  return { ok: true, count: items.length };
};