import { useCurrentLocation } from '@/shared/location'
import { ComingSoon } from '../ComingSoon/ComingSoon'

// Placeholder until the road congestion widget exists (GET /roads?corridor=…)
export const RoadsPage = () => {
    const location = useCurrentLocation()
    return (
        <ComingSoon title="Road congestion">
            Traffic on the {location.corridor.toUpperCase()} corridor near{' '}
            {location.name}.
        </ComingSoon>
    )
}
