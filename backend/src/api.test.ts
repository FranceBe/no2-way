import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "./api";
import { LOCATIONS } from "./shared/locations";
import { ddbMock } from "./test/ddb";
import { apiEvent, parse } from "./test/events";
import { server } from "./test/server";

const call = async (path: string, query?: Record<string, string>) => parse(await handler(apiEvent(path, query)));

beforeEach(() => {
  ddbMock.reset();
  // Errors are logged on purpose: keep the test output clean
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("api handler", () => {
  it("answers with JSON", async () => {
    const result = await handler(apiEvent("/locations"));
    expect(result).toMatchObject({ statusCode: 200, headers: { "content-type": "application/json" } });
  });

  it("serves the locations", async () => {
    expect(await call("/locations")).toEqual({ statusCode: 200, body: LOCATIONS });
  });

  it("routes to the endpoint's handler, with the query parameters", async () => {
    ddbMock.on(GetCommand).resolves({ Item: { ts: "2026-10-05T12:00", lines: [] } });
    expect(await call("/lines")).toEqual({ statusCode: 200, body: { ts: "2026-10-05T12:00", lines: [] } });
  });

  it("works without any query string", async () => {
    // API Gateway omits queryStringParameters when there is none
    expect(await call("/lines/history")).toEqual({
      statusCode: 400,
      body: { error: "Invalid or missing line" },
    });
  });

  it("answers 404 for an unknown path", async () => {
    expect(await call("/nope")).toEqual({ statusCode: 404, body: { error: "Not found" } });
  });

  it("returns the status and message of an expected error", async () => {
    expect(await call("/air", { location: "atlantis" })).toEqual({
      statusCode: 400,
      body: { error: "Unknown or missing location" },
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("answers 502 when an external API is down, and logs the details", async () => {
    server.use(http.get("https://api.open-meteo.com/v1/forecast", () => new HttpResponse(null, { status: 500 })));

    expect(await call("/weather", { location: "camden" })).toEqual({
      statusCode: 502,
      body: { error: "Upstream service unavailable" },
    });
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ message: "HTTP 500 from api.open-meteo.com" }));
  });

  it("hides the details of an unexpected error", async () => {
    ddbMock.on(QueryCommand).rejects(new Error("AccessDeniedException: arn:aws:dynamodb:secret"));

    const { statusCode, body } = await call("/air", { location: "camden" });

    expect(statusCode).toBe(500);
    expect(body).toEqual({ error: "Internal error" });
    expect(console.error).toHaveBeenCalled();
  });
});
