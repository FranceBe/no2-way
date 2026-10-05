// Fake but realistic data for the MSW handlers
import type {
    AirReading,
    Arrival,
    BikePoint,
    Line,
    LineHistoryEntry,
    LineStatus,
    Location,
    RoadReading,
    Stop,
    Timetable,
    Weather,
} from '@no2-way/shared'

// ---------- Helpers ----------

// Seeded random generator: same input -> same data on every reload
export function seededRandom(seed: string): () => number {
    let h = 1779033703 ^ seed.length
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
        h = (h << 13) | (h >>> 19)
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507)
        h = Math.imul(h ^ (h >>> 13), 3266489909)
        h ^= h >>> 16
        return (h >>> 0) / 4294967296
    }
}

const toMinute = (date: Date): string => date.toISOString().slice(0, 16)

const round1 = (n: number): number => Math.round(n * 10) / 10

// ---------- Locations ----------

export const LOCATIONS: Location[] = [
    // Central and north
    {
        id: 'westminster',
        name: 'Westminster',
        lat: 51.497,
        lon: -0.137,
        corridor: 'a4',
    },
    { id: 'camden', name: 'Camden', lat: 51.539, lon: -0.142, corridor: 'a1' },
    {
        id: 'hackney',
        name: 'Hackney',
        lat: 51.545,
        lon: -0.055,
        corridor: 'a10',
    },
    {
        id: 'wembley',
        name: 'Wembley',
        lat: 51.556,
        lon: -0.28,
        corridor: 'a406',
    },
    // East
    {
        id: 'stratford',
        name: 'Stratford',
        lat: 51.542,
        lon: -0.003,
        corridor: 'a12',
    },
    {
        id: 'canary-wharf',
        name: 'Canary Wharf',
        lat: 51.505,
        lon: -0.024,
        corridor: 'a13',
    },
    {
        id: 'greenwich',
        name: 'Greenwich',
        lat: 51.482,
        lon: 0.0,
        corridor: 'a2',
    },
    // South
    {
        id: 'lewisham',
        name: 'Lewisham',
        lat: 51.462,
        lon: -0.014,
        corridor: 'a21',
    },
    {
        id: 'brixton',
        name: 'Brixton',
        lat: 51.461,
        lon: -0.116,
        corridor: 'a23',
    },
    {
        id: 'croydon',
        name: 'Croydon',
        lat: 51.376,
        lon: -0.098,
        corridor: 'a23',
    },
    {
        id: 'wimbledon',
        name: 'Wimbledon',
        lat: 51.421,
        lon: -0.206,
        corridor: 'a3',
    },
    // West
    {
        id: 'hammersmith',
        name: 'Hammersmith',
        lat: 51.493,
        lon: -0.224,
        corridor: 'a4',
    },
    { id: 'ealing', name: 'Ealing', lat: 51.513, lon: -0.305, corridor: 'a40' },
    {
        id: 'richmond',
        name: 'Richmond',
        lat: 51.461,
        lon: -0.303,
        corridor: 'a316',
    },
]

export const findLocation = (id: string | null): Location | undefined =>
    LOCATIONS.find((loc) => loc.id === id)

// The neighbourhood closest to a point (flat-earth distance is fine in London)
export const nearestLocation = (lat: number, lon: number): Location =>
    LOCATIONS.reduce((best, loc) =>
        Math.hypot(loc.lat - lat, loc.lon - lon) <
        Math.hypot(best.lat - lat, best.lon - lon)
            ? loc
            : best
    )

// ---------- Weather ----------

export function weatherFor(loc: Location): Weather {
    const rand = seededRandom(`weather:${loc.id}`)
    const codes = [0, 1, 2, 3, 45, 61, 63, 80]
    return {
        time: toMinute(new Date()),
        temperature: round1(11 + rand() * 6),
        feelsLike: round1(9 + rand() * 6),
        weatherCode: codes[Math.floor(rand() * codes.length)],
        isDay: new Date().getHours() >= 7 && new Date().getHours() < 19,
        precipitation: round1(rand() < 0.3 ? rand() * 2 : 0),
        windSpeed: round1(8 + rand() * 20),
    }
}

// ---------- Lines ----------

const GOOD: LineStatus = {
    severity: 10,
    description: 'Good Service',
    reason: null,
}

