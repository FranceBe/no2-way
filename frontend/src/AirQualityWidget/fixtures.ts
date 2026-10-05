import type { AirReading } from '@no2-way/shared'

// Deterministic data for stories and tests (same shape as GET /air)

// Small seeded PRNG so every render gets the same numbers
function seededRandom(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const round1 = (n: number) => Math.round(n * 10) / 10

interface FixtureOptions {
    hours?: number
    end?: string // last reading, UTC
    scale?: number // multiplies every pollutant (1 = typical London day)
    episode?: { hoursAgo: number; duration: number; boost: number } // pollution spike
    gapEvery?: number // every Nth reading has no data
    seed?: number
}

export function makeAirReadings({
    hours = 48,
    end = '2026-10-05T12:00',
    scale = 1,
    episode,
    gapEvery,
    seed = 42,
}: FixtureOptions = {}): AirReading[] {
    const rand = seededRandom(seed)
    const endTime = Date.parse(`${end}Z`)
    const readings: AirReading[] = []

    for (let i = hours; i >= 0; i--) {
        const time = endTime - i * 3600e3
        const hour = new Date(time).getUTCHours()
        // Rush-hour peaks around 8:00 and 18:00
        const rush =
            Math.exp(-((hour - 8) ** 2) / 4) + Math.exp(-((hour - 18) ** 2) / 4)
        // Smooth bump centred on the episode
        const bump = episode
            ? episode.boost *
              Math.exp(
                  -(((i - episode.hoursAgo) / (episode.duration / 2)) ** 2)
              )
            : 0
        const factor = scale * (1 + bump)
        const missing = gapEvery !== undefined && i % gapEvery === 0

        const no2 = round1((12 + rush * 25 + rand() * 6) * factor)
        readings.push({
            ts: new Date(time).toISOString().slice(0, 16),
            grid: '51.50,-0.10',
            pm2_5: missing
                ? null
                : round1((5 + rush * 6 + rand() * 3) * factor),
            pm10: missing
                ? null
                : round1((10 + rush * 9 + rand() * 4) * factor),
            nitrogen_dioxide: missing ? null : no2,
            ozone: missing
                ? null
                : round1(Math.max(5, 55 - no2 / factor + rand() * 8)),
            european_aqi: missing
                ? null
                : Math.round((15 + rush * 20 + rand() * 8) * factor),
        })
    }
    return readings
}
