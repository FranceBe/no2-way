import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE } from "../shared/db";
import { airKey, roadKey, lineKey, LINES_LATEST } from "../shared/keys";
import { type Query, LINE_ID, requireLocation, requireParam, sinceFrom } from "../shared/response";

// Reads a time series (one partition, from a date) and hides storage details
async function readSeries(pk: string, since: string) {
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk AND sk >= :since",
      ExpressionAttributeValues: { ":pk": pk, ":since": since },
    })
  );
  return Items.map(({ sk, ...rest }) => {
    delete rest.pk;
    return { ts: sk, ...rest };
  });
}

// GET /air?location=camden&hours=24
export async function getAir(q: Query) {
  const loc = requireLocation(q);
  return readSeries(airKey(loc.id), sinceFrom(q.hours));
}

// GET /roads?location=camden&hours=24
export async function getRoads(q: Query) {
  const loc = requireLocation(q);
  const readings = await readSeries(roadKey(loc.corridor), sinceFrom(q.hours));
  return { corridor: loc.corridor, readings };
}

// GET /lines
export async function getLines() {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: LINES_LATEST }));
  return { ts: Item?.ts ?? null, lines: Item?.lines ?? [] };
}

// GET /lines/history?line=northern&hours=168
export async function getLineHistory(q: Query) {
  const line = requireParam(q, "line", LINE_ID);
  return readSeries(lineKey(line), sinceFrom(q.hours, 24 * 7));
}