import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AirQualityPanel } from './AirQualityPanel'
import { makeAirReadings } from '../../fixtures/airReadings'

type PanelProps = Parameters<typeof AirQualityPanel>[0]

const renderPanel = (props: Partial<PanelProps> = {}) => {
    const onHoursChange = vi.fn()
    render(
        <AirQualityPanel
            locationName="Camden"
            hours={48}
            onHoursChange={onHoursChange}
            readings={makeAirReadings()}
            {...props}
        />
    )
    return { onHoursChange }
}

// The value and meta of a stat tile, found by its label
const statTile = (label: string) =>
    screen.getByText(label).closest('.aq-stat') as HTMLElement

describe('AirQualityPanel', () => {
    it('is a region titled Air quality, with the location name', () => {
        renderPanel()
        expect(
            screen.getByRole('region', { name: 'Air quality' })
        ).toBeInTheDocument()
        expect(
            screen.getByText('Camden · European AQI, hourly')
        ).toBeInTheDocument()
    })

    describe('controls', () => {
        it('marks the selected range and reports a new one', () => {
            const { onHoursChange } = renderPanel()
            const ranges = screen.getByRole('group', { name: 'Time range' })

            expect(
                within(ranges).getByRole('button', { name: '48h' })
            ).toHaveAttribute('aria-pressed', 'true')
            expect(
                within(ranges).getByRole('button', { name: '7d' })
            ).toHaveAttribute('aria-pressed', 'false')

            fireEvent.click(within(ranges).getByRole('button', { name: '7d' }))
            expect(onHoursChange).toHaveBeenCalledWith(168)
        })
    })

    describe('summary', () => {
        it('shows the latest AQI, the peak of the period and the hours at Poor or worse', () => {
            renderPanel({
                readings: makeAirReadings({
                    episode: { hoursAgo: 14, duration: 10, boost: 2.2 },
                }),
            })

            expect(statTile('Now')).toHaveTextContent('19Good')
            expect(statTile('Now')).toHaveTextContent('Mon 5 Oct, 13:00')
            expect(statTile('Peak (48h)')).toHaveTextContent('85Very poor')
            expect(statTile('Poor or worse')).toHaveTextContent('7 h')
            expect(statTile('Poor or worse')).toHaveTextContent(
                'out of 49 h with data'
            )
        })

        it('counts only hours with data', () => {
            renderPanel({ readings: makeAirReadings({ gapEvery: 7 }) })
            expect(statTile('Poor or worse')).toHaveTextContent(
                'out of 42 h with data'
            )
        })
    })

    it('shows one small chart per pollutant with its WHO guideline status', () => {
        renderPanel({ readings: makeAirReadings({ scale: 0.3 }) })
        const figures = screen.getAllByRole('figure')

        expect(
            figures.map(
                (f) => f.querySelector('.aq-pollutant__name')?.textContent
            )
        ).toEqual(['NO₂', 'PM2.5', 'PM10', 'O₃'])
        expect(
            within(figures[1]).getByText('Always below the WHO guideline')
        ).toBeInTheDocument()
    })

    it('explains each pollutant in plain language', () => {
        renderPanel()
        const fineParticles = screen.getAllByRole('figure')[1]

        expect(
            within(fineParticles).getByText('Fine particles')
        ).toBeInTheDocument()
        fireEvent.click(
            within(fineParticles).getByRole('button', {
                name: 'About fine particles',
            })
        )
        expect(within(fineParticles).getByRole('note')).toHaveTextContent(
            /reach deep into the lungs/
        )
        expect(within(fineParticles).getByRole('note')).toHaveTextContent(
            '15 µg/m³ as a 24-hour average'
        )
    })

    describe('states', () => {
        it('shows a loader and marks the panel busy', () => {
            renderPanel({ readings: undefined, isLoading: true })
            expect(screen.getByText('Loading air quality…')).toBeInTheDocument()
            expect(screen.getByRole('region')).toHaveAttribute(
                'aria-busy',
                'true'
            )
        })

        it('keeps the data on screen while refreshing', () => {
            renderPanel({ isRefreshing: true })
            expect(screen.getByRole('region')).toHaveAttribute(
                'aria-busy',
                'true'
            )
            expect(statTile('Now')).toBeInTheDocument()
        })

        it('shows the error message', () => {
            renderPanel({
                readings: undefined,
                error: 'Unknown or missing location',
            })
            expect(
                screen.getByText(
                    'Air quality unavailable (Unknown or missing location)'
                )
            ).toBeInTheDocument()
        })

        it('says when there is no reading for the period', () => {
            renderPanel({ readings: [] })
            expect(
                screen.getByText('No readings for this period.')
            ).toBeInTheDocument()
        })
    })
})
