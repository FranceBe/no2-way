import { describe, expect, it } from 'vitest'
import { shortStationName } from './stations'

describe('shortStationName', () => {
    it.each([
        ['Camden Town Underground Station', 'Camden Town'],
        ['Stratford DLR Station', 'Stratford'],
        ['Euston Rail Station', 'Euston'],
        ['Walthamstow Central', 'Walthamstow Central'],
    ])('%s -> %s', (name, short) => {
        expect(shortStationName(name)).toBe(short)
    })
})
