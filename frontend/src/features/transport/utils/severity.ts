import type { LineStatus } from '@no2-way/shared'

// Three ordered levels are enough to read the lines at a glance; the exact TfL
// description ("Part Suspended", "Diverted"…) stays next to the colour
export type DisruptionLevel = 'minor' | 'severe' | 'closure'

export const DISRUPTION_LEVELS: { level: DisruptionLevel; label: string }[] = [
    { level: 'minor', label: 'Minor disruption' },
    { level: 'severe', label: 'Severe disruption' },
    { level: 'closure', label: 'Suspension or closure' },
]

// Every TfL line severity (GET https://api.tfl.gov.uk/Line/Meta/Severity).
// The codes are not ordered by gravity: 16 Not Running is worse than 9 Minor
// Delays, 0 Special Service is no incident at all. null = not a disruption
const LEVEL_BY_SEVERITY: Record<number, DisruptionLevel | null> = {
    0: null, // Special Service
    1: 'closure', // Closed
    2: 'closure', // Suspended
    3: 'closure', // Part Suspended
    4: 'closure', // Planned Closure
    5: 'closure', // Part Closure
    6: 'severe', // Severe Delays
    7: 'minor', // Reduced Service
    8: 'closure', // Bus Service (rail replacement: no trains)
    9: 'minor', // Minor Delays
    10: null, // Good Service
    11: 'closure', // Part Closed
    12: 'minor', // Exit Only
    13: 'minor', // No Step Free Access
    14: 'minor', // Change of frequency
    15: 'minor', // Diverted
    16: 'closure', // Not Running
    17: 'minor', // Issues Reported
    18: null, // No Issues
    19: null, // Information
    20: null, // Service Closed (planned, e.g. at night)
}

// A code TfL adds later is shown rather than hidden: its description says what it is
export const disruptionLevel = (severity: number): DisruptionLevel | null =>
    severity in LEVEL_BY_SEVERITY ? LEVEL_BY_SEVERITY[severity] : 'minor'

const RANK: Record<DisruptionLevel, number> = {
    minor: 1,
    severe: 2,
    closure: 3,
}

// 0 = not a disruption, then higher = worse
export const disruptionRank = (severity: number): number => {
    const level = disruptionLevel(severity)
    return level ? RANK[level] : 0
}

export const isDisruption = (status: LineStatus): boolean =>
    disruptionLevel(status.severity) !== null
