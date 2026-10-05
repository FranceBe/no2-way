import type { Line, LineHistoryEntry, LineStatus } from '@no2-way/shared'
import { disruptionRank, isDisruption } from './severity'

// One continuous disruption of a line, rebuilt from its 15-minute snapshots
export interface Incident {
    start: string // ts of the first disrupted snapshot
    end: string | null // ts of the first snapshot back to normal; null = still going on
    severity: number // TfL code of the worst status seen during the incident
    description: string // description of that worst status, e.g. "Severe Delays"
    reasons: string[] // distinct reasons, in order of first appearance
}

// True when at least one status is a disruption
export function isDisrupted(statuses: LineStatus[]): boolean {
    return statuses.some(isDisruption)
}

// How bad the worst status of a line is (see disruptionRank)
const worstRank = (line: Line): number =>
    Math.max(...line.statuses.map((status) => disruptionRank(status.severity)))

// The lines disrupted now, worst first, then by name
export function disruptedLines(lines: Line[]): Line[] {
    return lines
        .filter((line) => isDisrupted(line.statuses))
        .sort(
            (a, b) =>
                worstRank(b) - worstRank(a) || a.name.localeCompare(b.name)
        )
}

// `history` comes from GET /lines/history: one entry every 15 min, oldest first
export function toIncidents(history: LineHistoryEntry[]): Incident[] {
    const incidents: Incident[] = []
    let current: Incident | null = null

    for (const entry of history) {
        const disruptions = entry.statuses.filter(isDisruption)

        // Back to normal: this snapshot closes the incident going on, if any
        if (disruptions.length === 0) {
            if (current) current.end = entry.ts
            current = null
            continue
        }

        // The gravest status of this snapshot (ties: the first one listed)
        const worst = disruptions.reduce((worstSoFar, status) =>
            disruptionRank(status.severity) >
            disruptionRank(worstSoFar.severity)
                ? status
                : worstSoFar
        )

        // First disrupted snapshot after a quiet period: open an incident
        if (!current) {
            current = {
                start: entry.ts,
                end: null,
                severity: worst.severity,
                description: worst.description,
                reasons: [],
            }
            incidents.push(current)
        } else if (
            disruptionRank(worst.severity) > disruptionRank(current.severity)
        ) {
            current.severity = worst.severity
            current.description = worst.description
        }

        for (const { reason } of disruptions) {
            if (reason && !current.reasons.includes(reason)) {
                current.reasons.push(reason)
            }
        }
    }

    return incidents
}
