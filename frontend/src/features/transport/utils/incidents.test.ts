import { describe, expect, it } from 'vitest'
import type { Line, LineHistoryEntry, LineStatus } from '@no2-way/shared'
import { disruptedLines, isDisrupted, toIncidents } from './incidents'

const GOOD: LineStatus = {
    severity: 10,
    description: 'Good Service',
    reason: null,
}
const CLOSED: LineStatus = {
    severity: 20,
    description: 'Service Closed',
    reason: null,
}
const minor = (reason = 'Signal failure'): LineStatus => ({
    severity: 9,
    description: 'Minor Delays',
    reason,
})
const severe = (reason = 'Faulty train'): LineStatus => ({
    severity: 6,
    description: 'Severe Delays',
    reason,
})

const line = (id: string, ...statuses: LineStatus[]): Line => ({
    id,
    name: id[0].toUpperCase() + id.slice(1),
    mode: 'tube',
    statuses,
})

// One snapshot every 15 minutes from 08:00, one status list per snapshot
const history = (...snapshots: LineStatus[][]): LineHistoryEntry[] =>
    snapshots.map((statuses, i) => ({
        ts: `2026-10-05T${String(8 + Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
        name: 'Northern',
        mode: 'tube',
        statuses,
    }))

describe('isDisrupted', () => {
    it('is false for good service', () => {
        expect(isDisrupted([GOOD])).toBe(false)
    })

    it('is false when the service is closed as planned', () => {
        expect(isDisrupted([CLOSED])).toBe(false)
    })

    it('is true as soon as one status is a disruption', () => {
        expect(isDisrupted([minor()])).toBe(true)
        expect(isDisrupted([GOOD, severe()])).toBe(true)
    })

    it('is false without any status', () => {
        expect(isDisrupted([])).toBe(false)
    })
})

describe('disruptedLines', () => {
    it('keeps the disrupted lines only', () => {
        const lines = [line('central', GOOD), line('northern', minor())]
        expect(disruptedLines(lines).map((l) => l.id)).toEqual(['northern'])
    })

    it('puts the worst disruption first, then sorts by name', () => {
        const lines = [
            line('victoria', minor()),
            line('district', minor(), GOOD),
            line('lioness', severe()),
        ]
        expect(disruptedLines(lines).map((l) => l.id)).toEqual([
            'lioness',
            'district',
            'victoria',
        ])
    })

    it('does not reorder the array it is given', () => {
        const lines = [line('victoria', minor()), line('lioness', severe())]
        disruptedLines(lines)
        expect(lines.map((l) => l.id)).toEqual(['victoria', 'lioness'])
    })
})

describe('toIncidents', () => {
    it('finds nothing in a quiet history', () => {
        expect(toIncidents([])).toEqual([])
        expect(toIncidents(history([GOOD], [GOOD], [CLOSED]))).toEqual([])
    })

    it('turns consecutive disrupted snapshots into one incident', () => {
        expect(
            toIncidents(history([GOOD], [minor()], [minor()], [GOOD]))
        ).toEqual([
            {
                start: '2026-10-05T08:15',
                end: '2026-10-05T08:45',
                severity: 9,
                description: 'Minor Delays',
                reasons: ['Signal failure'],
            },
        ])
    })

    it('leaves the end empty while the incident is still going on', () => {
        const [incident] = toIncidents(history([GOOD], [minor()]))
        expect(incident.end).toBeNull()
    })

    it('keeps the worst severity seen and its description', () => {
        const [incident] = toIncidents(
            history([minor()], [severe()], [minor()], [GOOD])
        )
        expect(incident).toMatchObject({
            severity: 6,
            description: 'Severe Delays',
        })
    })

    it('lists each reason once, in order of appearance', () => {
        const [incident] = toIncidents(
            history(
                [minor('Signal failure')],
                [minor('Signal failure'), severe('Faulty train')],
                [minor('Signal failure')]
            )
        )
        expect(incident.reasons).toEqual(['Signal failure', 'Faulty train'])
    })

    it('ignores missing reasons', () => {
        const [incident] = toIncidents(history([{ ...minor(), reason: null }]))
        expect(incident.reasons).toEqual([])
    })

    it('splits two disruptions separated by good service or a closure', () => {
        const incidents = toIncidents(
            history([minor()], [GOOD], [severe()], [CLOSED], [minor()])
        )
        expect(incidents.map((i) => [i.start, i.end])).toEqual([
            ['2026-10-05T08:00', '2026-10-05T08:15'],
            ['2026-10-05T08:30', '2026-10-05T08:45'],
            ['2026-10-05T09:00', null],
        ])
    })
})
