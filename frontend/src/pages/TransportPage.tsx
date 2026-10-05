import { useCurrentLocation } from '../location/useSelectedLocation'
import { LineAlerts } from '../Transport/alerts/LineAlerts'
import { NearbyBikes } from '../Transport/bikes/NearbyBikes'
import { Departures } from '../Transport/departures/Departures'
import { IncidentHistory } from '../Transport/incidents/IncidentHistory'
import { TransportControls } from '../Transport/selection/TransportControls'
import { useTransportSelection } from '../Transport/selection/useTransportSelection'
import { FirstLastTrains } from '../Transport/timetable/FirstLastTrains'

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
