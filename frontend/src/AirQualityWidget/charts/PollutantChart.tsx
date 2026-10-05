import { useMemo } from 'react'
import {
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type { AirReading } from '../../api/types'
import type { Pollutant } from '../aqi'
import { InfoTip } from '../InfoTip'
import { useAirPalette } from '../palette'
import { SYNC_ID, toChartPoints } from './chartData'

type PollutantChartProps = {
    readings: AirReading[]
    pollutant: Pollutant
    height?: number
}

// Small multiple: one pollutant, its own scale, with the WHO guideline as a dashed line.
// Hovering only moves the synced crosshair: values show in the main AQI tooltip
export const PollutantChart = ({
    readings,
    pollutant,
    height = 96,
}: PollutantChartProps) => {
    const palette = useAirPalette()
    const points = useMemo(() => toChartPoints(readings), [readings])
    const { key, label, name, description, unit, whoGuideline, whoPeriod } =
        pollutant

    const values = points
        .map((p) => p[key])
        .filter((v): v is number => v !== null)
    const latest = values.at(-1)
    const peak = Math.max(0, ...values)
    // Keep the guideline in view even when every value is far below it
    const yMax = Math.max(peak, whoGuideline) * 1.15
    const aboveGuideline = values.filter((v) => v > whoGuideline).length

    return (
        <figure className="aq-pollutant">
            <figcaption className="aq-pollutant__header">
                <span className="aq-pollutant__title">
                    <span className="aq-pollutant__symbol">
                        <span className="aq-pollutant__name">{label}</span>
                        <InfoTip label={`About ${name.toLowerCase()}`}>
                            <p className="info-tip__title">
                                {label} · {name}
                            </p>
                            <p>{description}</p>
                            <p className="info-tip__meta">
                                Dashed line: level recommended by the World
                                Health Organization (WHO), {whoGuideline} {unit}{' '}
                                as a {whoPeriod}. µg/m³ = micrograms per cubic
                                metre of air.
                            </p>
                        </InfoTip>
                    </span>
                    <span className="aq-pollutant__fullname">{name}</span>
                </span>
                <span className="aq-pollutant__value">
                    {latest === undefined ? '–' : `${latest} ${unit}`}
                </span>
            </figcaption>

            <ResponsiveContainer
                width="100%"
                height={height}
                initialDimension={{ width: 260, height }}
            >
                <LineChart
                    data={points}
                    syncId={SYNC_ID}
                    margin={{ top: 6, right: 4, bottom: 0, left: 4 }}
                >
                    <XAxis
                        dataKey="time"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        hide
                    />
                    <YAxis domain={[0, yMax]} hide />
                    <ReferenceLine
                        y={whoGuideline}
                        stroke={palette.muted}
                        strokeDasharray="4 4"
                        label={{
                            value: `WHO ${whoGuideline}`,
                            position: 'insideBottomRight',
                            fill: palette.muted,
                            fontSize: 10,
                        }}
                    />
                    <Tooltip
                        content={() => null}
                        cursor={{
                            stroke: palette.muted,
                            strokeWidth: 1,
                            strokeDasharray: '3 3',
                        }}
                        isAnimationActive={false}
                    />
                    <Line
                        dataKey={key}
                        name={label}
                        stroke={palette.series}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                            r: 3,
                            stroke: palette.surface,
                            strokeWidth: 2,
                        }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>

            <p className="aq-pollutant__footnote">
                {aboveGuideline === 0
                    ? 'Always below the WHO guideline'
                    : `${aboveGuideline} h above the WHO guideline`}
            </p>
        </figure>
    )
}
