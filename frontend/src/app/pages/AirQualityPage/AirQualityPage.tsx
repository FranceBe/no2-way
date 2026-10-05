import { AirQualityWidget } from '@/features/air-quality'
import { useCurrentLocation } from '@/shared/location'

export const AirQualityPage = () => {
    const location = useCurrentLocation()
    return <AirQualityWidget location={location} />
}
