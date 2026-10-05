import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { AirReading, LineHistoryEntry, LinesSnapshot, RoadReading, RoadsResponse } from "@no2-way/shared";
import { ddb, TABLE, type Item } from "../shared/db";
import { airKey, roadKey, lineKey, LINES_LATEST } from "../shared/keys";
import { type Query, LINE_ID, requireLocation, requireParam, sinceFrom } from "../shared/response";

// Reads a time series (one partition, from a date) and hides storage details.
// A Query stops at 1 MB: follow LastEvaluatedKey so the client always gets the
// whole window in a single response, oldest first. T is the shape the ingestion
// wrote (minus the keys): DynamoDB gives no guarantee, the contract is ours
async function readSeries<T>(pk: string, since: string): Promise<T[]> {
  const items: Item[] = [];
  let startKey: Item | undefined;

  do {
    const page = await ddb.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "pk = :pk AND sk >= :since",
        ExpressionAttributeValues: { ":pk": pk, ":since": since },
        ExclusiveStartKey: startKey,
      })
    );
    items.push(...(page.Items ?? []));
    startKey = page.LastEvaluatedKey;
  } while (startKey);

  return items.map(({ sk, ...rest }) => {
    delete rest.pk;
    return { ts: sk, ...rest } as T;
  });
}

// GET /air?location=camden&hours=24
export async function getAir(q: Query): Promise<AirReading[]> {
  const loc = requireLocation(q);
  return readSeries<AirReading>(airKey(loc.id), sinceFrom(q.hours));
}

// GET /roads?location=camden&hours=24
export async function getRoads(q: Query): Promise<RoadsResponse> {
  const loc = requireLocation(q);
  const readings = await readSeries<RoadReading>(roadKey(loc.corridor), sinceFrom(q.hours));
  return { corridor: loc.corridor, readings };
}

// GET /lines
export async function getLines(): Promise<LinesSnapshot> {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: LINES_LATEST }));
  return { ts: Item?.ts ?? null, lines: Item?.lines ?? [] };
}

// GET /lines/history?line=northern&hours=168
export async function getLineHistory(q: Query): Promise<LineHistoryEntry[]> {
  const line = requireParam(q, "line", LINE_ID);
  return readSeries<LineHistoryEntry>(lineKey(line), sinceFrom(q.hours, 24 * 7));
}