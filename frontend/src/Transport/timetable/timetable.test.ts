import { describe, expect, it } from 'vitest'
import type { Schedule } from '@no2-way/shared'
import { scheduleForDate } from './timetable'

const schedule = (name: string): Schedule => ({
    name,
    first: '05:42',
    last: '00:31',
})

// What the Northern line returns at most stations
const NORTHERN = [
    schedule('Monday - Thursday'),
    schedule('Friday'),
    schedule('Saturday (also Good Friday)'),
    schedule('Sunday'),
]

// London time on a day of October 2026 (British Summer Time, UTC+1), so the
// tests don't depend on the machine's time zone. 2026-10-05 is a Monday
const at = (day: number, time: string) =>
    new Date(`2026-10-${String(day).padStart(2, '0')}T${time}+01:00`)

const nameFor = (schedules: Schedule[], date: Date) =>
    scheduleForDate(schedules, date)?.name

describe('scheduleForDate', () => {
    it.each([
        [5, 'Monday - Thursday'],
        [8, 'Monday - Thursday'],
        [9, 'Friday'],
        [10, 'Saturday (also Good Friday)'],
        [11, 'Sunday'],
    ])('on October %i at noon: %s', (day, name) => {
        expect(nameFor(NORTHERN, at(day, '12:00'))).toBe(name)
    })

    it('handles ranges and single days alike', () => {
        const schedules = [schedule('Monday - Friday'), schedule('Saturday')]
        expect(nameFor(schedules, at(7, '12:00'))).toBe('Monday - Friday')
        expect(nameFor(schedules, at(10, '12:00'))).toBe('Saturday')
    })

    it('counts the early hours as the previous service day', () => {
        // Saturday 00:30 is still Friday's service
        expect(nameFor(NORTHERN, at(10, '00:30'))).toBe('Friday')
        // ...and Saturday's starts at 04:00
        expect(nameFor(NORTHERN, at(10, '04:00'))).toBe(
            'Saturday (also Good Friday)'
        )
        // Monday 01:00 is still Sunday
        expect(nameFor(NORTHERN, at(5, '01:00'))).toBe('Sunday')
    })

    it('handles a range across the weekend', () => {
        const schedules = [
            schedule('Monday - Friday'),
            schedule('Saturday - Sunday'),
        ]
        expect(nameFor(schedules, at(11, '12:00'))).toBe('Saturday - Sunday')
        expect(nameFor(schedules, at(9, '12:00'))).toBe('Monday - Friday')
    })

    it('follows London time, not the time zone of the browser', () => {
        // 23:30 UTC on Friday is 00:30 on Saturday in London: still Friday's
        // service. 03:30 UTC on Saturday is 04:30 in London: Saturday's
        expect(nameFor(NORTHERN, new Date('2026-10-09T23:30Z'))).toBe('Friday')
        expect(nameFor(NORTHERN, new Date('2026-10-10T03:30Z'))).toBe(
            'Saturday (also Good Friday)'
        )
    })

    it('ignores schedules whose name is not a day range', () => {
        expect(
            nameFor(
                [schedule('Christmas Day'), schedule('Monday')],
                at(5, '12:00')
            )
        ).toBe('Monday')
    })

    it('returns undefined when no schedule covers the day', () => {
        expect(nameFor([schedule('Sunday')], at(5, '12:00'))).toBeUndefined()
        expect(nameFor([], at(5, '12:00'))).toBeUndefined()
    })
})
