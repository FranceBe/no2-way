import { describe, expect, it } from "vitest";
import { CloudIcon } from "./CloudIcon";
import { CloudMoonIcon } from "./CloudMoonIcon";
import { CloudSunIcon } from "./CloudSunIcon";
import { DrizzleIcon } from "./DrizzleIcon";
import { FogIcon } from "./FogIcon";
import { getWeatherDisplay } from "./getWeatherDisplay";
import { MoonIcon } from "./MoonIcon";
import { RainIcon } from "./RainIcon";
import { SnowIcon } from "./SnowIcon";
import { SunIcon } from "./SunIcon";
import { ThunderstormIcon } from "./ThunderstormIcon";

describe("getWeatherDisplay", () => {
  it.each([
    // [WMO code, isDay, expected icon, expected label]
    [0, true, SunIcon, "Clear sky"],
    [0, false, MoonIcon, "Clear sky"],
    [1, true, CloudSunIcon, "Mainly clear"],
    [1, false, CloudMoonIcon, "Mainly clear"],
    [2, true, CloudSunIcon, "Partly cloudy"],
    [2, false, CloudMoonIcon, "Partly cloudy"],
    [3, true, CloudIcon, "Overcast"],
    [45, true, FogIcon, "Fog"],
    [48, true, FogIcon, "Fog"],
    [51, true, DrizzleIcon, "Drizzle"],
    [57, true, DrizzleIcon, "Drizzle"],
    [61, true, RainIcon, "Rain"],
    [65, true, RainIcon, "Rain"],
    [66, true, RainIcon, "Freezing rain"],
    [67, true, RainIcon, "Freezing rain"],
    [71, true, SnowIcon, "Snow"],
    [77, true, SnowIcon, "Snow"],
    [80, true, RainIcon, "Rain showers"],
    [82, true, RainIcon, "Rain showers"],
    [85, true, SnowIcon, "Snow showers"],
    [86, true, SnowIcon, "Snow showers"],
    [95, true, ThunderstormIcon, "Thunderstorm"],
    [99, true, ThunderstormIcon, "Thunderstorm"],
  ])("code %i (isDay=%s) -> %o, %s", (code, isDay, Icon, label) => {
    expect(getWeatherDisplay(code, isDay)).toEqual({ Icon, label });
  });

  it("only uses night icons for clear and partly cloudy skies", () => {
    expect(getWeatherDisplay(63, false).Icon).toBe(RainIcon);
    expect(getWeatherDisplay(3, false).Icon).toBe(CloudIcon);
  });

  it.each([4, 50, 58, 90, 100, -1])("falls back to an unknown cloud for code %i", (code) => {
    expect(getWeatherDisplay(code, true)).toEqual({ Icon: CloudIcon, label: "Unknown" });
  });
});
