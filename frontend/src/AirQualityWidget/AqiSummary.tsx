import type { AirReading } from '@no2-way/shared'
import { getAqiLevel, summarize } from './aqi'
import { AqiBadge } from './AqiBadge'
import { formatDateTime, parseTs } from './time'

type AqiSummaryProps = {
    readings: AirReading[]
    rangeLabel: string
}

// Headline numbers above the chart: now, peak of the period, time spent in bad air
export const AqiSummary = ({ readings, rangeLabel }: AqiSummaryProps) => {
    const { latest, peak, hoursPoorOrWorse, hoursWithData } =
        summarize(readings)

    return (
        <dl className="aq-summary">
            <StatTile label="Now" reading={latest} />
            <StatTile label={`Peak (${rangeLabel})`} reading={peak} />
            <div className="aq-stat">
                <dt>Poor or worse</dt>
                <dd className="aq-stat__value">{hoursPoorOrWorse} h</dd>
                <dd className="aq-stat__meta">
                    out of {hoursWithData} h with data
                </dd>
            </div>
        </dl>
    )
}

const StatTile = ({
    label,
    reading,
}: {
    label: string
    reading: AirReading | null
}) => (
    <div className="aq-stat">
        <dt>{label}</dt>
        {reading?.european_aqi == null ? (
            <dd className="aq-stat__value">–</dd>
        ) : (
            <>
                <dd className="aq-stat__value">
                    {reading.european_aqi}
                    <AqiBadge level={getAqiLevel(reading.european_aqi)} />
                </dd>
                <dd className="aq-stat__meta">
                    {formatDateTime(parseTs(reading.ts))}
                </dd>
            </>
        )}
    </div>
)
