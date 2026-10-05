import { useLineHistory } from '@/shared/api/queries'
import { TransportCard } from '../TransportCard/TransportCard'
import { IncidentOverview } from '../IncidentOverview/IncidentOverview'
import { toIncidents } from '../../utils/incidents'

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
