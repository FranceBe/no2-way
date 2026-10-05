import { queryOptions, skipToken, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import { MINUTE } from './durations'

// Around a neighbourhood, or around a point such as a stop
export type BikesNear = { location: string } | { lat: number; lon: number }

// Live data, cached 1 min by the API. Waits (skipToken) while `near` is unknown
export const bikesQuery = (near: BikesNear | undefined, radius?: number) =>
    queryOptions({
        queryKey: ['bikes', near, radius],
        queryFn: near
            ? ({ signal }) =>
                  apiFetch('/bikes', {
                      params: { ...near, radius },
                      signal,
                  })
            : skipToken,
        staleTime: MINUTE,
        refetchInterval: MINUTE,
    })

export const useBikes = (near: BikesNear | undefined, radius?: number) =>
    useQuery(bikesQuery(near, radius))
