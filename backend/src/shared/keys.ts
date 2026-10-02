// Partition keys: a prefix identifies the type of data
export const airKey = (locationId: string): string => `AIR#${locationId}`;
export const roadKey = (corridor: string): string => `ROAD#${corridor.toLowerCase()}`;
export const lineKey = (lineId: string): string => `LINE#${lineId}`;

// Single item holding the latest snapshot of all lines
export const LINES_LATEST = { pk: "LINES#latest", sk: "latest" } as const;

// "2026-10-02T14:00", in UTC
export const toMinute = (date: Date): string => date.toISOString().slice(0, 16);

// 14:22:37 -> 14:15:00
export const floorToQuarter = (date: Date): Date => {
  const copy = new Date(date);
  copy.setUTCMinutes(Math.floor(copy.getUTCMinutes() / 15) * 15, 0, 0);
  return copy;
};