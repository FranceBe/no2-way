import { fireEvent, screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Line, Timetable } from '@no2-way/shared'
import { FIXTURE_LOCATIONS } from '@/shared/location/fixtures'
import { routes } from '@/app/routes/routes'
import { renderWithProviders } from '@/shared/test/render'
import { server } from '@/shared/test/server'

// The wiring of the tab: selection, URL and requests. What each widget
// renders is tested next to it

const GOOD = { severity: 10, description: 'Good Service', reason: null }
const LINES: Line[] = [
    { id: 'victoria', name: 'Victoria', mode: 'tube', statuses: [GOOD] },
    { id: 'northern', name: 'Northern', mode: 'tube', statuses: [GOOD] },
]
const STOPS = [
    {
        id: '940GZZLUCTN',
        name: 'Camden Town Underground Station',
        lat: 51.5392,
        lon: -0.1426,
    },
    {
        id: '940GZZLUEUS',
        name: 'Euston Underground Station',
        lat: 51.5282,
        lon: -0.1337,
    },
]
const TIMETABLE: Timetable = {
    line: 'northern',
    stop: '940GZZLUCTN',
    direction: 'outbound',
    schedules: [{ name: 'Sunday', first: '07:01', last: '23:48' }],
}

// Every request except /locations, as "path?query"
let requests: string[] = []

beforeEach(() => {
    requests = []
    const record =
        (body: object) =>
        ({ request }: { request: Request }) => {
            const url = new URL(request.url)
            requests.push(`${url.pathname}${url.search}`)
            return HttpResponse.json(body)
        }
    server.use(
        http.get('*/locations', () => HttpResponse.json(FIXTURE_LOCATIONS)),
        http.get('*/weather', () =>
            HttpResponse.json({ error: 'not under test' }, { status: 400 })
        ),
        http.get('*/lines', record({ ts: '2026-10-05T12:00', lines: LINES })),
        http.get('*/lines/stops', record(STOPS)),
        http.get('*/lines/history', record([])),
        http.get('*/arrivals', record([])),
        http.get('*/timetable', record(TIMETABLE)),
        http.get('*/bikes', record([]))
    )
})

const renderTransport = (search = '?location=camden') => {
    const router = createMemoryRouter(routes, {
        initialEntries: [`/transport${search}`],
    })
    renderWithProviders(<RouterProvider router={router} />)
    return router
}

const params = (router: ReturnType<typeof renderTransport>) =>
    Object.fromEntries(new URLSearchParams(router.state.location.search))

const select = (name: string) => screen.getByRole('combobox', { name })

describe('Transport page', () => {
    it('lists the lines by name and waits for a selection', async () => {
        renderTransport()

        await screen.findByRole('option', { name: 'Northern' })
        expect(
            within(select('Line'))
                .getAllByRole('option')
                .map((o) => o.textContent)
        ).toEqual(['Pick a line', 'Northern', 'Victoria'])
        expect(select('Stop')).toBeDisabled()
        expect(
            screen.getByText('Pick a line and a stop to see the next trains.')
        ).toBeInTheDocument()
        // Nothing line-specific is requested yet
        expect(
            requests.filter((r) => !/^\/(lines|bikes)\?|^\/lines$/.test(r))
        ).toEqual([])
    })

    it('loads the stops of the picked line and keeps it in the URL', async () => {
        const router = renderTransport()
        await screen.findByRole('option', { name: 'Northern' })

        fireEvent.change(select('Line'), { target: { value: 'northern' } })

        await screen.findByRole('option', {
            name: 'Euston Underground Station',
        })
        expect(params(router)).toEqual({ location: 'camden', line: 'northern' })
        expect(requests).toContain('/lines/stops?line=northern')
        expect(requests).toContain('/lines/history?line=northern&hours=168')
    })

    it('requests departures and timetable for the line, stop and direction', async () => {
        const router = renderTransport('?location=camden&line=northern')
        await screen.findByRole('option', {
            name: 'Euston Underground Station',
        })

        fireEvent.change(select('Stop'), { target: { value: '940GZZLUCTN' } })
        expect(
            await screen.findByRole('row', { name: 'Sunday 07:01 23:48' })
        ).toBeInTheDocument()
        expect(requests).toContain(
            '/arrivals?stop=940GZZLUCTN&line=northern&direction=outbound'
        )
        expect(requests).toContain(
            '/timetable?line=northern&stop=940GZZLUCTN&direction=outbound'
        )

        fireEvent.click(screen.getByRole('button', { name: 'Inbound' }))
        expect(params(router)).toMatchObject({ direction: 'inbound' })
        await screen.findByRole('button', { name: 'Inbound', pressed: true })
        await expect
            .poll(() => requests)
            .toContain(
                '/arrivals?stop=940GZZLUCTN&line=northern&direction=inbound'
            )
    })

    it('clears the stop when the line changes', async () => {
        const router = renderTransport(
            '?location=camden&line=northern&stop=940GZZLUCTN'
        )
        await screen.findByRole('option', { name: 'Victoria' })

        fireEvent.change(select('Line'), { target: { value: 'victoria' } })

        expect(params(router)).toEqual({ location: 'camden', line: 'victoria' })
    })

    it('shows the bikes around the selected stop', async () => {
        renderTransport('?location=camden&line=northern&stop=940GZZLUEUS')

        expect(
            await screen.findByText('Around Euston, within 500 m')
        ).toBeInTheDocument()
        await expect
            .poll(() => requests)
            .toContain('/bikes?lat=51.5282&lon=-0.1337')
        expect(requests).not.toContain('/bikes?location=camden')
    })

    it('shows the bikes around the neighbourhood until a stop is picked', async () => {
        renderTransport('?location=hackney')
        expect(
            await screen.findByRole('region', { name: 'Bikes nearby' })
        ).toHaveTextContent('Around Hackney')
        await expect.poll(() => requests).toContain('/bikes?location=hackney')
    })
})
