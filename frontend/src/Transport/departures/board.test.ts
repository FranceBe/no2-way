import { describe, expect, it } from 'vitest'
import type { Arrival } from '@no2-way/shared'
import { byPlatform, formatDue } from './board'

const arrival = (platform: string, minutes: number): Arrival => ({
    line: 'northern',
    lineName: 'Northern',
    platform,
    direction: 'outbound',
    destination: 'Morden Underground Station',
    towards: 'Morden via Bank',
    minutes,
    expected: '2026-10-05T12:00:00Z',
})

describe('formatDue', () => {
    it.each([
        [0, 'Due'],
        [1, '1 min'],
        [4, '4 mins'],
        [12, '12 mins'],
    ])('%i -> %s', (minutes, label) => {
        expect(formatDue(minutes)).toBe(label)
    })
})

describe('byPlatform', () => {
    it('groups the departures by platform, platforms sorted by name', () => {
        const groups = byPlatform([
            arrival('Southbound - Platform 7', 2),
            arrival('Northbound - Platform 8', 1),
            arrival('Southbound - Platform 7', 5),
        ])
        expect(
            groups.map((g) => [g.platform, g.departures.map((d) => d.minutes)])
        ).toEqual([
            ['Northbound - Platform 8', [1]],
            ['Southbound - Platform 7', [2, 5]],
        ])
    })

    it('sorts each platform soonest first, even if the input is not', () => {
        const [group] = byPlatform([arrival('P1', 9), arrival('P1', 0)])
        expect(group.departures.map((d) => d.minutes)).toEqual([0, 9])
    })

    it('keeps at most `limit` departures per platform', () => {
        const arrivals = [1, 2, 3, 4, 5].map((m) => arrival('P1', m))
        expect(byPlatform(arrivals)[0].departures).toHaveLength(3)
        expect(byPlatform(arrivals, 2)[0].departures).toHaveLength(2)
    })

    it('returns no group for no arrival', () => {
        expect(byPlatform([])).toEqual([])
    })
})
