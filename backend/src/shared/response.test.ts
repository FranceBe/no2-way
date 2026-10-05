import { describe, expect, it, vi } from "vitest";
import { HttpError, json, LINE_ID, requireLocation, requireParam, sinceFrom, STOP_ID } from "./response";

describe("json", () => {
  it("builds a JSON response", () => {
    expect(json(200, { ok: true })).toEqual({
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: '{"ok":true}',
    });
  });
});

describe("requireLocation", () => {
  it("returns the known location", () => {
    expect(requireLocation({ location: "camden" })).toMatchObject({ name: "Camden", corridor: "a1" });
  });

  it.each([{}, { location: "atlantis" }, { location: "" }])("rejects %j with a 400", (query) => {
    expect(() => requireLocation(query)).toThrow(new HttpError(400, "Unknown or missing location"));
  });
});

describe("requireParam", () => {
  it("returns a value matching the pattern", () => {
    expect(requireParam({ line: "hammersmith-city" }, "line", LINE_ID)).toBe("hammersmith-city");
    expect(requireParam({ stop: "940GZZLUKSX" }, "stop", STOP_ID)).toBe("940GZZLUKSX");
  });

  // These values end up in TfL URLs: anything that could change the path is refused
  it.each(["", "Northern", "../Road", "northern?x=1", "a".repeat(41)])("rejects line %j", (line) => {
    expect(() => requireParam({ line }, "line", LINE_ID)).toThrow(
      expect.objectContaining({ status: 400, message: "Invalid or missing line" })
    );
  });

  it("rejects a missing value", () => {
    expect(() => requireParam({}, "stop", STOP_ID)).toThrow("Invalid or missing stop");
  });
});

describe("sinceFrom", () => {
  const now = new Date("2026-10-05T12:30:00Z");

  it.each([
    [undefined, "2026-10-03T12:30"], // default: 48h
    ["24", "2026-10-04T12:30"],
    ["abc", "2026-10-03T12:30"], // invalid: default
    ["0", "2026-10-03T12:30"], // 0 is not a window: default
    ["9999", "2026-09-05T12:30"], // capped at 30 days
  ])("hours=%s starts at %s", (hours, expected) => {
    vi.useFakeTimers({ now });
    expect(sinceFrom(hours)).toBe(expected);
  });

  it("uses the endpoint's own default", () => {
    vi.useFakeTimers({ now });
    expect(sinceFrom(undefined, 24 * 7)).toBe("2026-09-28T12:30");
  });
});
