import { act, fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/shared/test/render'
import { server } from '@/shared/test/server'
import { AirQualityWidget } from './AirQualityWidget'
import { FIXTURE_LOCATIONS } from '@/shared/location/fixtures'
import { makeAirReadings } from '../../fixtures/airReadings'

// Every /air request, as "location:hours"
let airRequests: string[] = []

beforeEach(() => {
    airRequests = []
    server.use(
        http.get('*/air', ({ request }) => {
            const params = new URL(request.url).searchParams
            const hours = Number(params.get('hours'))
            airRequests.push(`${params.get('location')}:${hours}`)
            return HttpResponse.json(makeAirReadings({ hours }))
        })
    )
})

const [camden, hackney] = FIXTURE_LOCATIONS

const renderWidget = () =>
    renderWithProviders(<AirQualityWidget location={camden} hours={48} />)

describe('AirQualityWidget', () => {
    it('loads the last 48h of the given location', async () => {
        renderWidget()

        expect(screen.getByText('Loading air quality…')).toBeInTheDocument()
        expect(await screen.findByText('Now')).toBeInTheDocument()
        expect(airRequests).toEqual(['camden:48'])
    })

    it('refetches when the range changes', async () => {
        renderWidget()
        await screen.findByText('Now')

        fireEvent.click(screen.getByRole('button', { name: '7d' }))

        expect(await screen.findByText('Peak (7d)')).toBeInTheDocument()
        expect(airRequests).toEqual(['camden:48', 'camden:168'])
    })

    it('refetches when the location prop changes', async () => {
        const { rerender } = renderWidget()
        await screen.findByText('Now')

        rerender(<AirQualityWidget location={hackney} hours={48} />)

        expect(
            await screen.findByText('Hackney · European AQI, hourly')
        ).toBeInTheDocument()
        await screen.findByText('Now')
        expect(airRequests).toContain('hackney:48')
    })

    it('shows the API error message', async () => {
        server.use(
            http.get('*/air', () =>
                HttpResponse.json(
                    { error: 'Unknown or missing location' },
                    { status: 400 }
                )
            )
        )

        renderWidget()

        expect(
            await screen.findByText(
                'Air quality unavailable (Unknown or missing location)'
            )
        ).toBeInTheDocument()
    })

    describe('when a refresh fails', () => {
        const failNextRequests = () =>
            server.use(
                http.get('*/air', () =>
                    HttpResponse.json(
                        { error: 'Upstream service unavailable' },
                        { status: 502 }
                    )
                )
            )

        it('keeps the readings on screen and says they are not fresh', async () => {
            const { client } = renderWidget()
            await screen.findByText('Now')

            failNextRequests()
            await act(() => client.refetchQueries())

            expect(
                await screen.findByText(/^Couldn’t refresh: showing data from/)
            ).toBeInTheDocument()
            expect(screen.getByText('Now')).toBeInTheDocument()
        })

        it('does not pass off the previous range as the new one', async () => {
            renderWidget()
            await screen.findByText('Peak (48h)')

            failNextRequests()
            fireEvent.click(screen.getByRole('button', { name: '7d' }))

            expect(
                await screen.findByText(
                    'Air quality unavailable (Upstream service unavailable)'
                )
            ).toBeInTheDocument()
            expect(screen.queryByText('Peak (48h)')).not.toBeInTheDocument()
        })
    })
})
