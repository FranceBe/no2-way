import { LOCATIONS } from "./shared/locations";
import { roadKey, lineKey, LINES_LATEST, toMinute, floorToQuarter } from "./shared/keys";
import { fetchJson, tflUrl } from "./shared/http";
import { writeAll, type Item } from "./shared/db";

const LINE_MODES = ["tube", "overground", "dlr", "elizabeth-line"];

// Road severity is a string: converted to a number for charts (unknown values -> null)
const ROAD_SEVERITY_SCORE: Record<string, number> = {
  Good: 0,
  Minimal: 1,
  Moderate: 2,
  Serious: 3,
  Severe: 4,
  Closure: 5,
};

interface TflRoadStatus {
  id: string;
  displayName: string;
  statusSeverity: string;
  statusSeverityDescription: string;
}

// Line severity is a number: 10 = Good Service, lower = worse, 20 = Service Closed
interface TflLineStatus {
  statusSeverity: number;
  statusSeverityDescription: string;
  reason?: string;
}

interface TflLine {
  id: string;
  name: string;
  modeName: string;
  lineStatuses: TflLineStatus[];
}

async function roadItems(ts: string): Promise<Item[]> {
  const corridors = [...new Set(LOCATIONS.map((loc) => loc.corridor))];
  const roads = await fetchJson<TflRoadStatus[]>(tflUrl(`/Road/${corridors.join(",")}/Status`));

  return roads.map((road) => ({
    pk: roadKey(road.id),
    sk: ts,
    name: road.displayName,
    severity: road.statusSeverity,
    description: road.statusSeverityDescription,
    score: ROAD_SEVERITY_SCORE[road.statusSeverity] ?? null,
  }));
}

async function lineItems(ts: string): Promise<Item[]> {
  const lines = await fetchJson<TflLine[]>(tflUrl(`/Line/Mode/${LINE_MODES.join(",")}/Status`));

  // Keep every status: the front-end decides how to display them
  const snapshot = lines.map((line) => ({
    id: line.id,
    name: line.name,
    mode: line.modeName,
    statuses: line.lineStatuses.map((status) => ({
      severity: status.statusSeverity,
      description: status.statusSeverityDescription,
      reason: status.reason ?? null,
    })),
  }));

  // One row per line for history, plus one row with the full latest snapshot
  const history = snapshot.map(({ id, ...rest }) => ({ pk: lineKey(id), sk: ts, ...rest }));
  const latest = { ...LINES_LATEST, ts, lines: snapshot };

  return [...history, latest];
}

export const handler = async (): Promise<{ ok: boolean; count: number }> => {
  const ts = toMinute(floorToQuarter(new Date()));

  // Both TfL calls are independent: run them in parallel
  const [roads, lines] = await Promise.all([roadItems(ts), lineItems(ts)]);
  const items = [...roads, ...lines];

  await writeAll(items);
  return { ok: true, count: items.length };
};