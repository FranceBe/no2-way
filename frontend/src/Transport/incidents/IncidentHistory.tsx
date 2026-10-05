import { useLineHistory } from '../../api/queries'
import { TransportCard } from '../TransportCard'
import { IncidentOverview } from './IncidentOverview'
import { toIncidents } from './incidents'

const WEEK = 24 * 7

type IncidentHistoryProps = {
    line?: string
}

// Incidents of the selected line over the last 7 days
export const IncidentHistory = ({ line }: IncidentHistoryProps) => {
    const query = useLineHistory(line, WEEK)

    return (
        <TransportCard
            title="Incidents"
            subtitle="Last 7 days"
            query={query}
            idle="Pick a line to see its incidents."
        >
            {(history) => (
                <IncidentOverview
                    incidents={toIncidents(history)}
                    // The window ends when the history was fetched
                    now={query.dataUpdatedAt}
                />
            )}
        </TransportCard>
    )
}
