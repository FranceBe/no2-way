import { fireEvent, screen, within } from '@testing-library/react'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Weather } from '@no2-way/shared'
import { makeAirReadings } from './AirQualityWidget/fixtures'
import { FIXTURE_LOCATIONS } from './location/fixtures'
import { routes } from './routes'
import { renderWithProviders } from './test/render'
import { server } from './test/server'

const weather: Weather = {
    time: '2026-10-05T14:00',
    temperature: 17.6,
    feelsLike: 16.2,
    weatherCode: 0,
    isDay: true,
    precipitation: 0,
    windSpeed: 12.5,
}

// Every location requested by a widget, as "endpoint:location"
let requests: string[] = []

beforeEach(() => {
    requests = []
    const record =
        (endpoint: string, body: JsonBodyType) =>
        ({ request }: { request: Request }) => {
            const location = new URL(request.url).searchParams.get('location')
            requests.push(`${endpoint}:${location}`)
            return HttpResponse.json(body)
        }
    server.use(
        http.get('*/locations', () => HttpResponse.json(FIXTURE_LOCATIONS)),
        http.get('*/weather', record('weather', weather)),
        http.get('*/air', record('air', makeAirReadings())),
        http.get('*/lines', () => HttpResponse.json({ ts: null, lines: [] })),
        http.get('*/bikes', record('bikes', []))
    )
})

const renderApp = (url = '/') => {
    const router = createMemoryRouter(routes, { initialEntries: [url] })
    renderWithProviders(<RouterProvider router={router} />)
    return router
}

const currentUrl = (router: ReturnType<typeof renderApp>) =>
    router.state.location.pathname + router.state.location.search

const tabs = () => screen.getByRole('navigation', { name: 'Sections' })

describe('App', () => {
    it('opens the air quality tab for the default neighbourhood', async () => {
        const router = renderApp()

        expect(
            await screen.findByRole('region', { name: 'Weather in Camden' })
        ).toBeInTheDocument()
        expect(
            await screen.findByText('Camden · European AQI, hourly')
        ).toBeInTheDocument()
        expect(currentUrl(router)).toBe('/air-quality')
        expect(
            within(tabs()).getByRole('link', { name: 'Air quality' })
        ).toHaveAttribute('aria-current', 'page')
        expect(
            screen.getByRole('combobox', { name: 'Neighbourhood' })
        ).toHaveValue('camden')
    })

    it('reads the neighbourhood from ?location=', async () => {
        renderApp('/air-quality?location=hackney')

        expect(
            await screen.findByText('Hackney · European AQI, hourly')
        ).toBeInTheDocument()
        expect(
            screen.getByRole('combobox', { name: 'Neighbourhood' })
        ).toHaveValue('hackney')
        expect(requests).toContain('weather:hackney')
        expect(requests).toContain('air:hackney')
        expect(requests).not.toContain('air:camden')
    })

    it('falls back to the default for an unknown neighbourhood', async () => {
        renderApp('/air-quality?location=atlantis')

        expect(
            await screen.findByText('Camden · European AQI, hourly')
        ).toBeInTheDocument()
    })

    it('writes the selected neighbourhood to the URL and passes it to every widget', async () => {
        const router = renderApp('/air-quality')
        await screen.findByText('Camden · European AQI, hourly')

        fireEvent.change(
            screen.getByRole('combobox', { name: 'Neighbourhood' }),
            { target: { value: 'brixton' } }
        )

        expect(
            await screen.findByRole('region', { name: 'Weather in Brixton' })
        ).toBeInTheDocument()
        expect(
            await screen.findByText('Brixton · European AQI, hourly')
        ).toBeInTheDocument()
        expect(currentUrl(router)).toBe('/air-quality?location=brixton')
    })

    it('keeps the neighbourhood when switching tabs', async () => {
        const router = renderApp('/air-quality?location=hackney')
        await screen.findByText('Hackney · European AQI, hourly')

        fireEvent.click(within(tabs()).getByRole('link', { name: 'Roads' }))
        expect(
            await screen.findByRole('region', { name: 'Road congestion' })
        ).toHaveTextContent('A10 corridor near Hackney')
        expect(currentUrl(router)).toBe('/roads?location=hackney')

        fireEvent.click(within(tabs()).getByRole('link', { name: 'Transport' }))
        expect(
            await screen.findByRole('region', { name: 'Bikes nearby' })
        ).toHaveTextContent('Around Hackney')
        expect(currentUrl(router)).toBe('/transport?location=hackney')
    })

    it('redirects unknown paths to the first tab, keeping the neighbourhood', async () => {
        const router = renderApp('/nowhere?location=brixton')

        expect(
            await screen.findByText('Brixton · European AQI, hourly')
        ).toBeInTheDocument()
        expect(currentUrl(router)).toBe('/air-quality?location=brixton')
    })

    it('shows the error when the neighbourhoods cannot be loaded', async () => {
        server.use(
            http.get('*/locations', () =>
                HttpResponse.json({ error: 'Boom' }, { status: 500 })
            )
        )
        renderApp()

        expect(
            await screen.findByText('Neighbourhoods unavailable (Boom)')
        ).toBeInTheDocument()
        expect(requests).toEqual([])
    })
})
