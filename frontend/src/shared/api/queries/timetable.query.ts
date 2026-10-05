import { queryOptions, skipToken, useQuery } from '@tanstack/react-query'
import { apiFetch } from '../client'
import type { Direction } from '@no2-way/shared'
import { HOUR } from './durations'

// First / last trains. Waits (skipToken) until both line and stop are selected
export const timetableQuery = (
    line: string | undefined,
    stop: string | undefined,
    direction?: Direction
) =>
    queryOptions({
        queryKey: ['timetable', line, stop, direction],
        queryFn:
            line && stop
                ? ({ signal }) =>
                      apiFetch('/timetable', {
                          params: { line, stop, direction },
                          signal,
                      })
                : skipToken,
        staleTime: 24 * HOUR,
    })

export const useTimetable = (
    line: string | undefined,
    stop: string | undefined,
    direction?: Direction
) => useQuery(timetableQuery(line, stop, direction))
