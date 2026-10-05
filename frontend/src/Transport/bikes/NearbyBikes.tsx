import type { BikePoint, Location } from '@no2-way/shared'
import { useBikes, useLineStops } from '../../api/queries'
import { shortStationName } from '../stations'
import { TransportCard } from '../TransportCard'

type NearbyBikesProps = {
    location: Location
    line?: string
    stop?: string
}

// Santander Cycles docks around the selected stop, or around the
// neighbourhood until a stop is picked
export const NearbyBikes = ({ location, line, stop }: NearbyBikesProps) => {
    // Already cached by the stop picker: no extra request
    const stops = useLineStops(line)
    const selected = stops.data?.find((s) => s.id === stop)
    // A stop is picked but its position is not known yet: wait for it rather
    // than load the neighbourhood's docks for a split second
    const locating = Boolean(line && stop) && stops.isPending

    const query = useBikes(
        locating
            ? undefined
            : selected
              ? { lat: selected.lat, lon: selected.lon }
              : { location: location.id }
    )
    const area = selected ? shortStationName(selected.name) : location.name

    return (
        <TransportCard
            title="Bikes nearby"
            subtitle={
                locating ? 'Within 500 m' : `Around ${area}, within 500 m`
            }
            query={query}
            idle="Loading…"
        >
            {(bikes) => <BikeList bikes={bikes} />}
        </TransportCard>
    )
}

type BikeListProps = {
    bikes: BikePoint[] // nearest first
}

export const BikeList = ({ bikes }: BikeListProps) => {
    if (bikes.length === 0) {
        return <p className="transport-card__message">No dock nearby.</p>
    }

    const total = bikes.reduce((sum, b) => sum + b.bikes, 0)

    return (
        <>
            <p className="bike-list__total">
                <strong>{total}</strong> {total === 1 ? 'bike' : 'bikes'} in{' '}
                {bikes.length} {bikes.length === 1 ? 'dock' : 'docks'}
            </p>
            <ul className="bike-list">
                {bikes.map((b) => (
                    <li key={b.id} className="bike-list__item">
                        <span className="bike-list__name">{b.name}</span>
                        <span className="bike-list__meta">
                            {b.distance} m · {b.bikes} bikes · {b.emptyDocks}{' '}
                            free docks
                        </span>
                    </li>
                ))}
            </ul>
        </>
    )
}
