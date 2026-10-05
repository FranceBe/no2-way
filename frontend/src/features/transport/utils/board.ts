import type { Arrival } from '@no2-way/shared'

// Time left as shown on a station board: "Due", "1 min", "4 mins"
export function formatDue(minutes: number): string {
    if (minutes === 0) return 'Due'
    return `${minutes} min${minutes === 1 ? '' : 's'}`
}

export interface PlatformDepartures {
    platform: string
    departures: Arrival[]
}

// Arrivals grouped by platform, platforms sorted by name, at most `limit`
// departures per platform, soonest first
export function byPlatform(
    arrivals: Arrival[],
    limit = 3
): PlatformDepartures[] {
    const groups = new Map<string, Arrival[]>()

    for (const arrival of arrivals) {
        const { platform } = arrival
        const list = groups.get(platform) ?? []
        list.push(arrival)
        groups.set(platform, list)
    }

    return [...groups]
        .sort(([platformA], [platformB]) => platformA.localeCompare(platformB))
        .map(([platform, departures]) => ({
            platform,
            departures: departures
                .sort((a, b) => a.minutes - b.minutes)
                .slice(0, limit),
        }))
}
