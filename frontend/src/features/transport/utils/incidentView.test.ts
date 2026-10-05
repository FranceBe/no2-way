import { describe, expect, it } from 'vitest'
import type { Incident } from './incidents'
import {
    formatDuration,
    incidentSpan,
    summarizeIncidents,
} from './incidentView'

const NOW = Date.parse('2026-10-05T12:00Z')

const incident = (
    start: string,
    end: string | null,
    severity = 9
): Incident => ({
    start,
    end,
    severity,
    description: 'Minor Delays',
    reasons: [],
})

describe('formatDuration', () => {
    it.each([
        [15 * 60e3, '15 min'],
        [60 * 60e3, '1 h'],
        [135 * 60e3, '2 h 15'],
        [65 * 60e3, '1 h 05'],
        [27 * 3600e3, '1 d 3 h'],
        [48 * 3600e3, '2 d'],
    ])('%i ms -> %s', (ms, label) => {
        expect(formatDuration(ms)).toBe(label)
    })
})

describe('incidentSpan', () => {
    it('measures a closed incident from its start to its end', () => {
        expect(
            incidentSpan(incident('2026-10-05T08:00', '2026-10-05T09:15'), NOW)
                .duration
        ).toBe(75 * 60e3)
    })

    it('runs an ongoing incident until now', () => {
        const span = incidentSpan(incident('2026-10-05T11:00', null), NOW)
        expect(span.end).toBe(NOW)
        expect(span.duration).toBe(3600e3)
    })
})

describe('summarizeIncidents', () => {
    it('adds up the time disrupted and finds the longest and ongoing incidents', () => {
        const long = incident('2026-10-01T08:00', '2026-10-01T11:00')
        const ongoing = incident('2026-10-05T11:30', null)
        const summary = summarizeIncidents(
            [incident('2026-09-30T08:00', '2026-09-30T08:30'), long, ongoing],
            NOW
        )

        expect(summary).toEqual({
            count: 3,
            disrupted: 4 * 3600e3, // 30 min + 3 h + 30 min
            share: 4 / (7 * 24),
            longest: long,
            longestDuration: 3 * 3600e3,
            ongoing,
        })
    })

    it('is empty for a quiet week', () => {
        expect(summarizeIncidents([], NOW)).toEqual({
            count: 0,
            disrupted: 0,
            share: 0,
            longest: null,
            longestDuration: 0,
            ongoing: null,
        })
    })
})
