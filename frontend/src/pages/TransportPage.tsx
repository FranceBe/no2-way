import { useCurrentLocation } from '../location/useSelectedLocation'
import { ComingSoon } from './ComingSoon'

// Placeholder until the transport widgets exist (lines, arrivals, bikes)
export const TransportPage = () => {
    const location = useCurrentLocation()
    return (
        <ComingSoon title="Transport">
            Tube lines, next departures and Santander bikes around{' '}
            {location.name}.
        </ComingSoon>
    )
}