// Covers the interesting cases: good service, delays, several statuses at once, closures
export const LINES: Line[] = [
    { id: 'bakerloo', name: 'Bakerloo', mode: 'tube', statuses: [GOOD] },
    { id: 'central', name: 'Central', mode: 'tube', statuses: [GOOD] },
    { id: 'circle', name: 'Circle', mode: 'tube', statuses: [GOOD] },
    {
        id: 'district',
        name: 'District',
        mode: 'tube',
        statuses: [
            {
                severity: 5,
                description: 'Part Closure',
                reason: "District Line: No service between Earl's Court and Wimbledon due to planned engineering work.",
            },
            {
                severity: 9,
                description: 'Minor Delays',
                reason: 'District Line: Minor delays on the rest of the line due to an earlier signal failure.',
            },
        ],
    },
    {
        id: 'hammersmith-city',
        name: 'Hammersmith & City',
        mode: 'tube',
        statuses: [GOOD],
    },
    { id: 'jubilee', name: 'Jubilee', mode: 'tube', statuses: [GOOD] },
    {
        id: 'metropolitan',
        name: 'Metropolitan',
        mode: 'tube',
        statuses: [GOOD],
    },
    {
        id: 'northern',
        name: 'Northern',
        mode: 'tube',
        statuses: [
            {
                severity: 9,
                description: 'Minor Delays',
                reason: 'Northern Line: Minor delays between Camden Town and Morden due to a train fault at Kennington.',
            },
        ],
    },
    { id: 'piccadilly', name: 'Piccadilly', mode: 'tube', statuses: [GOOD] },
    { id: 'victoria', name: 'Victoria', mode: 'tube', statuses: [GOOD] },
    {
        id: 'waterloo-city',
        name: 'Waterloo & City',
        mode: 'tube',
        statuses: [
            {
                severity: 20,
                description: 'Service Closed',
                reason: 'Waterloo & City Line: Service closed on Sundays.',
            },
        ],
    },
    { id: 'dlr', name: 'DLR', mode: 'dlr', statuses: [GOOD] },
    {
        id: 'elizabeth',
        name: 'Elizabeth line',
        mode: 'elizabeth-line',
        statuses: [GOOD],
    },
    { id: 'liberty', name: 'Liberty', mode: 'overground', statuses: [GOOD] },
    {
        id: 'lioness',
        name: 'Lioness',
        mode: 'overground',
        statuses: [
            {
                severity: 6,
                description: 'Severe Delays',
                reason: 'Lioness line: Severe delays between Watford Junction and Euston due to a points failure.',
            },
        ],
    },
    { id: 'mildmay', name: 'Mildmay', mode: 'overground', statuses: [GOOD] },
    {
        id: 'suffragette',
        name: 'Suffragette',
        mode: 'overground',
        statuses: [GOOD],
    },
    { id: 'weaver', name: 'Weaver', mode: 'overground', statuses: [GOOD] },
    { id: 'windrush', name: 'Windrush', mode: 'overground', statuses: [GOOD] },
]

// One snapshot every 15 minutes, with occasional disruptions
export function lineHistory(lineId: string, hours: number): LineHistoryEntry[] {
    const line = LINES.find((l) => l.id === lineId)
    if (!line) return []

    const rand = seededRandom(`history:${lineId}`)
    const now = new Date()
    now.setUTCMinutes(Math.floor(now.getUTCMinutes() / 15) * 15, 0, 0)
    const entries: LineHistoryEntry[] = []

    let disruptionLeft = 0
    let current: LineStatus = GOOD

    for (
        let t = now.getTime() - hours * 3600e3;
        t <= now.getTime();
        t += 15 * 60e3
    ) {
        const hour = new Date(t).getUTCHours()
        if (hour >= 1 && hour < 5) {
            current = {
                severity: 20,
                description: 'Service Closed',
                reason: null,
            }
        } else if (disruptionLeft > 0) {
            disruptionLeft--
        } else if (rand() < 0.02) {
            disruptionLeft = 2 + Math.floor(rand() * 8)
            current =
                rand() < 0.7
                    ? {
                          severity: 9,
                          description: 'Minor Delays',
                          reason: `${line.name}: Minor delays due to a signal failure.`,
                      }
                    : {
                          severity: 6,
                          description: 'Severe Delays',
                          reason: `${line.name}: Severe delays due to a faulty train.`,
                      }
        } else {
            current = GOOD
        }
        entries.push({
            ts: toMinute(new Date(t)),
            name: line.name,
            mode: line.mode,
            statuses: [current],
        })
    }
    return entries
}

