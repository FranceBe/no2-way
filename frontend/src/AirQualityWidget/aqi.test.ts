import { describe, expect, it } from 'vitest'
import type { AirReading } from '../api/types'
import { AQI_LEVELS, getAqiLevel, summarize } from './aqi'

const reading = (ts: string, european_aqi: number | null): AirReading => ({
    ts,
    grid: '51.50,-0.10',
    pm2_5: null,
    pm10: null,
    nitrogen_dioxide: null,
    ozone: null,
    european_aqi,
})

describe('getAqiLevel', () => {
    it.each([
        [0, 'good'],
        [19.9, 'good'],
        [20, 'fair'],
        [39, 'fair'],
        [40, 'moderate'],
        [60, 'poor'],
        [79, 'poor'],
        [80, 'very-poor'],
        [99, 'very-poor'],
        [100, 'extremely-poor'],
        [250, 'extremely-poor'],
    ])('AQI %d is %s', (aqi, id) => {
        expect(getAqiLevel(aqi).id).toBe(id)
    })

    it('has contiguous levels covering 0 to infinity', () => {
        expect(AQI_LEVELS[0].min).toBe(0)
        expect(AQI_LEVELS.at(-1)!.max).toBe(Infinity)
        AQI_LEVELS.slice(1).forEach((level, i) =>
            expect(level.min).toBe(AQI_LEVELS[i].max)
        )
    })
})

describe('summarize', () => {
    it('returns the latest reading, the peak and the hours at Poor or worse', () => {
        const readings = [
            reading('2026-10-05T10:00', 30),
            reading('2026-10-05T11:00', 85),
            reading('2026-10-05T12:00', 60),
            reading('2026-10-05T13:00', 12),
        ]

        expect(summarize(readings)).toEqual({
            latest: readings[3],
            peak: readings[1],
            hoursPoorOrWorse: 2,
            hoursWithData: 4,
        })
    })

    it('ignores hours without an AQI value', () => {
        const readings = [
            reading('2026-10-05T10:00', 70),
            reading('2026-10-05T11:00', 25),
            reading('2026-10-05T12:00', null),
        ]

        const summary = summarize(readings)
        expect(summary.latest).toBe(readings[1])
        expect(summary.hoursWithData).toBe(2)
        expect(summary.hoursPoorOrWorse).toBe(1)
    })

    it('keeps the first reading when the peak is reached twice', () => {
        const readings = [
            reading('2026-10-05T10:00', 50),
            reading('2026-10-05T11:00', 50),
        ]
        expect(summarize(readings).peak).toBe(readings[0])
    })

    it('handles an empty series', () => {
        expect(summarize([])).toEqual({
            latest: null,
            peak: null,
            hoursPoorOrWorse: 0,
            hoursWithData: 0,
        })
    })
})
