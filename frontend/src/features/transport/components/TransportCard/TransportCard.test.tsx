import { render, screen } from '@testing-library/react'
import type { UseQueryResult } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ApiError } from '@/shared/api/client'
import { TransportCard } from './TransportCard'

// The fields of a react-query result the card reads
const query = (state: Partial<UseQueryResult<string[]>>) =>
    ({
        isPending: false,
        isFetching: false,
        isError: false,
        fetchStatus: 'idle',
        data: undefined,
        error: null,
        dataUpdatedAt: 0,
        ...state,
    }) as UseQueryResult<string[]>

const renderCard = (state: Partial<UseQueryResult<string[]>>) =>
    render(
        <TransportCard
            title="Next departures"
            query={query(state)}
            idle="Pick a stop."
        >
            {(trains) => (
                <ul>
                    {trains.map((t) => (
                        <li key={t}>{t}</li>
                    ))}
                </ul>
            )}
        </TransportCard>
    )

describe('TransportCard', () => {
    it('waits for a selection', () => {
        renderCard({ isPending: true, fetchStatus: 'idle' })
        expect(screen.getByText('Pick a stop.')).toBeInTheDocument()
    })

    it('shows a loader on the first load', () => {
        renderCard({ isPending: true, fetchStatus: 'fetching' })
        expect(screen.getByText('Loading…')).toBeInTheDocument()
    })

    it('renders the data', () => {
        renderCard({ data: ['Morden'] })
        expect(screen.getByRole('listitem')).toHaveTextContent('Morden')
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('keeps the last data when a refresh fails, and says how old it is', () => {
        renderCard({
            data: ['Morden'],
            isError: true,
            error: new ApiError(502, 'Upstream service unavailable'),
            dataUpdatedAt: Date.parse('2026-10-05T11:04:00Z'), // 12:04 in London
        })

        expect(screen.getByRole('listitem')).toHaveTextContent('Morden')
        expect(screen.getByRole('status')).toHaveTextContent(
            'Couldn’t refresh: showing data from 12:04'
        )
    })

    it('shows the error when there is no data at all', () => {
        renderCard({
            isError: true,
            error: new ApiError(502, 'Upstream service unavailable'),
        })
        expect(
            screen.getByText('Unavailable (Upstream service unavailable)')
        ).toBeInTheDocument()
    })
})