// ---------- Stations ----------

// Real positions (rounded), so the bikes around a stop are plausible
const stop = (id: string, name: string, lat: number, lon: number): Stop => ({
    id,
    name: `${name} Underground Station`,
    lat,
    lon,
})

export const STOPS: Record<string, Stop[]> = {
    northern: [
        stop('940GZZLUAGL', 'Angel', 51.5322, -0.1058),
        stop('940GZZLUBNK', 'Bank', 51.5133, -0.0886),
        stop('940GZZLUCTN', 'Camden Town', 51.5392, -0.1426),
        stop('940GZZLUCPN', 'Clapham North', 51.4649, -0.1299),
        stop('940GZZLUEUS', 'Euston', 51.5282, -0.1337),
        stop('940GZZLUKSX', "King's Cross St. Pancras", 51.5304, -0.1239),
        stop('940GZZLULNB', 'London Bridge', 51.5052, -0.0864),
        stop('940GZZLUMDN', 'Morden', 51.4022, -0.1948),
    ],
    victoria: [
        stop('940GZZLUBXN', 'Brixton', 51.4627, -0.1145),
        stop('940GZZLUGPK', 'Green Park', 51.5067, -0.1428),
        stop('940GZZLUKSX', "King's Cross St. Pancras", 51.5304, -0.1239),
        stop('940GZZLUOXC', 'Oxford Circus', 51.5152, -0.1415),
        stop('940GZZLUVIC', 'Victoria', 51.4965, -0.1447),
        stop('940GZZLUWWL', 'Walthamstow Central', 51.583, -0.0195),
    ],
}

// ---------- Arrivals ----------

const PLATFORMS: Record<
    string,
    {
        platform: string
        direction: string
        destination: string
        towards: string
    }[]
> = {
    northern: [
        {
            platform: 'Northbound - Platform 8',
            direction: 'inbound',
            destination: 'Edgware Underground Station',
            towards: 'Edgware via Bank',
        },
        {
            platform: 'Northbound - Platform 8',
            direction: 'inbound',
            destination: 'High Barnet Underground Station',
            towards: 'High Barnet via Bank',
        },
        {
            platform: 'Southbound - Platform 7',
            direction: 'outbound',
            destination: 'Morden Underground Station',
            towards: 'Morden via Bank',
        },
    ],
    victoria: [
        {
            platform: 'Northbound - Platform 4',
            direction: 'inbound',
            destination: 'Walthamstow Central Underground Station',
            towards: 'Walthamstow Central',
        },
        {
            platform: 'Southbound - Platform 3',
            direction: 'outbound',
            destination: 'Brixton Underground Station',
            towards: 'Brixton',
        },
    ],
}

const LINE_NAMES: Record<string, string> = {
    northern: 'Northern',
    victoria: 'Victoria',
}

export function arrivalsFor(
    stop: string,
    line: string | null,
    direction: string | null
): Arrival[] {
    const rand = seededRandom(
        `arrivals:${stop}:${Math.floor(Date.now() / 20_000)}`
    )
    const lines = line ? [line] : Object.keys(PLATFORMS)
    const arrivals: Arrival[] = []

    for (const lineId of lines) {
        for (const p of PLATFORMS[lineId] ?? []) {
            let seconds = Math.floor(rand() * 120)
            for (let i = 0; i < 3; i++) {
                arrivals.push({
                    line: lineId,
                    lineName: LINE_NAMES[lineId] ?? lineId,
                    platform: p.platform,
                    direction: p.direction,
                    destination: p.destination,
                    towards: p.towards,
                    minutes: Math.floor(seconds / 60),
                    expected: new Date(
                        Date.now() + seconds * 1000
                    ).toISOString(),
                })
                seconds += 120 + Math.floor(rand() * 240)
            }
        }
    }

    return arrivals
        .filter((a) => !direction || a.direction === direction)
        .sort((a, b) => a.minutes - b.minutes)
}

// ---------- Timetable ----------

export function timetableFor(
    line: string,
    stop: string,
    direction: string
): Timetable {
    return {
        line,
        stop,
        direction,
        schedules: [
            { name: 'Monday - Thursday', first: '05:42', last: '00:31' },
            { name: 'Friday', first: '05:42', last: '00:34' },
            {
                name: 'Saturday (also Good Friday)',
                first: '05:54',
                last: '00:29',
            },
            { name: 'Sunday', first: '07:01', last: '23:48' },
        ],
    }
}

