import { useCurrentLocation } from '@/shared/location'
import {
    Departures,
    FirstLastTrains,
    IncidentHistory,
    LineAlerts,
    NearbyBikes,
    TransportControls,
    useTransportSelection,
} from '@/features/transport'
import './TransportPage.css'

// Lines status, then one board for the line / stop / direction picked in the
// controls
export const TransportPage = () => {
    const location = useCurrentLocation()
    const { line, stop, direction } = useTransportSelection()

    return (
        <div className="transport-page">
            <LineAlerts />
            <TransportControls />
            <div className="transport-grid">
                <Departures line={line} stop={stop} direction={direction} />
                <FirstLastTrains
                    line={line}
                    stop={stop}
                    direction={direction}
                />
                <IncidentHistory line={line} />
                <NearbyBikes location={location} line={line} stop={stop} />
            </div>
        </div>
    )
}
