import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { findLocation, type Location } from "./locations";
import { toMinute } from "./keys";

export type Query = Record<string, string | undefined>;

// Validation patterns for parameters inserted into TfL URLs
export const LINE_ID = /^[a-z0-9-]{1,40}$/;
export const STOP_ID = /^[A-Za-z0-9]{1,30}$/;

// Expected error with an HTTP status (400, 404...)
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const json = (statusCode: number, data: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(data),
});

export const requireLocation = (q: Query): Location => {
  const loc = findLocation(q.location);
  if (!loc) throw new HttpError(400, "Unknown or missing location");
  return loc;
};

// Greater London, with a margin: anything outside is a client error
const LONDON = { lat: [51.2, 51.8], lon: [-0.6, 0.4] } as const;

// lat & lon from the client, e.g. a stop picked in the front-end
export const requireCoordinates = (q: Query): { lat: number; lon: number } => {
  const lat = Number(q.lat);
  const lon = Number(q.lon);
  const inLondon =
    q.lat !== undefined &&
    q.lon !== undefined &&
    lat >= LONDON.lat[0] &&
    lat <= LONDON.lat[1] &&
    lon >= LONDON.lon[0] &&
    lon <= LONDON.lon[1];
  if (!inLondon) throw new HttpError(400, "Invalid lat/lon: expected a point in London");
  return { lat, lon };
};

export const requireParam = (q: Query, name: string, pattern: RegExp): string => {
  const value = q[name];
  if (!value || !pattern.test(value)) throw new HttpError(400, `Invalid or missing ${name}`);
  return value;
};

// Start date of a time window: 48h by default, 30 days max
export const sinceFrom = (rawHours: string | undefined, defaultHours = 48): string => {
  const hours = Math.min(Number(rawHours ?? defaultHours) || defaultHours, 24 * 30);
  return toMinute(new Date(Date.now() - hours * 3600e3));
};