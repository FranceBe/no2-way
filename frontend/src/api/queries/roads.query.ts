import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import { MINUTE } from './durations'

// Ingested every 15 min
export const roadsQuery = (location: string, hours?: number) =>
    queryOptions({
        queryKey: ['roads', location, hours],
        queryFn: ({ signal }) =>
            apiFetch('/roads', {
                params: { location, hours },
                signal,
            }),
        staleTime: 5 * MINUTE,
        refetchInterval: 5 * MINUTE,
    })

export const useRoads = (location: string, hours?: number) =>
    useQuery(roadsQuery(location, hours))
