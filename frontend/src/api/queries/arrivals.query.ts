import { queryOptions, skipToken, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import type { Arrival, Direction } from '../types'
import { SECOND } from './durations'

// Live data, cached 20 s by the API. Waits (skipToken) while no stop is selected
export const arrivalsQuery = (
    stop: string | undefined,
    line?: string,
    direction?: Direction
) =>
    queryOptions({
        queryKey: ['arrivals', stop, line, direction],
        queryFn: stop
            ? ({ signal }) =>
                  apiFetch<Arrival[]>('/arrivals', {
                      params: { stop, line, direction },
                      signal,
                  })
            : skipToken,
        staleTime: 20 * SECOND,
        refetchInterval: 30 * SECOND,
    })

export const useArrivals = (
    stop: string | undefined,
    line?: string,
    direction?: Direction
) => useQuery(arrivalsQuery(stop, line, direction))
