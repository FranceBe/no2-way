import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Incident } from './incidents'
import { IncidentOverview } from './IncidentOverview'

const NOW = Date.parse('2026-10-05T12:00Z')

const INCIDENTS: Incident[] = [
    {
        start: '2026-10-01T08:00',
        end: '2026-10-01T11:00',
        severity: 6,
        description: 'Severe Delays',
        reasons: ['Faulty train', 'Signal failure'],
    },
    {
        start: '2026-10-05T11:30',
        end: null,
        severity: 9,
        description: 'Minor Delays',
        reasons: [],
    },
]

const stat = (label: string) =>
    screen.getByText(label).closest('.incident-stat') as HTMLElement

describe('IncidentOverview', () => {
    it('sums up the week', () => {
        render(<IncidentOverview incidents={INCIDENTS} now={NOW} />)

        expect(stat('Incidents')).toHaveTextContent('2')
        expect(stat('Incidents')).toHaveTextContent('1 ongoing')
        expect(stat('Disrupted')).toHaveTextContent('3 h 30')
        expect(stat('Disrupted')).toHaveTextContent('2% of the week')
        expect(stat('Longest')).toHaveTextContent('3 h')
        expect(stat('Longest')).toHaveTextContent('Thu 1 Oct, 09:00') // London time
    })

    it('gives every bar of the timeline an accessible description', () => {
        render(<IncidentOverview incidents={INCIDENTS} now={NOW} />)
        const bars = within(screen.getByRole('figure')).getAllByRole('listitem')

        expect(bars.map((bar) => bar.getAttribute('aria-label'))).toEqual([
            'Severe Delays, Thu 1 Oct, 09:00, 3 h',
            'Minor Delays, Mon 5 Oct, 12:30, ongoing for 30 min',
        ])
        expect(bars[0]).toHaveClass('incident-bar--severe')
        expect(bars[1]).toHaveAttribute('data-ongoing')
    })

    it('lists the incidents most recent first, with their reasons', () => {
        render(<IncidentOverview incidents={INCIDENTS} now={NOW} />)
        const [, ...rows] = screen.getAllByRole('row')

        expect(rows[0]).toHaveTextContent('Ongoing30 min')
        expect(rows[1]).toHaveTextContent('Severe Delays')
        expect(rows[1]).toHaveTextContent('Faulty train')
        expect(rows[1]).toHaveTextContent('Signal failure')
    })

    it('says so when the week was quiet', () => {
        render(<IncidentOverview incidents={[]} now={NOW} />)

        expect(stat('Incidents')).toHaveTextContent('0none ongoing')
        expect(stat('Longest')).toHaveTextContent('–')
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        expect(
            screen.getByText('No disruption in the last 7 days.')
        ).toBeInTheDocument()
    })
})
