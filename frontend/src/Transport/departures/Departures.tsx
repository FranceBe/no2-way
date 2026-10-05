import type { Direction } from '@no2-way/shared'
import { useArrivals } from '../../api/queries'
import { TransportCard } from '../TransportCard'
import { DeparturesBoard } from './DeparturesBoard'

type DeparturesProps = {
    line?: string
    stop?: string
    direction: Direction
}

// Next trains of the selected line at the selected stop (refreshed every 30 s)
export const Departures = ({ line, stop, direction }: DeparturesProps) => {
    // No stop = no request (skipToken)
    const query = useArrivals(line ? stop : undefined, line, direction)

    return (
        <TransportCard
            title="Next departures"
            query={query}
            idle="Pick a line and a stop to see the next trains."
        >
            {(arrivals) => <DeparturesBoard arrivals={arrivals} />}
        </TransportCard>
    )
}
