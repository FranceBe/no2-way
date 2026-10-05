import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import type { AirReading } from '../types'
import { MINUTE } from './durations'

// Ingested every hour
export const airQuery = (location: string, hours?: number) =>
    queryOptions({
        queryKey: ['air', location, hours],
        queryFn: ({ signal }) =>
            apiFetch<AirReading[]>('/air', {
                params: { location, hours },
                signal,
            }),
        staleTime: 15 * MINUTE,
        refetchInterval: 15 * MINUTE,
    })

export const useAir = (location: string, hours?: number) =>
    useQuery(airQuery(location, hours))
