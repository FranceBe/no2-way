import { useId, type ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { formatHour } from '@/shared/time'
import './TransportCard.css'

type TransportCardProps<T> = {
    title: string
    subtitle?: string
    query: UseQueryResult<T>
    // Shown while the query waits for a selection (skipToken)
    idle: string
    children: (data: T) => ReactNode
}

// Card shell shared by every transport widget: title, then the idle, loading
// and error states, so each widget only renders its data.
// A failed refresh keeps the last data on screen (react-query keeps it too):
// departures from 30 s ago beat an error message
export function TransportCard<T>({
    title,
    subtitle,
    query,
    idle,
    children,
}: TransportCardProps<T>) {
    const titleId = useId()
    const waiting = query.isPending && query.fetchStatus === 'idle'

    return (
        <section
            className="transport-card"
            aria-labelledby={titleId}
            aria-busy={query.isFetching}
        >
            <header className="transport-card__header">
                <h2 id={titleId} className="transport-card__title">
                    {title}
                </h2>
                {subtitle && (
                    <p className="transport-card__subtitle">{subtitle}</p>
                )}
            </header>
            {waiting ? (
                <p className="transport-card__message">{idle}</p>
            ) : query.isPending ? (
                <p className="transport-card__message">Loading…</p>
            ) : query.data !== undefined ? (
                <>
                    {query.isError && (
                        <p className="transport-card__stale" role="status">
                            Couldn’t refresh: showing data from{' '}
                            {formatHour(query.dataUpdatedAt)}
                        </p>
                    )}
                    {children(query.data)}
                </>
            ) : (
                <p className="transport-card__message">
                    Unavailable ({query.error?.message})
                </p>
            )}
        </section>
    )
}
