import { useId } from 'react'
import type { AirReading } from '../api/types'
import { POLLUTANTS } from './aqi'
import { AqiSummary } from './AqiSummary'
import { AqiChart } from './charts/AqiChart'
import { PollutantChart } from './charts/PollutantChart'
import { RANGES } from './time'
import './AirQualityWidget.css'

type AirQualityPanelProps = {
    locationName: string
    hours: number
    onHoursChange: (hours: number) => void
    readings?: AirReading[]
    isLoading?: boolean
    isRefreshing?: boolean // previous data still shown while the new one loads
    error?: string
}

// Presentational panel: no data fetching, so it can be rendered as-is in Storybook
export const AirQualityPanel = ({
    locationName,
    hours,
    onHoursChange,
    readings,
    isLoading = false,
    isRefreshing = false,
    error,
}: AirQualityPanelProps) => {
    const titleId = useId()
    const rangeLabel =
        RANGES.find((r) => r.hours === hours)?.label ?? `${hours}h`

    return (
        <section
            className="aq-panel"
            aria-labelledby={titleId}
            aria-busy={isLoading || isRefreshing}
        >
            <header className="aq-panel__header">
                <div>
                    <h2 id={titleId} className="aq-panel__title">
                        Air quality
                    </h2>
                    <p className="aq-panel__subtitle">
                        {locationName} · European AQI, hourly
                    </p>
                </div>

                <div className="aq-panel__controls">
                    <div
                        className="aq-range"
                        role="group"
                        aria-label="Time range"
                    >
                        {RANGES.map((range) => (
                            <button
                                key={range.hours}
                                type="button"
                                className="aq-range__button"
                                aria-pressed={range.hours === hours}
                                onClick={() => onHoursChange(range.hours)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <PanelBody
                readings={readings}
                hours={hours}
                rangeLabel={rangeLabel}
                isLoading={isLoading}
                error={error}
            />

            <p className="aq-panel__source">
                Modelled data from Open-Meteo (~10 km grid), not street-level
                sensors.
            </p>
        </section>
    )
}

type PanelBodyProps = Pick<
    AirQualityPanelProps,
    'readings' | 'hours' | 'isLoading' | 'error'
> & {
    rangeLabel: string
}

const PanelBody = ({
    readings,
    hours,
    rangeLabel,
    isLoading,
    error,
}: PanelBodyProps) => {
    if (isLoading)
        return <p className="aq-panel__message">Loading air quality…</p>
    if (error)
        return (
            <p className="aq-panel__message">
                Air quality unavailable ({error})
            </p>
        )
    if (!readings || readings.length === 0) {
        return <p className="aq-panel__message">No readings for this period.</p>
    }

    return (
        <>
            <AqiSummary readings={readings} rangeLabel={rangeLabel} />
            <div className="aq-panel__chart">
                <AqiChart readings={readings} hours={hours} />
            </div>
            <div className="aq-panel__pollutants">
                {POLLUTANTS.map((pollutant) => (
                    <PollutantChart
                        key={pollutant.key}
                        readings={readings}
                        pollutant={pollutant}
                    />
                ))}
            </div>
        </>
    )
}
