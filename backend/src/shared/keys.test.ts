import { describe, expect, it } from "vitest";
import { airKey, floorToQuarter, lineKey, roadKey, toMinute } from "./keys";

describe("partition keys", () => {
  it("prefixes each type of data", () => {
    expect(airKey("camden")).toBe("AIR#camden");
    expect(lineKey("northern")).toBe("LINE#northern");
  });

  it("lower-cases road corridors, as TfL returns them upper-cased", () => {
    expect(roadKey("A1")).toBe("ROAD#a1");
  });
});

describe("toMinute", () => {
  it("formats a date to the minute, in UTC", () => {
    expect(toMinute(new Date("2026-10-02T14:22:37.123Z"))).toBe("2026-10-02T14:22");
  });
});

describe("floorToQuarter", () => {
  it.each([
    ["2026-10-02T14:22:37Z", "2026-10-02T14:15"],
    ["2026-10-02T14:00:00Z", "2026-10-02T14:00"],
    ["2026-10-02T14:59:59Z", "2026-10-02T14:45"],
  ])("floors %s to %s", (input, expected) => {
    expect(toMinute(floorToQuarter(new Date(input)))).toBe(expected);
  });

  it("does not mutate the date it is given", () => {
    const date = new Date("2026-10-02T14:22:37Z");
    floorToQuarter(date);
    expect(date.toISOString()).toBe("2026-10-02T14:22:37.000Z");
  });
});
