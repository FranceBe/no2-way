import { formatDateTime } from '@/shared/time'
import type { Incident } from '../../utils/incidents'
import {
    disruptionLevel,
    formatDuration,
    incidentSpan,
} from '../../utils/incidentView'
import './IncidentList.css'

type IncidentListProps = {
    incidents: Incident[]
    now: number
}

// Every incident, most recent first: the readable view of the timeline
export const IncidentList = ({ incidents, now }: IncidentListProps) => (
    <div className="incident-list">
        <table className="incident-table">
            <thead>
                <tr>
                    <th scope="col">Started</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Disruption</th>
                </tr>
            </thead>
            <tbody>
                {incidents.toReversed().map((incident) => {
                    const { start, duration } = incidentSpan(incident, now)
                    return (
                        <tr key={incident.start}>
                            <td className="incident-table__when">
                                {formatDateTime(start)}
                            </td>
                            <td className="incident-table__when">
                                {incident.end === null && (
                                    <span className="incident-ongoing">
                                        Ongoing
                                    </span>
                                )}
                                {formatDuration(duration)}
                            </td>
                            <td>
                                <span className="incident-table__description">
                                    <span
                                        className={`incident-swatch incident-swatch--${disruptionLevel(incident.severity)}`}
                                        aria-hidden
                                    />
                                    {incident.description}
                                </span>
                                {incident.reasons.map((reason) => (
                                    <span
                                        key={reason}
                                        className="incident-table__reason"
                                    >
                                        {reason}
                                    </span>
                                ))}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
)
