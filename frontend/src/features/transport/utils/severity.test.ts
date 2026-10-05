import { describe, expect, it } from 'vitest'
import { disruptionLevel, disruptionRank, isDisruption } from './severity'

const status = (severity: number) => ({
    severity,
    description: '',
    reason: null,
})

describe('disruptionLevel', () => {
    it.each([
        [0, null], // Special Service
        [10, null], // Good Service
        [18, null], // No Issues
        [19, null], // Information
        [20, null], // Service Closed, planned
        [9, 'minor'], // Minor Delays
        [7, 'minor'], // Reduced Service
        [15, 'minor'], // Diverted
        [17, 'minor'], // Issues Reported
        [6, 'severe'], // Severe Delays
        [1, 'closure'], // Closed
        [2, 'closure'], // Suspended
        [5, 'closure'], // Part Closure
        [8, 'closure'], // Bus Service
        [11, 'closure'], // Part Closed
        [16, 'closure'], // Not Running
    ])('severity %i is %s', (severity, level) => {
        expect(disruptionLevel(severity)).toBe(level)
    })

    it('shows a code TfL adds later as a minor disruption', () => {
        expect(disruptionLevel(21)).toBe('minor')
    })
})

describe('disruptionRank', () => {
    it('orders by gravity, not by code', () => {
        expect(disruptionRank(16)).toBeGreaterThan(disruptionRank(6)) // Not Running > Severe Delays
        expect(disruptionRank(6)).toBeGreaterThan(disruptionRank(9)) // Severe > Minor Delays
        expect(disruptionRank(9)).toBeGreaterThan(disruptionRank(0)) // Minor > Special Service
    })
})

describe('isDisruption', () => {
    it('is true for disruptions only', () => {
        expect(isDisruption(status(16))).toBe(true)
        expect(isDisruption(status(0))).toBe(false)
        expect(isDisruption(status(20))).toBe(false)
    })
})
