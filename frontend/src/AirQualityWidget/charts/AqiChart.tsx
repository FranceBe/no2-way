import { useMemo } from 'react'
import {
    ComposedChart,
    Line,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    type DotItemDotProps,
} from 'recharts'
import type { AirReading } from '../../api/types'
import { AQI_LEVELS, getAqiLevel, POOR_THRESHOLD } from '../aqi'
import { BAND_OPACITY, useAirPalette } from '../palette'
import { formatTick, getTimeTicks } from '../time'
import { AqiTooltip } from './AqiTooltip'
import { SYNC_ID, toChartPoints } from './chartData'

type AqiChartProps = {
    readings: AirReading[]
    hours: number
    height?: number
}

// European AQI over time, on top of the EEA levels drawn as background bands
export const AqiChart = ({ readings, hours, height = 260 }: AqiChartProps) => {
    const palette = useAirPalette()
    const points = useMemo(() => toChartPoints(readings), [readings])

    // Always show the "Poor" band, so a clean period still reads as clean
    const maxAqi = Math.max(0, ...points.map((p) => p.aqi ?? 0))
    const yMax = Math.max(80, Math.ceil((maxAqi + 5) / 20) * 20)
    const yTicks = Array.from({ length: yMax / 20 + 1 }, (_, i) => i * 20)

    const xTicks = getTimeTicks(
        points.map((p) => p.time),
        hours
    )
    const tickStyle = { fill: palette.muted, fontSize: 12 }

    return (
        <ResponsiveContainer
            width="100%"
            height={height}
            initialDimension={{ width: 600, height }}
        >
            <ComposedChart
                data={points}
                syncId={SYNC_ID}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
                {AQI_LEVELS.filter((level) => level.min < yMax).map((level) => (
                    <ReferenceArea
                        key={level.id}
                        y1={level.min}
                        y2={Math.min(level.max, yMax)}
                        fill={palette.levels[level.id]}
                        fillOpacity={BAND_OPACITY[level.id]}
                        stroke="none"
                        label={{
                            value: level.label,
                            position: 'insideTopRight',
                            fill: palette.muted,
                            fontSize: 11,
                        }}
                    />
                ))}

                <XAxis
                    dataKey="time"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    ticks={xTicks}
                    tickFormatter={formatTick}
                    tick={tickStyle}
                    stroke={palette.axis}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, yMax]}
                    ticks={yTicks}
                    tick={tickStyle}
                    width={32}
                    axisLine={false}
                    tickLine={false}
                />

                <Tooltip
                    content={(props) => <AqiTooltip {...props} />}
                    cursor={{
                        stroke: palette.muted,
                        strokeWidth: 1,
                        strokeDasharray: '3 3',
                    }}
                    isAnimationActive={false}
                />

                <Line
                    dataKey="aqi"
                    name="European AQI"
                    stroke={palette.series}
                    strokeWidth={2}
                    // Hours at "Poor" or worse get a dot coloured by level, with a surface ring
                    dot={({ cx, cy, value, index }: DotItemDotProps) =>
                        typeof value === 'number' && value >= POOR_THRESHOLD ? (
                            <circle
                                key={index}
                                cx={cx}
                                cy={cy}
                                r={4.5}
                                fill={palette.levels[getAqiLevel(value).id]}
                                stroke={palette.surface}
                                strokeWidth={2}
                            />
                        ) : null
                    }
                    activeDot={{
                        r: 4,
                        stroke: palette.surface,
                        strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    )
}
