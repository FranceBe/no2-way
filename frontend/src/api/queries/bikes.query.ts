import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import { MINUTE } from './durations'

// Live data, cached 1 min by the API
export const bikesQuery = (location: string, radius?: number) =>
    queryOptions({
        queryKey: ['bikes', location, radius],
        queryFn: ({ signal }) =>
            apiFetch('/bikes', {
                params: { location, radius },
                signal,
            }),
        staleTime: MINUTE,
        refetchInterval: MINUTE,
    })

export const useBikes = (location: string, radius?: number) =>
    useQuery(bikesQuery(location, radius))
