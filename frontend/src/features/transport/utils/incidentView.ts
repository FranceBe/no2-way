import { parseTs } from '@/shared/time'
import type { Incident } from './incidents'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Three ordered levels are enough to read a week at a glance; the exact TfL
// description ("Reduced Service", "Part Suspended"…) stays in the tooltip and the table
export type DisruptionLevel = 'minor' | 'severe' | 'closure'

export const DISRUPTION_LEVELS: { level: DisruptionLevel; label: string }[] = [
    { level: 'minor', label: 'Minor disruption' },
    { level: 'severe', label: 'Severe disruption' },
    { level: 'closure', label: 'Suspension or closure' },
]

// TfL severities: 7-9 delays / reduced service, 6 severe delays,
// 5 and below part or full suspensions and closures
export const disruptionLevel = (severity: number): DisruptionLevel =>
    severity >= 7 ? 'minor' : severity === 6 ? 'severe' : 'closure'

// An ongoing incident lasts until `now`
export const incidentSpan = (incident: Incident, now: number) => {
    const start = parseTs(incident.start)
    const end = incident.end === null ? now : parseTs(incident.end)
    return { start, end, duration: Math.max(end - start, 0) }
}

// "45 min", "2 h", "2 h 15", "1 d 3 h"
export function formatDuration(ms: number): string {
    const minutes = Math.round(ms / MINUTE)
    if (minutes < 60) return `${minutes} min`

    const days = Math.floor(minutes / (24 * 60))
    const hours = Math.floor((minutes % (24 * 60)) / 60)
    const rest = minutes % 60
    if (days > 0) return hours > 0 ? `${days} d ${hours} h` : `${days} d`
    return rest > 0
        ? `${hours} h ${String(rest).padStart(2, '0')}`
        : `${hours} h`
}

export interface IncidentSummary {
    count: number
    disrupted: number // ms, all incidents together
    share: number // of the window, 0-1
    longest: Incident | null
    longestDuration: number // ms
    ongoing: Incident | null
}

// Headline numbers over a window of `windowMs` ending at `now`
export function summarizeIncidents(
    incidents: Incident[],
    now: number,
    windowMs = 7 * DAY
): IncidentSummary {
    let disrupted = 0
    let longest: Incident | null = null
    let longestDuration = -1

    for (const incident of incidents) {
        const { duration } = incidentSpan(incident, now)
        disrupted += duration
        if (duration > longestDuration) {
            longest = incident
            longestDuration = duration
        }
    }

    return {
        count: incidents.length,
        disrupted,
        share: Math.min(disrupted / windowMs, 1),
        longest,
        longestDuration: Math.max(longestDuration, 0),
        ongoing: incidents.find((incident) => incident.end === null) ?? null,
    }
}
