import { describe, expect, it } from 'vitest'
import type { Arrival } from '@no2-way/shared'
import { destinationOf, splitPlatform } from './departureView'

const arrival = (overrides: Partial<Arrival>): Arrival => ({
    line: 'northern',
    lineName: 'Northern',
    platform: 'Northbound - Platform 8',
    direction: 'inbound',
    destination: 'Edgware Underground Station',
    towards: 'Edgware via Bank',
    minutes: 2,
    expected: '2026-10-05T12:02:00Z',
    ...overrides,
})

describe('destinationOf', () => {
    it('shortens the station name and keeps the branch', () => {
        expect(destinationOf(arrival({}))).toEqual({
            name: 'Edgware',
            via: 'Bank',
        })
    })

    it.each([
        ['Stratford DLR Station', 'Stratford'],
        ['Euston Rail Station', 'Euston'],
        ['Brixton Underground Station', 'Brixton'],
        ['Walthamstow Central', 'Walthamstow Central'],
    ])('%s -> %s', (destination, name) => {
        expect(destinationOf(arrival({ destination })).name).toBe(name)
    })

    it('has no branch when `towards` names none', () => {
        expect(destinationOf(arrival({ towards: 'Morden' })).via).toBeNull()
    })

    it('falls back on `towards`, then on what the boards say', () => {
        expect(destinationOf(arrival({ destination: null })).name).toBe(
            'Edgware'
        )
        expect(
            destinationOf(arrival({ destination: null, towards: null }))
        ).toEqual({ name: 'Check front of train', via: null })
    })
})

describe('splitPlatform', () => {
    it('separates the heading from the platform', () => {
        expect(splitPlatform('Southbound - Platform 7')).toEqual({
            name: 'Platform 7',
            heading: 'Southbound',
        })
    })

    it('keeps a name without heading as it is', () => {
        expect(splitPlatform('Platform 2')).toEqual({
            name: 'Platform 2',
            heading: null,
        })
    })
})
