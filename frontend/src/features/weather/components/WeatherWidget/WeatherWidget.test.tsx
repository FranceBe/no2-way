import { act, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Location, Weather } from '@no2-way/shared'
import { FIXTURE_LOCATIONS } from '@/shared/location/fixtures'
import { renderWithProviders } from '@/shared/test/render'
import { server } from '@/shared/test/server'
import { WeatherWidget } from './WeatherWidget'

const weather: Weather = {
    time: '2026-10-05T14:00',
    temperature: 9.2,
    feelsLike: 7.4,
    weatherCode: 63,
    isDay: true,
    precipitation: 2.1,
    windSpeed: 21,
}

// Default answer for any location; tests can override it with server.use()
beforeEach(() => {
    server.use(http.get('*/weather', () => HttpResponse.json(weather)))
})

const [camden, , brixton] = FIXTURE_LOCATIONS

const renderWidget = (location: Location = camden) =>
    renderWithProviders(<WeatherWidget location={location} />)

describe('WeatherWidget', () => {
    it('shows a loading state, then the weather', async () => {
        renderWidget()

        expect(screen.getByText('Loading weather…')).toBeInTheDocument()
        expect(
            await screen.findByRole('region', { name: 'Weather in Camden' })
        ).toBeInTheDocument()
        expect(screen.getByText('Rain', { selector: 'p' })).toBeInTheDocument()
        expect(screen.getByText('9°C')).toBeInTheDocument()
        expect(screen.queryByText('Loading weather…')).not.toBeInTheDocument()
    })

    it('requests the weather of the given location', async () => {
        let requestedLocation: string | null = null
        server.use(
            http.get('*/weather', ({ request }) => {
                requestedLocation = new URL(request.url).searchParams.get(
                    'location'
                )
                return HttpResponse.json(weather)
            })
        )

        renderWidget(brixton)

        expect(
            await screen.findByRole('region', { name: 'Weather in Brixton' })
        ).toBeInTheDocument()
        expect(requestedLocation).toBe('brixton')
    })

    it('shows the API error message', async () => {
        server.use(
            http.get('*/weather', () =>
                HttpResponse.json(
                    { error: 'Unknown or missing location' },
                    { status: 400 }
                )
            )
        )

        renderWidget({ ...camden, id: 'atlantis' })

        expect(
            await screen.findByText(
                'Weather unavailable (Unknown or missing location)'
            )
        ).toBeInTheDocument()
    })

    it("shows a network error when the API can't be reached", async () => {
        server.use(http.get('*/weather', () => HttpResponse.error()))

        renderWidget()

        expect(
            await screen.findByText('Weather unavailable (Network error)')
        ).toBeInTheDocument()
    })

    it('keeps the last weather when a refresh fails', async () => {
        const { client } = renderWidget()
        await screen.findByRole('region', { name: 'Weather in Camden' })

        server.use(http.get('*/weather', () => HttpResponse.error()))
        await act(() => client.refetchQueries())

        expect(
            screen.getByRole('region', { name: 'Weather in Camden' })
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/Weather unavailable/)
        ).not.toBeInTheDocument()
    })
})
