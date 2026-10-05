import { queryOptions, skipToken, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import { HOUR } from './durations'

// Waits (skipToken) while no line is selected
export const lineStopsQuery = (line: string | undefined) =>
    queryOptions({
        queryKey: ['lines', 'stops', line],
        queryFn: line
            ? ({ signal }) =>
                  apiFetch('/lines/stops', { params: { line }, signal })
            : skipToken,
        staleTime: 24 * HOUR, // stations almost never change
    })

export const useLineStops = (line: string | undefined) =>
    useQuery(lineStopsQuery(line))
