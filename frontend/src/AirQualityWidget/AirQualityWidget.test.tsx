import { fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '../test/render'
import { server } from '../test/server'
import { AirQualityWidget } from './AirQualityWidget'
import { FIXTURE_LOCATIONS, makeAirReadings } from './fixtures'

// Every /air request, as "location:hours"
let airRequests: string[] = []

beforeEach(() => {
    airRequests = []
    server.use(
        http.get('*/locations', () => HttpResponse.json(FIXTURE_LOCATIONS)),
        http.get('*/air', ({ request }) => {
            const params = new URL(request.url).searchParams
            const hours = Number(params.get('hours'))
            airRequests.push(`${params.get('location')}:${hours}`)
            return HttpResponse.json(makeAirReadings({ hours }))
        })
    )
})

const renderWidget = () =>
    renderWithProviders(<AirQualityWidget location="camden" hours={48} />)

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

    it('refetches when the neighbourhood changes', async () => {
        renderWidget()
        await screen.findByRole('option', { name: 'Hackney' })

        fireEvent.change(
            screen.getByRole('combobox', { name: 'Neighbourhood' }),
            {
                target: { value: 'hackney' },
            }
        )

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
})
