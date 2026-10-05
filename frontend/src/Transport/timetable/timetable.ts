import type { Schedule } from '@no2-way/shared'

const DAYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
]

// Trains before 04:00 belong to the previous day's service: at 00:30 on a
// Saturday, the last train is Friday's
const SERVICE_DAY_START_HOUR = 4

// Timetables follow London time, whatever the browser's time zone
const londonParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    hour: 'numeric',
    hourCycle: 'h23',
})

// Day of the service running at `date`: 0 = Sunday … 6 = Saturday
function serviceDay(date: Date): number {
    const parts = londonParts.formatToParts(date)
    const part = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? ''
    const day = DAYS.indexOf(part('weekday').toLowerCase())
    return Number(part('hour')) < SERVICE_DAY_START_HOUR ? (day + 6) % 7 : day
}

// TfL names schedules after the days they cover: "Monday - Thursday",
// "Friday", "Saturday (also Good Friday)"… Brackets are ignored.
// Returns [first, last] day, or null for a name that is not a day range
function dayRange(name: string): [number, number] | null {
    const [from, to = from] = name
        .replace(/\(.*\)/, '')
        .split('-')
        .map((day) => DAYS.indexOf(day.trim().toLowerCase()))
    return from >= 0 && to >= 0 ? [from, to] : null
}

const covers = ([from, to]: [number, number], day: number) =>
    // "Saturday - Sunday" wraps around the end of the week
    from <= to ? from <= day && day <= to : day >= from || day <= to

// The schedule of the service running at `date`, or undefined if none covers it
export function scheduleForDate(
    schedules: Schedule[],
    date: Date
): Schedule | undefined {
    const day = serviceDay(date)
    return schedules.find((schedule) => {
        const range = dayRange(schedule.name)
        return range !== null && covers(range, day)
    })
}
