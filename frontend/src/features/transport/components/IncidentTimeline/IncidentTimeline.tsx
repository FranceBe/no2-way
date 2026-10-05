import { formatDateTime, getTimeTicks } from '@/shared/time'
import type { Incident } from '../../utils/incidents'
import {
    disruptionLevel,
    formatDuration,
    incidentSpan,
} from '../../utils/incidentView'
import './IncidentTimeline.css'

const HOUR = 3600e3

// Where the tooltip hangs from its bar. With tooltips at most 70% of the
// card wide, these cut-offs keep every one of them inside the card
const align = (leftPercent: number) =>
    leftPercent < 30 ? 'start' : leftPercent <= 70 ? 'center' : 'end'

const weekdayFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
})
const dayFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    day: 'numeric',
})

type IncidentTimelineProps = {
    incidents: Incident[]
    from: number // window start, ms
    to: number // window end (now), ms
}

// One bar per incident on a single time track. Incidents of a line never
// overlap, so one row is enough. Each bar shows its details on hover and focus;
// the table below holds the same details for everyone
export const IncidentTimeline = ({
    incidents,
    from,
    to,
}: IncidentTimelineProps) => {
    const percent = (time: number) => ((time - from) / (to - from)) * 100

    // London midnights inside the window: one gridline and one label per day
    const firstHour = Math.ceil(from / HOUR) * HOUR
    const hours = Array.from(
        { length: Math.floor((to - firstHour) / HOUR) + 1 },
        (_, i) => firstHour + i * HOUR
    )
    const midnights = getTimeTicks(hours, 7 * 24)

    return (
        <figure className="incident-timeline">
            <div className="incident-timeline__track">
                {midnights.map((time) => (
                    <span
                        key={time}
                        className="incident-timeline__gridline"
                        style={{ left: `${percent(time)}%` }}
                        aria-hidden
                    />
                ))}
                <ol className="incident-timeline__bars">
                    {incidents.map((incident) => {
                        const { start, end, duration } = incidentSpan(
                            incident,
                            to
                        )
                        const left = percent(Math.max(start, from))
                        const ongoing = incident.end === null
                        const when = `${formatDateTime(start)}, ${
                            ongoing
                                ? `ongoing for ${formatDuration(duration)}`
                                : formatDuration(duration)
                        }`

                        return (
                            <li
                                key={incident.start}
                                className={`incident-bar incident-bar--${disruptionLevel(incident.severity)}`}
                                data-ongoing={ongoing || undefined}
                                style={{
                                    left: `${left}%`,
                                    width: `${percent(end) - left}%`,
                                }}
                                tabIndex={0}
                                aria-label={`${incident.description}, ${when}`}
                            >
                                <span
                                    className="incident-tip"
                                    data-align={align(left)}
                                    aria-hidden
                                >
                                    <strong>{incident.description}</strong>
                                    <span>{when}</span>
                                    {incident.reasons.map((reason) => (
                                        <span
                                            key={reason}
                                            className="incident-tip__reason"
                                        >
                                            {reason}
                                        </span>
                                    ))}
                                </span>
                            </li>
                        )
                    })}
                </ol>
            </div>
            <div className="incident-timeline__axis" aria-hidden>
                {midnights.map((time) => (
                    <span key={time} style={{ left: `${percent(time)}%` }}>
                        <span className="incident-timeline__weekday">
                            {weekdayFormat.format(time)}{' '}
                        </span>
                        {dayFormat.format(time)}
                    </span>
                ))}
            </div>
            <figcaption className="visually-hidden">
                Incidents over the last 7 days, one bar per incident. The table
                below lists them.
            </figcaption>
        </figure>
    )
}
