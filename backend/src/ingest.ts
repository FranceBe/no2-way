import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

interface Location {
  id: string;
  lat: number;
  lon: number;
}

const LOCATIONS: Location[] = [
  { id: "camden", lat: 51.539, lon: -0.142 },
  { id: "westminster", lat: 51.497, lon: -0.137 },
  { id: "hackney", lat: 51.545, lon: -0.055 },
  { id: "greenwich", lat: 51.482, lon: 0.0 },
  { id: "richmond", lat: 51.461, lon: -0.303 },
];

const VARS = ["pm2_5", "pm10", "nitrogen_dioxide", "ozone", "european_aqi"] as const;
type Pollutant = (typeof VARS)[number];

interface OpenMeteoResponse {
  hourly: { time: string[] } & Record<Pollutant, (number | null)[]>;
}

const HOURS_TO_KEEP = 3;

export const handler = async (): Promise<{ ok: boolean }> => {
  const now = Date.now();
  const from = new Date(now - HOURS_TO_KEEP * 3600e3).toISOString().slice(0, 16);
  const to = new Date(now).toISOString().slice(0, 16);

  for (const loc of LOCATIONS) {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${loc.lat}&longitude=${loc.lon}&hourly=${VARS.join(",")}&past_days=1&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo ${res.status} pour ${loc.id}`);
    const { hourly } = (await res.json()) as OpenMeteoResponse;

    const items = hourly.time
      .map((ts, i) => ({
        location: loc.id,
        ts,
        ...Object.fromEntries(VARS.map((v) => [v, hourly[v][i]])),
      }))
      .filter((it) => it.ts >= from && it.ts <= to);

    if (items.length === 0) continue;
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: { [TABLE]: items.map((Item) => ({ PutRequest: { Item } })) },
      })
    );
  }
  return { ok: true };
};