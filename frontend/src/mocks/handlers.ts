// MSW handlers: same paths, parameters and errors as the real API
import { http, HttpResponse, delay } from "msw";
import {
  LINES,
  LOCATIONS,
  STOPS,
  airSeries,
  arrivalsFor,
  bikesNear,
  findLocation,
  lineHistory,
  roadSeries,
  timetableFor,
  weatherFor,
} from "./data";

const LINE_ID = /^[a-z0-9-]{1,40}$/;
const STOP_ID = /^[A-Za-z0-9]{1,30}$/;

const badRequest = (error: string) => HttpResponse.json({ error }, { status: 400 });

// Same rules as the real API: 48h by default, 30 days max
const parseHours = (raw: string | null, fallback: number): number =>
  Math.min(Number(raw ?? fallback) || fallback, 24 * 30);

// "*/path" matches any origin, so VITE_API_URL can stay unchanged
export const handlers = [
  http.get("*/locations", async () => {
    await delay(150);
    return HttpResponse.json(LOCATIONS);
  }),

  http.get("*/weather", async ({ request }) => {
    await delay(200);
    const param = new URL(request.url).searchParams.get("location");
    const loc = param ? findLocation(param) : LOCATIONS[0];
    if (!loc) return badRequest("Unknown or missing location");
    return HttpResponse.json(weatherFor(loc));
  }),

  http.get("*/lines", async () => {
    await delay(200);
    const now = new Date();
    now.setUTCMinutes(Math.floor(now.getUTCMinutes() / 15) * 15, 0, 0);
    return HttpResponse.json({ ts: now.toISOString().slice(0, 16), lines: LINES });
  }),

  http.get("*/lines/history", async ({ request }) => {
    await delay(300);
    const params = new URL(request.url).searchParams;
    const line = params.get("line");
    if (!line || !LINE_ID.test(line)) return badRequest("Invalid or missing line");
    return HttpResponse.json(lineHistory(line, parseHours(params.get("hours"), 24 * 7)));
  }),

  http.get("*/lines/stops", async ({ request }) => {
    await delay(200);
    const line = new URL(request.url).searchParams.get("line");
    if (!line || !LINE_ID.test(line)) return badRequest("Invalid or missing line");
    return HttpResponse.json(STOPS[line] ?? []);
  }),

  http.get("*/arrivals", async ({ request }) => {
    await delay(250);
    const params = new URL(request.url).searchParams;
    const stop = params.get("stop");
    const line = params.get("line");
    const direction = params.get("direction");
    if (!stop || !STOP_ID.test(stop)) return badRequest("Invalid or missing stop");
    if (line && !LINE_ID.test(line)) return badRequest("Invalid or missing line");
    if (direction && direction !== "inbound" && direction !== "outbound") {
      return badRequest("direction must be inbound or outbound");
    }
    return HttpResponse.json(arrivalsFor(stop, line, direction));
  }),

  http.get("*/timetable", async ({ request }) => {
    await delay(300);
    const params = new URL(request.url).searchParams;
    const line = params.get("line");
    const stop = params.get("stop");
    const direction = params.get("direction") ?? "outbound";
    if (!line || !LINE_ID.test(line)) return badRequest("Invalid or missing line");
    if (!stop || !STOP_ID.test(stop)) return badRequest("Invalid or missing stop");
    if (direction !== "inbound" && direction !== "outbound") {
      return badRequest("direction must be inbound or outbound");
    }
    return HttpResponse.json(timetableFor(line, stop, direction));
  }),

  http.get("*/bikes", async ({ request }) => {
    await delay(300);
    const params = new URL(request.url).searchParams;
    const loc = findLocation(params.get("location"));
    if (!loc) return badRequest("Unknown or missing location");
    const radius = Math.min(Number(params.get("radius") ?? 500) || 500, 2000);
    return HttpResponse.json(bikesNear(loc, radius));
  }),

  http.get("*/air", async ({ request }) => {
    await delay(250);
    const params = new URL(request.url).searchParams;
    const loc = findLocation(params.get("location"));
    if (!loc) return badRequest("Unknown or missing location");
    return HttpResponse.json(airSeries(loc, parseHours(params.get("hours"), 48)));
  }),

  http.get("*/roads", async ({ request }) => {
    await delay(250);
    const params = new URL(request.url).searchParams;
    const loc = findLocation(params.get("location"));
    if (!loc) return badRequest("Unknown or missing location");
    return HttpResponse.json({
      corridor: loc.corridor,
      readings: roadSeries(loc, parseHours(params.get("hours"), 48)),
    });
  }),
];

// Handy overrides to test error states, e.g. worker.use(...errorHandlers)
export const errorHandlers = [
  http.get("*/arrivals", () => HttpResponse.json({ error: "Upstream service unavailable" }, { status: 502 })),
  http.get("*/weather", () => HttpResponse.json({ error: "Upstream service unavailable" }, { status: 502 })),
  http.get("*/lines", () => HttpResponse.json({ error: "Internal error" }, { status: 500 })),
];