import { formatDateTime, parseTs } from '../../AirQualityWidget/time'
import type { Incident } from './incidents'
import { IncidentList } from './IncidentList'
import { IncidentTimeline } from './IncidentTimeline'
import {
    DISRUPTION_LEVELS,
    formatDuration,
    summarizeIncidents,
} from './incidentView'
import './Incidents.css'

const WEEK = 7 * 24 * 3600e3

type IncidentOverviewProps = {
    incidents: Incident[] // oldest first, as toIncidents returns them
    now: number // end of the 7-day window, ms
}

// Headline numbers, the week on a timeline, then the details
export const IncidentOverview = ({ incidents, now }: IncidentOverviewProps) => {
    const summary = summarizeIncidents(incidents, now, WEEK)
    const percent = Math.round(summary.share * 100)

    return (
        <div className="incident-overview">
            <dl className="incident-summary">
                <div className="incident-stat">
                    <dt>Incidents</dt>
                    <dd className="incident-stat__value">{summary.count}</dd>
                    <dd className="incident-stat__meta">
                        {summary.ongoing ? '1 ongoing' : 'none ongoing'}
                    </dd>
                </div>
                <div className="incident-stat">
                    <dt>Disrupted</dt>
                    <dd className="incident-stat__value">
                        {summary.count > 0
                            ? formatDuration(summary.disrupted)
                            : '–'}
                    </dd>
                    <dd className="incident-stat__meta">
                        {summary.share > 0 && percent === 0
                            ? 'under 1% of the week'
                            : `${percent}% of the week`}
                    </dd>
                </div>
                <div className="incident-stat">
                    <dt>Longest</dt>
                    {summary.longest ? (
                        <>
                            <dd className="incident-stat__value">
                                {formatDuration(summary.longestDuration)}
                            </dd>
                            <dd className="incident-stat__meta">
                                {formatDateTime(parseTs(summary.longest.start))}
                            </dd>
                        </>
                    ) : (
                        <dd className="incident-stat__value">–</dd>
                    )}
                </div>
            </dl>

            <IncidentTimeline
                incidents={incidents}
                from={now - WEEK}
                to={now}
            />

            <ul className="incident-legend" aria-label="Legend">
                {DISRUPTION_LEVELS.map(({ level, label }) => (
                    <li key={level}>
                        <span
                            className={`incident-swatch incident-swatch--${level}`}
                            aria-hidden
                        />
                        {label}
                    </li>
                ))}
            </ul>

            {incidents.length > 0 ? (
                <IncidentList incidents={incidents} now={now} />
            ) : (
                <p className="transport-card__message">
                    No disruption in the last 7 days.
                </p>
            )}
        </div>
    )
}
