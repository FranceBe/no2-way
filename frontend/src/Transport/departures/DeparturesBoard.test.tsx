import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Arrival } from '@no2-way/shared'
import { DeparturesBoard } from './DeparturesBoard'

const arrival = (
    platform: string,
    towards: string,
    minutes: number
): Arrival => ({
    line: 'northern',
    lineName: 'Northern',
    platform,
    direction: 'inbound',
    destination: `${towards.split(' via ')[0]} Underground Station`,
    towards,
    minutes,
    expected: '2026-10-05T12:00:00Z',
})

describe('DeparturesBoard', () => {
    it('shows one board per platform, named after it', () => {
        render(
            <DeparturesBoard
                arrivals={[
                    arrival('Southbound - Platform 3', 'Morden', 4),
                    arrival('Northbound - Platform 1', 'Edgware via Bank', 0),
                ]}
            />
        )

        expect(
            screen.getAllByRole('heading').map((heading) => heading.textContent)
        ).toEqual(['Platform 1Northbound', 'Platform 3Southbound'])
    })

    it('reads like the station board: rank, destination, branch, time', () => {
        render(
            <DeparturesBoard
                arrivals={[
                    arrival('Northbound - Platform 1', 'Edgware via Bank', 0),
                    arrival('Northbound - Platform 1', 'High Barnet', 3),
                ]}
            />
        )
        const board = screen.getByRole('region', { name: /Platform 1/ })

        expect(
            within(board)
                .getAllByRole('listitem')
                .map((row) => row.textContent)
        ).toEqual(['1Edgware via BankDue', '2High Barnet3 mins'])
    })

    it('says when no train is due', () => {
        render(<DeparturesBoard arrivals={[]} />)
        expect(
            screen.getByText('No trains due at this stop')
        ).toBeInTheDocument()
    })
})
