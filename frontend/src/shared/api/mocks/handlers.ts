// MSW handlers: same paths, parameters and errors as the real API
import type { ApiError, ApiPath, ApiResponses } from '@no2-way/shared'
import {
    http,
    HttpResponse,
    delay,
    type HttpResponseResolver,
    type PathParams,
} from 'msw'
import {
    LINES,
    LOCATIONS,
    STOPS,
    airSeries,
    arrivalsFor,
    bikesNear,
    findLocation,
    lineHistory,
    nearestLocation,
    roadSeries,
    timetableFor,
    weatherFor,
} from './data'

const LINE_ID = /^[a-z0-9-]{1,40}$/
const STOP_ID = /^[A-Za-z0-9]{1,30}$/

// Handler for one API path: the response body must match the shared contract
// (or be an error). "*/path" matches any origin, so VITE_API_URL can stay unchanged
const apiGet = <P extends ApiPath>(
    path: P,
    resolver: HttpResponseResolver<
        PathParams,
        never,
        ApiResponses[P] | ApiError
    >
) => http.get(`*${path}`, resolver)

const badRequest = (error: string) =>
    HttpResponse.json<ApiError>({ error }, { status: 400 })

// Same rules as the real API: 48h by default, 30 days max
const parseHours = (raw: string | null, fallback: number): number =>
    Math.min(Number(raw ?? fallback) || fallback, 24 * 30)

export const handlers = [
    apiGet('/locations', async () => {
        await delay(150)
        return HttpResponse.json(LOCATIONS)
    }),

    apiGet('/weather', async ({ request }) => {
        await delay(200)
        const param = new URL(request.url).searchParams.get('location')
        const loc = param ? findLocation(param) : LOCATIONS[0]
        if (!loc) return badRequest('Unknown or missing location')
        return HttpResponse.json(weatherFor(loc))
    }),

    apiGet('/lines', async () => {
        await delay(200)
        const now = new Date()
        now.setUTCMinutes(Math.floor(now.getUTCMinutes() / 15) * 15, 0, 0)
        return HttpResponse.json({
            ts: now.toISOString().slice(0, 16),
            lines: LINES,
        })
    }),

    apiGet('/lines/history', async ({ request }) => {
        await delay(300)
        const params = new URL(request.url).searchParams
        const line = params.get('line')
        if (!line || !LINE_ID.test(line))
            return badRequest('Invalid or missing line')
        return HttpResponse.json(
            lineHistory(line, parseHours(params.get('hours'), 24 * 7))
        )
    }),

    apiGet('/lines/stops', async ({ request }) => {
        await delay(200)
        const line = new URL(request.url).searchParams.get('line')
        if (!line || !LINE_ID.test(line))
            return badRequest('Invalid or missing line')
        return HttpResponse.json(STOPS[line] ?? [])
    }),

    apiGet('/arrivals', async ({ request }) => {
        await delay(250)
        const params = new URL(request.url).searchParams
        const stop = params.get('stop')
        const line = params.get('line')
        const direction = params.get('direction')
        if (!stop || !STOP_ID.test(stop))
            return badRequest('Invalid or missing stop')
        if (line && !LINE_ID.test(line))
            return badRequest('Invalid or missing line')
        if (direction && direction !== 'inbound' && direction !== 'outbound') {
            return badRequest('direction must be inbound or outbound')
        }
        return HttpResponse.json(arrivalsFor(stop, line, direction))
    }),

    apiGet('/timetable', async ({ request }) => {
        await delay(300)
        const params = new URL(request.url).searchParams
        const line = params.get('line')
        const stop = params.get('stop')
        const direction = params.get('direction') ?? 'outbound'
        if (!line || !LINE_ID.test(line))
            return badRequest('Invalid or missing line')
        if (!stop || !STOP_ID.test(stop))
            return badRequest('Invalid or missing stop')
        if (direction !== 'inbound' && direction !== 'outbound') {
            return badRequest('direction must be inbound or outbound')
        }
        return HttpResponse.json(timetableFor(line, stop, direction))
    }),

    apiGet('/bikes', async ({ request }) => {
        await delay(300)
        const params = new URL(request.url).searchParams
        const radius = Math.min(
            Number(params.get('radius') ?? 500) || 500,
            2000
        )

        // Around a point (a stop): same London bounds as the real API
        if (params.has('lat') || params.has('lon')) {
            const lat = Number(params.get('lat'))
            const lon = Number(params.get('lon'))
            const inLondon =
                params.has('lat') &&
                params.has('lon') &&
                lat >= 51.2 &&
                lat <= 51.8 &&
                lon >= -0.6 &&
                lon <= 0.4
            if (!inLondon)
                return badRequest('Invalid lat/lon: expected a point in London')
            return HttpResponse.json(
                bikesNear({ lat, lon }, nearestLocation(lat, lon).name, radius)
            )
        }

        const loc = findLocation(params.get('location'))
        if (!loc) return badRequest('Unknown or missing location')
        return HttpResponse.json(bikesNear(loc, loc.name, radius))
    }),

    apiGet('/air', async ({ request }) => {
        await delay(250)
        const params = new URL(request.url).searchParams
        const loc = findLocation(params.get('location'))
        if (!loc) return badRequest('Unknown or missing location')
        return HttpResponse.json(
            airSeries(loc, parseHours(params.get('hours'), 48))
        )
    }),

    apiGet('/roads', async ({ request }) => {
        await delay(250)
        const params = new URL(request.url).searchParams
        const loc = findLocation(params.get('location'))
        if (!loc) return badRequest('Unknown or missing location')
        return HttpResponse.json({
            corridor: loc.corridor,
            readings: roadSeries(loc, parseHours(params.get('hours'), 48)),
        })
    }),
]

// Handy overrides to test error states, e.g. worker.use(...errorHandlers)
export const errorHandlers = [
    apiGet('/arrivals', () =>
        HttpResponse.json(
            { error: 'Upstream service unavailable' },
            { status: 502 }
        )
    ),
    apiGet('/weather', () =>
        HttpResponse.json(
            { error: 'Upstream service unavailable' },
            { status: 502 }
        )
    ),
    apiGet('/lines', () =>
        HttpResponse.json({ error: 'Internal error' }, { status: 500 })
    ),
]
