import { queryOptions, skipToken, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import { MINUTE } from './durations'

// Waits (skipToken) while no line is selected
export const lineHistoryQuery = (line: string | undefined, hours?: number) =>
    queryOptions({
        queryKey: ['lines', 'history', line, hours],
        queryFn: line
            ? ({ signal }) =>
                  apiFetch('/lines/history', {
                      params: { line, hours },
                      signal,
                  })
            : skipToken,
        staleTime: 5 * MINUTE,
        refetchInterval: 5 * MINUTE,
    })

export const useLineHistory = (line: string | undefined, hours?: number) =>
    useQuery(lineHistoryQuery(line, hours))
