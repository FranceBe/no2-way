import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'

export const locationsQuery = () =>
    queryOptions({
        queryKey: ['locations'],
        queryFn: ({ signal }) => apiFetch('/locations', { signal }),
        staleTime: Infinity, // hard-coded list on the back-end
    })

export const useLocations = () => useQuery(locationsQuery())
