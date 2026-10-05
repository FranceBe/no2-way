import type { Line, LineHistoryEntry, LineStatus } from '@no2-way/shared'

// TfL severities: 10 = Good Service, 20 = Service Closed (planned, e.g. at
// night), 18-19 = information. Anything below 10 is a disruption (delays,
// suspensions, part closures…)
export const GOOD_SERVICE = 10

// One continuous disruption of a line, rebuilt from its 15-minute snapshots
export interface Incident {
    start: string // ts of the first disrupted snapshot
    end: string | null // ts of the first snapshot back to normal; null = still going on
    severity: number // worst (lowest) severity seen during the incident
    description: string // description of that worst status, e.g. "Severe Delays"
    reasons: string[] // distinct reasons, in order of first appearance
}

// True when at least one status is a disruption
export function isDisrupted(statuses: LineStatus[]): boolean {
    return statuses.some((status) => status.severity < GOOD_SERVICE)
}

// Worst (lowest) severity among the statuses of a line
const worstSeverity = (line: Line): number =>
    Math.min(...line.statuses.map((status) => status.severity))

// The lines disrupted now, worst first (lowest severity), then by name
export function disruptedLines(lines: Line[]): Line[] {
    return lines
        .filter((line) => isDisrupted(line.statuses))
        .sort(
            (a, b) =>
                worstSeverity(a) - worstSeverity(b) ||
                a.name.localeCompare(b.name)
        )
}

// `history` comes from GET /lines/history: one entry every 15 min, oldest first
export function toIncidents(history: LineHistoryEntry[]): Incident[] {
    const incidents: Incident[] = []
    let current: Incident | null = null

    for (const entry of history) {
        const disruptions = entry.statuses.filter(
            (status) => status.severity < GOOD_SERVICE
        )

        // Back to normal: this snapshot closes the incident going on, if any
        if (disruptions.length === 0) {
            if (current) current.end = entry.ts
            current = null
            continue
        }

        // First disrupted snapshot after a quiet period: open an incident
        if (!current) {
            current = {
                start: entry.ts,
                end: null,
                severity: Infinity,
                description: '',
                reasons: [],
            }
            incidents.push(current)
        }

        for (const status of disruptions) {
            if (status.severity < current.severity) {
                current.severity = status.severity
                current.description = status.description
            }
            if (status.reason && !current.reasons.includes(status.reason)) {
                current.reasons.push(status.reason)
            }
        }
    }

    return incidents
}
