import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "./ingest-tfl";
import { ddbMock } from "./test/ddb";
import { server } from "./test/server";

const TFL = "https://api.tfl.gov.uk";

const roads = [
  { id: "a1", displayName: "A1", statusSeverity: "Good", statusSeverityDescription: "No Exceptional Delays" },
  { id: "a10", displayName: "A10", statusSeverity: "Serious", statusSeverityDescription: "Serious Delays" },
  { id: "a12", displayName: "A12", statusSeverity: "Unknown", statusSeverityDescription: "?" },
];

const lines = [
  {
    id: "northern",
    name: "Northern",
    modeName: "tube",
    lineStatuses: [
      { statusSeverity: 9, statusSeverityDescription: "Minor Delays", reason: "Train fault" },
      { statusSeverity: 10, statusSeverityDescription: "Good Service" },
    ],
  },
  { id: "dlr", name: "DLR", modeName: "dlr", lineStatuses: [{ statusSeverity: 10, statusSeverityDescription: "Good Service" }] },
];

const written = () =>
  ddbMock
    .commandCalls(BatchWriteCommand)
    .flatMap((call) => call.args[0].input.RequestItems!["test-table"].map((r) => r.PutRequest!.Item!));

let requested: URL[] = [];

beforeEach(() => {
  ddbMock.reset();
  ddbMock.on(BatchWriteCommand).resolves({});
  vi.useFakeTimers({ now: new Date("2026-10-05T12:22:37Z"), toFake: ["Date"] });
  requested = [];
  const record = (body: object) => ({ request }: { request: Request }) => {
    requested.push(new URL(request.url));
    return HttpResponse.json(body);
  };
  server.use(http.get(`${TFL}/Road/:ids/Status`, record(roads)), http.get(`${TFL}/Line/Mode/:modes/Status`, record(lines)));
});

describe("TfL ingestion", () => {
  it("asks for every corridor once, and every rail mode", async () => {
    await handler();

    const paths = requested.map((url) => decodeURIComponent(url.pathname));
    expect(paths).toContain("/Road/a4,a1,a10,a406,a12,a13,a2,a21,a23,a3,a40,a316/Status");
    expect(paths).toContain("/Line/Mode/tube,overground,dlr,elizabeth-line/Status");
  });

  it("stores each road with a numeric score for the charts, on the current quarter hour", async () => {
    await handler();

    const roadItems = written().filter((item) => item.pk.startsWith("ROAD#"));
    expect(roadItems).toEqual([
      { pk: "ROAD#a1", sk: "2026-10-05T12:15", name: "A1", severity: "Good", description: "No Exceptional Delays", score: 0 },
      { pk: "ROAD#a10", sk: "2026-10-05T12:15", name: "A10", severity: "Serious", description: "Serious Delays", score: 3 },
      // A severity TfL adds later must not break the ingestion
      { pk: "ROAD#a12", sk: "2026-10-05T12:15", name: "A12", severity: "Unknown", description: "?", score: null },
    ]);
  });

  it("stores one history row per line, with all its statuses", async () => {
    await handler();

    expect(written().find((item) => item.pk === "LINE#northern")).toEqual({
      pk: "LINE#northern",
      sk: "2026-10-05T12:15",
      name: "Northern",
      mode: "tube",
      statuses: [
        { severity: 9, description: "Minor Delays", reason: "Train fault" },
        { severity: 10, description: "Good Service", reason: null },
      ],
    });
  });

  it("stores the full snapshot of the lines in a single item", async () => {
    const result = await handler();

    const latest = written().find((item) => item.pk === "LINES#latest");
    expect(latest).toMatchObject({ sk: "latest", ts: "2026-10-05T12:15" });
    expect(latest?.lines.map((line: { id: string }) => line.id)).toEqual(["northern", "dlr"]);
    // 3 roads + 2 lines + the snapshot
    expect(result).toEqual({ ok: true, count: 6 });
  });

  it("writes nothing when TfL fails", async () => {
    server.use(http.get(`${TFL}/Road/:ids/Status`, () => new HttpResponse(null, { status: 500 })));

    await expect(handler()).rejects.toThrow("HTTP 500 from api.tfl.gov.uk");
    expect(ddbMock.commandCalls(BatchWriteCommand)).toHaveLength(0);
  });
});
