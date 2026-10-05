// Timestamps from the API are UTC hours ("2026-10-02T14:00"); they are shown in London time
const TIME_ZONE = "Europe/London";

export const parseTs = (ts: string): number => Date.parse(`${ts}Z`);

const hourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});
const dayFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const londonHourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

const londonHour = (time: number) => Number(londonHourFormat.format(time));

export const formatHour = (time: number) => hourFormat.format(time);
export const formatDateTime = (time: number) => dateTimeFormat.format(time);

// Axis label: the date at midnight, the hour otherwise
export const formatTick = (time: number) =>
  londonHour(time) === 0 ? dayFormat.format(time) : hourFormat.format(time);

// Picks round hours as ticks so the axis keeps ~4-7 labels whatever the range
export function getTimeTicks(times: number[], hours: number): number[] {
  const stepHours = hours <= 24 ? 6 : hours <= 48 ? 12 : 24;
  const everyNthDay = hours > 7 * 24 ? 5 : 1;
  let midnights = 0;

  return times.filter((time) => {
    const hour = londonHour(time);
    if (hour % stepHours !== 0) return false;
    if (stepHours < 24) return true;
    return midnights++ % everyNthDay === 0;
  });
}

export const RANGES = [
  { hours: 24, label: "24h" },
  { hours: 48, label: "48h" },
  { hours: 7 * 24, label: "7d" },
  { hours: 30 * 24, label: "30d" },
];