// ---------- Bikes ----------

// Docks around a neighbourhood or any point (a stop); `area` names them
export function bikesNear(
    center: { lat: number; lon: number },
    area: string,
    radius: number
): BikePoint[] {
    const rand = seededRandom(`bikes:${center.lat},${center.lon}`)
    const streets = [
        'High Street',
        'Road',
        'Square',
        'Station',
        'Park',
        'Lane',
        'Market',
        'Gardens',
    ]
    const points: BikePoint[] = []

    for (let i = 0; i < 12; i++) {
        const distance = Math.round(60 + rand() * 1500)
        if (distance > radius) continue
        const angle = rand() * 2 * Math.PI
        const docks = 15 + Math.floor(rand() * 25)
        const bikes = Math.floor(rand() * docks)
        points.push({
            id: `BikePoints_${1000 + i}`,
            name: `${streets[i % streets.length]}, ${area}`,
            lat: center.lat + (distance / 111_000) * Math.cos(angle),
            lon: center.lon + (distance / 69_000) * Math.sin(angle),
            bikes,
            emptyDocks: docks - bikes,
            docks,
            distance,
        })
    }
    return points.sort((a, b) => a.distance - b.distance)
}

// ---------- Air quality ----------

// Same zones as the real Open-Meteo grid: several locations share identical data
const GRID: Record<string, string> = {
    westminster: '51.50,-0.10',
    camden: '51.50,-0.10',
    hackney: '51.50,-0.10',
    brixton: '51.50,-0.10',
    stratford: '51.50,0.00',
    'canary-wharf': '51.50,0.00',
    greenwich: '51.50,0.00',
    lewisham: '51.50,0.00',
    hammersmith: '51.50,-0.20',
    ealing: '51.50,-0.30',
    richmond: '51.50,-0.30',
    wembley: '51.60,-0.30',
    croydon: '51.40,-0.10',
    wimbledon: '51.40,-0.20',
}

export function airSeries(loc: Location, hours: number): AirReading[] {
    const grid = GRID[loc.id] ?? '51.50,-0.10'
    const rand = seededRandom(`air:${grid}`)
    const now = new Date()
    now.setUTCMinutes(0, 0, 0)
    const readings: AirReading[] = []

    for (
        let t = now.getTime() - hours * 3600e3;
        t <= now.getTime();
        t += 3600e3
    ) {
        const hour = new Date(t).getUTCHours()
        // Rush-hour peaks around 8:00 and 18:00
        const rush =
            Math.exp(-((hour - 8) ** 2) / 4) + Math.exp(-((hour - 18) ** 2) / 4)
        const no2 = round1(12 + rush * 25 + rand() * 6)
        readings.push({
            ts: toMinute(new Date(t)),
            grid,
            pm2_5: round1(5 + rush * 6 + rand() * 3),
            pm10: round1(10 + rush * 9 + rand() * 4),
            nitrogen_dioxide: no2,
            ozone: round1(Math.max(5, 55 - no2 + rand() * 8)),
            european_aqi: Math.round(15 + rush * 20 + rand() * 8),
        })
    }
    return readings
}

// ---------- Roads ----------

export function roadSeries(loc: Location, hours: number): RoadReading[] {
    const rand = seededRandom(`road:${loc.corridor}`)
    const now = new Date()
    now.setUTCMinutes(Math.floor(now.getUTCMinutes() / 15) * 15, 0, 0)
    const readings: RoadReading[] = []
    const name = loc.corridor.toUpperCase()

    for (
        let t = now.getTime() - hours * 3600e3;
        t <= now.getTime();
        t += 15 * 60e3
    ) {
        const hour = new Date(t).getUTCHours()
        const isRush = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)
        const roll = rand()
        const level =
            isRush && roll < 0.4
                ? {
                      severity: 'Serious',
                      description: 'Serious Delays',
                      score: 3,
                  }
                : roll < 0.1
                  ? {
                        severity: 'Moderate',
                        description: 'Moderate Delays',
                        score: 2,
                    }
                  : {
                        severity: 'Good',
                        description: 'No Exceptional Delays',
                        score: 0,
                    }
        readings.push({ ts: toMinute(new Date(t)), name, ...level })
    }
    return readings
}
