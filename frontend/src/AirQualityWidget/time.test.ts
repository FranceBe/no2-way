import { describe, expect, it } from "vitest";
import { formatTick, getTimeTicks, parseTs } from "./time";

// Every hour between two UTC timestamps, inclusive
const hourly = (from: string, to: string) => {
  const times: number[] = [];
  for (let t = parseTs(from); t <= parseTs(to); t += 3600e3) times.push(t);
  return times;
};

describe("parseTs", () => {
  it("reads API timestamps as UTC", () => {
    expect(new Date(parseTs("2026-10-05T14:00")).toISOString()).toBe("2026-10-05T14:00:00.000Z");
  });
});

describe("formatTick", () => {
  it("shows London time (BST in October)", () => {
    expect(formatTick(parseTs("2026-10-05T14:00"))).toBe("15:00");
  });

  it("shows the date at London midnight", () => {
    expect(formatTick(parseTs("2026-10-04T23:00"))).toBe("5 Oct");
  });

  it("follows the switch back to GMT", () => {
    expect(formatTick(parseTs("2026-12-01T14:00"))).toBe("14:00");
  });
});

describe("getTimeTicks", () => {
  it("puts a tick every 6 hours over 24h", () => {
    const ticks = getTimeTicks(hourly("2026-10-04T12:00", "2026-10-05T12:00"), 24);
    expect(ticks.map(formatTick)).toEqual(["18:00", "5 Oct", "06:00", "12:00"]);
  });

  it("puts a tick every 12 hours over 48h", () => {
    const ticks = getTimeTicks(hourly("2026-10-03T12:00", "2026-10-05T12:00"), 48);
    expect(ticks.map(formatTick)).toEqual(["4 Oct", "12:00", "5 Oct", "12:00"]);
  });

  it("puts a tick every day over a week", () => {
    const ticks = getTimeTicks(hourly("2026-09-28T12:00", "2026-10-05T12:00"), 168);
    expect(ticks).toHaveLength(7);
    expect(ticks.every((t) => !formatTick(t).includes(":"))).toBe(true);
  });

  it("puts a tick every 5 days over a month", () => {
    const ticks = getTimeTicks(hourly("2026-09-05T12:00", "2026-10-05T12:00"), 720);
    expect(ticks.map(formatTick)).toEqual(["6 Sept", "11 Sept", "16 Sept", "21 Sept", "26 Sept", "1 Oct"]);
  });
});
