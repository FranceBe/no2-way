import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "./ingest";
import { LOCATIONS } from "./shared/locations";
import { ddbMock } from "./test/ddb";
import { server } from "./test/server";

const HOURS = ["2026-10-05T09:00", "2026-10-05T10:00", "2026-10-05T11:00", "2026-10-05T12:00", "2026-10-05T13:00"];

// Every item written to the table
const written = () =>
  ddbMock
    .commandCalls(BatchWriteCommand)
    .flatMap((call) => call.args[0].input.RequestItems!["test-table"].map((r) => r.PutRequest!.Item!));

let requested: URL[] = [];

beforeEach(() => {
  ddbMock.reset();
  ddbMock.on(BatchWriteCommand).resolves({});
  vi.useFakeTimers({ now: new Date("2026-10-05T12:30:00Z"), toFake: ["Date"] });
  requested = [];
  server.use(
    http.get("https://air-quality-api.open-meteo.com/v1/air-quality", ({ request }) => {
      const url = new URL(request.url);
      requested.push(url);
      // The model answers with the centre of its grid cell, not the requested point
      return HttpResponse.json({
        latitude: Number(url.searchParams.get("latitude")) + 0.0012,
        longitude: Number(url.searchParams.get("longitude")) - 0.0049,
        hourly: {
          time: HOURS,
          pm2_5: [1, 2, 3, 4, 5],
          pm10: [6, 7, 8, 9, 10],
          nitrogen_dioxide: [11, 12, null, 14, 15],
          ozone: [16, 17, 18, 19, 20],
          european_aqi: [21, 22, 23, 24, 25],
        },
      });
    })
  );
});

describe("air quality ingestion", () => {
  it("fetches the pollutants of every location", async () => {
    await handler();

    expect(requested).toHaveLength(LOCATIONS.length);
    expect(requested[0].searchParams.get("hourly")).toBe("pm2_5,pm10,nitrogen_dioxide,ozone,european_aqi");
  });

  it("writes the last 3 hours only, nothing from the forecast", async () => {
    const result = await handler();

    const camden = written().filter((item) => item.pk === "AIR#camden");
    expect(camden.map((item) => item.sk)).toEqual(["2026-10-05T10:00", "2026-10-05T11:00", "2026-10-05T12:00"]);
    expect(result).toEqual({ ok: true, count: 3 * LOCATIONS.length });
  });

  it("stores each hour with its grid cell, keeping missing values as null", async () => {
    await handler();

    expect(written().find((item) => item.pk === "AIR#camden" && item.sk === "2026-10-05T11:00")).toEqual({
      pk: "AIR#camden",
      sk: "2026-10-05T11:00",
      grid: "51.54,-0.15",
      pm2_5: 3,
      pm10: 8,
      nitrogen_dioxide: null,
      ozone: 18,
      european_aqi: 23,
    });
  });

  it("writes nothing when a location fails, so the next run fills the gap", async () => {
    server.use(
      http.get("https://air-quality-api.open-meteo.com/v1/air-quality", () => new HttpResponse(null, { status: 429 }))
    );

    await expect(handler()).rejects.toThrow("HTTP 429 from air-quality-api.open-meteo.com");
    expect(ddbMock.commandCalls(BatchWriteCommand)).toHaveLength(0);
  });
});
