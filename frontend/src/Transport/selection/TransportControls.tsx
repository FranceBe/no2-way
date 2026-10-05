import { useId } from 'react'
import type { Direction } from '@no2-way/shared'
import { useLines, useLineStops } from '../../api/queries'
import { lineColor } from '../../lineColors'
import { useTransportSelection } from './useTransportSelection'

const DIRECTIONS: { value: Direction; label: string }[] = [
    { value: 'outbound', label: 'Outbound' },
    { value: 'inbound', label: 'Inbound' },
]

// Line, then stop, then direction. Every widget below reads the same selection
export const TransportControls = () => {
    const { line, stop, direction, setLine, setStop, setDirection } =
        useTransportSelection()
    const { data: snapshot } = useLines()
    const { data: stops = [], isFetching: loadingStops } = useLineStops(line)
    const lineId = useId()
    const stopId = useId()

    const lines = [...(snapshot?.lines ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name)
    )

    return (
        <div className="transport-controls">
            <span
                className="transport-controls__swatch"
                style={{ background: line ? lineColor(line) : undefined }}
                aria-hidden
            />
            <label htmlFor={lineId} className="visually-hidden">
                Line
            </label>
            <select
                id={lineId}
                className="transport-select"
                value={line ?? ''}
                onChange={(e) => setLine(e.target.value)}
            >
                <option value="" disabled>
                    Pick a line
                </option>
                {lines.map((l) => (
                    <option key={l.id} value={l.id}>
                        {l.name}
                    </option>
                ))}
            </select>

            <label htmlFor={stopId} className="visually-hidden">
                Stop
            </label>
            <select
                id={stopId}
                className="transport-select"
                value={stop ?? ''}
                disabled={!line || loadingStops}
                onChange={(e) => setStop(e.target.value)}
            >
                <option value="" disabled>
                    {loadingStops ? 'Loading stops…' : 'Pick a stop'}
                </option>
                {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>

            <div
                className="transport-toggle"
                role="group"
                aria-label="Direction"
            >
                {DIRECTIONS.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        className="transport-toggle__button"
                        aria-pressed={direction === value}
                        onClick={() => setDirection(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    )
}
