import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ddbMock } from "../test/ddb";
import { getAir, getLineHistory, getLines, getRoads } from "./history";

const NOW = new Date("2026-10-05T12:30:00Z");

// Input of the only QueryCommand sent
const queryInput = () => {
  const calls = ddbMock.commandCalls(QueryCommand);
  expect(calls).toHaveLength(1);
  return calls[0].args[0].input;
};

beforeEach(() => {
  ddbMock.reset();
  vi.useFakeTimers({ now: NOW });
});

describe("getAir", () => {
  it("reads the location's partition from the start of the window", async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    await getAir({ location: "camden", hours: "24" });

    expect(queryInput()).toEqual({
      TableName: "test-table",
      KeyConditionExpression: "pk = :pk AND sk >= :since",
      ExpressionAttributeValues: { ":pk": "AIR#camden", ":since": "2026-10-04T12:30" },
    });
  });

  it("defaults to the last 48h", async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    await getAir({ location: "camden" });
    expect(queryInput().ExpressionAttributeValues?.[":since"]).toBe("2026-10-03T12:30");
  });

  it("hides the storage keys: sk becomes ts, pk is dropped", async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ pk: "AIR#camden", sk: "2026-10-05T12:00", grid: "51.54,-0.14", european_aqi: 31 }],
    });

    expect(await getAir({ location: "camden" })).toEqual([
      { ts: "2026-10-05T12:00", grid: "51.54,-0.14", european_aqi: 31 },
    ]);
  });

  it("handles a response without Items", async () => {
    ddbMock.on(QueryCommand).resolves({});
    expect(await getAir({ location: "camden" })).toEqual([]);
  });

  it("rejects an unknown location without querying the table", async () => {
    await expect(getAir({ location: "atlantis" })).rejects.toMatchObject({ status: 400 });
    expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(0);
  });
});

describe("pagination", () => {
  // DynamoDB returns at most 1 MB per Query: a long window comes back in several pages
  const entry = (sk: string) => ({
    pk: "LINE#northern",
    sk,
    name: "Northern",
    mode: "tube",
    statuses: [{ severity: 10, description: "Good Service", reason: null }],
  });
  const keyOf = (sk: string) => ({ pk: "LINE#northern", sk });

  beforeEach(() => {
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({ Items: [entry("2026-10-05T10:00"), entry("2026-10-05T10:15")], LastEvaluatedKey: keyOf("2026-10-05T10:15") })
      .resolvesOnce({ Items: [entry("2026-10-05T10:30")], LastEvaluatedKey: keyOf("2026-10-05T10:30") })
      .resolvesOnce({ Items: [entry("2026-10-05T10:45")] });
  });

  it("follows LastEvaluatedKey until the last page", async () => {
    await getLineHistory({ line: "northern" });

    const startKeys = ddbMock.commandCalls(QueryCommand).map((call) => call.args[0].input.ExclusiveStartKey);
    expect(startKeys).toEqual([undefined, keyOf("2026-10-05T10:15"), keyOf("2026-10-05T10:30")]);
  });

  it("keeps the same query on every page", async () => {
    await getLineHistory({ line: "northern" });

    const conditions = ddbMock
      .commandCalls(QueryCommand)
      .map(({ args: [{ input }] }) => [input.KeyConditionExpression, input.ExpressionAttributeValues]);
    expect(new Set(conditions.map((c) => JSON.stringify(c))).size).toBe(1);
  });

  // The front-end reads one array (LineHistoryEntry[]): it never sees the pages
  it("returns every page as a single series, oldest first", async () => {
    expect(await getLineHistory({ line: "northern" })).toEqual([
      { ts: "2026-10-05T10:00", name: "Northern", mode: "tube", statuses: [{ severity: 10, description: "Good Service", reason: null }] },
      expect.objectContaining({ ts: "2026-10-05T10:15" }),
      expect.objectContaining({ ts: "2026-10-05T10:30" }),
      expect.objectContaining({ ts: "2026-10-05T10:45" }),
    ]);
  });

  it.each([
    ["air", () => getAir({ location: "camden" })],
    ["roads", async () => (await getRoads({ location: "camden" })).readings],
  ])("paginates the %s series too", async (_, read) => {
    expect(await read()).toHaveLength(4);
  });

  it("stops on an empty last page", async () => {
    ddbMock.reset();
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({ Items: [entry("2026-10-05T10:00")], LastEvaluatedKey: keyOf("2026-10-05T10:00") })
      .resolvesOnce({ Items: [] });

    expect(await getLineHistory({ line: "northern" })).toHaveLength(1);
    expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(2);
  });
});

describe("getRoads", () => {
  it("reads the corridor of the location and names it in the response", async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ pk: "ROAD#a10", sk: "2026-10-05T12:15", name: "A10", severity: "Good", score: 0 }],
    });

    expect(await getRoads({ location: "hackney" })).toEqual({
      corridor: "a10",
      readings: [{ ts: "2026-10-05T12:15", name: "A10", severity: "Good", score: 0 }],
    });
    expect(queryInput().ExpressionAttributeValues?.[":pk"]).toBe("ROAD#a10");
  });
});

describe("getLines", () => {
  it("returns the latest snapshot", async () => {
    const lines = [{ id: "northern", name: "Northern", mode: "tube", statuses: [] }];
    ddbMock.on(GetCommand).resolves({ Item: { pk: "LINES#latest", sk: "latest", ts: "2026-10-05T12:15", lines } });

    expect(await getLines()).toEqual({ ts: "2026-10-05T12:15", lines });
    expect(ddbMock.commandCalls(GetCommand)[0].args[0].input).toEqual({
      TableName: "test-table",
      Key: { pk: "LINES#latest", sk: "latest" },
    });
  });

  it("returns an empty snapshot before the first ingestion", async () => {
    ddbMock.on(GetCommand).resolves({});
    expect(await getLines()).toEqual({ ts: null, lines: [] });
  });
});

describe("getLineHistory", () => {
  it("reads the line's partition over the last 7 days by default", async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    await getLineHistory({ line: "northern" });

    expect(queryInput().ExpressionAttributeValues).toEqual({
      ":pk": "LINE#northern",
      ":since": "2026-09-28T12:30",
    });
  });

  it("rejects an invalid line id", async () => {
    await expect(getLineHistory({ line: "../x" })).rejects.toMatchObject({ status: 400 });
  });
});
