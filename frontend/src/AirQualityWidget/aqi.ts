import type { AirReading } from "../api/types";

// ---------- European AQI levels (EEA scale, as returned by Open-Meteo) ----------

export type AqiLevelId = "good" | "fair" | "moderate" | "poor" | "very-poor" | "extremely-poor";

export interface AqiLevel {
  id: AqiLevelId;
  label: string;
  min: number; // inclusive
  max: number; // exclusive
}

export const AQI_LEVELS: AqiLevel[] = [
  { id: "good", label: "Good", min: 0, max: 20 },
  { id: "fair", label: "Fair", min: 20, max: 40 },
  { id: "moderate", label: "Moderate", min: 40, max: 60 },
  { id: "poor", label: "Poor", min: 60, max: 80 },
  { id: "very-poor", label: "Very poor", min: 80, max: 100 },
  { id: "extremely-poor", label: "Extremely poor", min: 100, max: Infinity },
];

// From this value on, the air is considered bad and highlighted on the chart
export const POOR_THRESHOLD = 60;

export function getAqiLevel(aqi: number): AqiLevel {
  return AQI_LEVELS.find((level) => aqi < level.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1];
}

// ---------- Pollutants ----------

export type PollutantKey = "pm2_5" | "pm10" | "nitrogen_dioxide" | "ozone";

export interface Pollutant {
  key: PollutantKey;
  label: string; // chemical symbol, as shown on the chart
  name: string; // plain-language name for non-experts
  description: string; // what it is, where it comes from, why it matters
  unit: string;
  // WHO 2021 guideline (24h mean, 8h for ozone). Compared to hourly values,
  // so it is an indication, not a regulatory breach
  whoGuideline: number;
  whoPeriod: string;
}

export const POLLUTANTS: Pollutant[] = [
  {
    key: "nitrogen_dioxide",
    label: "NO₂",
    name: "Nitrogen dioxide",
    description:
      "A gas mostly from road traffic, especially diesel engines. It irritates the airways and worsens asthma. Highest near busy roads at rush hour.",
    unit: "µg/m³",
    whoGuideline: 25,
    whoPeriod: "24-hour average",
  },
  {
    key: "pm2_5",
    label: "PM2.5",
    name: "Fine particles",
    description:
      "Tiny particles, about 30 times thinner than a hair, from engines, wood burning and industry. Small enough to reach deep into the lungs and the blood.",
    unit: "µg/m³",
    whoGuideline: 15,
    whoPeriod: "24-hour average",
  },
  {
    key: "pm10",
    label: "PM10",
    name: "Coarse particles",
    description:
      "Larger particles such as dust, brake and tyre wear, and building work. They get stuck in the nose and throat and can irritate the airways.",
    unit: "µg/m³",
    whoGuideline: 45,
    whoPeriod: "24-hour average",
  },
  {
    key: "ozone",
    label: "O₃",
    name: "Ozone",
    description:
      "Not released directly: it forms in sunlight from traffic and industrial pollution, so it is often higher on sunny afternoons. It irritates the lungs and eyes.",
    unit: "µg/m³",
    whoGuideline: 100,
    whoPeriod: "8-hour average",
  },
];

// ---------- Summary of a series ----------

export interface AirSummary {
  latest: AirReading | null;
  peak: AirReading | null;
  hoursPoorOrWorse: number;
  hoursWithData: number;
}

// Readings without an AQI value are ignored
export function summarize(readings: AirReading[]): AirSummary {
  let latest: AirReading | null = null;
  let peak: AirReading | null = null;
  let hoursPoorOrWorse = 0;
  let hoursWithData = 0;

  for (const reading of readings) {
    const aqi = reading.european_aqi;
    if (aqi === null) continue;
    hoursWithData++;
    if (aqi >= POOR_THRESHOLD) hoursPoorOrWorse++;
    if (!peak || aqi > peak.european_aqi!) peak = reading;
    latest = reading; // readings are sorted oldest first
  }

  return { latest, peak, hoursPoorOrWorse, hoursWithData };
}
