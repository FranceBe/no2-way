import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import type { Location } from '../types'

export const locationsQuery = () =>
    queryOptions({
        queryKey: ['locations'],
        queryFn: ({ signal }) => apiFetch<Location[]>('/locations', { signal }),
        staleTime: Infinity, // hard-coded list on the back-end
    })

export const useLocations = () => useQuery(locationsQuery())
