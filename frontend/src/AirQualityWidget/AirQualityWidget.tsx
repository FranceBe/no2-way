import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { airQuery, useLocations } from '../api/queries'
import { AirQualityPanel } from './AirQualityPanel'

type AirQualityWidgetProps = {
    location?: string
    hours?: number
}

export const AirQualityWidget = ({
    location: initialLocation = 'camden',
    hours: initialHours = 48,
}: AirQualityWidgetProps) => {
    const [location, setLocation] = useState(initialLocation)
    const [hours, setHours] = useState(initialHours)

    const { data: locations = [] } = useLocations()
    // GET /air?location=camden&hours=48. The previous series stays on screen
    // while another location or range loads, instead of flashing a loader
    const {
        data: readings,
        isPending,
        error,
        isPlaceholderData,
    } = useQuery({
        ...airQuery(location, hours),
        placeholderData: keepPreviousData,
    })

    return (
        <AirQualityPanel
            locations={locations}
            location={location}
            onLocationChange={setLocation}
            hours={hours}
            onHoursChange={setHours}
            readings={readings}
            isLoading={isPending}
            isRefreshing={isPlaceholderData}
            error={error?.message}
        />
    )
}
