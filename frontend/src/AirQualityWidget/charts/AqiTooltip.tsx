import type { TooltipContentProps } from 'recharts'
import { getAqiLevel, POLLUTANTS } from '../aqi'
import { AqiBadge } from '../AqiBadge'
import { formatDateTime } from '../time'
import type { ChartPoint } from './chartData'

// Hover card of the AQI chart: the hour, its AQI level and every pollutant
export const AqiTooltip = ({ active, payload }: TooltipContentProps) => {
    const point = payload?.[0]?.payload as ChartPoint | undefined
    if (!active || !point) return null

    return (
        <div className="aq-tooltip">
            <p className="aq-tooltip__time">{formatDateTime(point.time)}</p>
            {point.aqi === null ? (
                <p>No data for this hour</p>
            ) : (
                <p className="aq-tooltip__aqi">
                    <strong>AQI {point.aqi}</strong>
                    <AqiBadge level={getAqiLevel(point.aqi)} />
                </p>
            )}
            <dl className="aq-tooltip__pollutants">
                {POLLUTANTS.map(({ key, label, unit }) => (
                    <div key={key}>
                        <dt>{label}</dt>
                        <dd>
                            {point[key] === null
                                ? '–'
                                : `${point[key]} ${unit}`}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}
