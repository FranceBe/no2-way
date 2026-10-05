import { AirQualityWidget } from '../AirQualityWidget/AirQualityWidget'
import { useCurrentLocation } from '../location/useSelectedLocation'

export const AirQualityPage = () => {
    const location = useCurrentLocation()
    return <AirQualityWidget location={location} />
}
