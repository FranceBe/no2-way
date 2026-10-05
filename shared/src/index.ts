// API contract: the single source of truth for response shapes.
// The backend types its routes with it; the front-end and its MSW mocks read it.
// Types only: nothing here ends up in a bundle

export interface Location {
    id: string
    name: string
    lat: number
    lon: number
    corridor: string
}

export interface Weather {
    time: string
    temperature: number
    feelsLike: number
    weatherCode: number // WMO weather code
    isDay: boolean
    precipitation: number
    windSpeed: number
}

// TfL line severity code (0-20, see endpoints-doc.md). Not ordered by gravity:
// 10 = Good Service, 20 = Service Closed (planned), 16 = Not Running
export interface LineStatus {
    severity: number
    description: string
    reason: string | null
}

export interface Line {
    id: string
    name: string
    mode: string
    statuses: LineStatus[]
}

export interface LinesSnapshot {
    ts: string | null
    lines: Line[]
}

export interface LineHistoryEntry {
    ts: string
    name: string
    mode: string
    statuses: LineStatus[]
}

export interface Stop {
    id: string
    name: string
    lat: number
    lon: number
}

export interface Arrival {
    line: string
    lineName: string
    platform: string
    direction: string | null
    destination: string | null
    towards: string | null
    minutes: number
    expected: string
}

export interface Schedule {
    name: string
    first: string | null // "05:43"
    last: string | null // "00:31"
}

export interface Timetable {
    line: string
    stop: string
    direction: string
    schedules: Schedule[]
}

export interface BikePoint {
    id: string
    name: string
    lat: number
    lon: number
    bikes: number
    emptyDocks: number
    docks: number
    distance: number // metres
}

export interface AirReading {
    ts: string
    grid: string
    pm2_5: number | null
    pm10: number | null
    nitrogen_dioxide: number | null
    ozone: number | null
    european_aqi: number | null
}

export interface RoadReading {
    ts: string
    name: string
    severity: string
    description: string
    score: number | null
}

export interface RoadsResponse {
    corridor: string
    readings: RoadReading[]
}

export interface ApiError {
    error: string
}

export type Direction = 'inbound' | 'outbound'

// Response of every endpoint, by path (errors are always ApiError)
export interface ApiResponses {
    '/locations': Location[]
    '/weather': Weather
    '/air': AirReading[]
    '/roads': RoadsResponse
    '/lines': LinesSnapshot
    '/lines/history': LineHistoryEntry[]
    '/lines/stops': Stop[]
    '/arrivals': Arrival[]
    '/timetable': Timetable
    '/bikes': BikePoint[]
}

export type ApiPath = keyof ApiResponses
