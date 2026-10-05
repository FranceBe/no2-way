import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { airQuery } from '@/shared/api/queries'
import type { Location } from '@no2-way/shared'
import { AirQualityPanel } from '../AirQualityPanel/AirQualityPanel'

type AirQualityWidgetProps = {
    location: Location
    hours?: number
}

export const AirQualityWidget = ({
    location,
    hours: initialHours = 48,
}: AirQualityWidgetProps) => {
    const [hours, setHours] = useState(initialHours)

    // GET /air?location=<id>&hours=48. The previous series stays on screen
    // while another location or range loads, instead of flashing a loader
    const {
        data: readings,
        isPending,
        error,
        isPlaceholderData,
        dataUpdatedAt,
    } = useQuery({
        ...airQuery(location.id, hours),
        placeholderData: keepPreviousData,
    })

    // A failed refresh keeps the readings on screen, but only if they are the
    // ones asked for: placeholder data belongs to the previous location or range
    const current = readings !== undefined && !isPlaceholderData

    return (
        <AirQualityPanel
            locationName={location.name}
            hours={hours}
            onHoursChange={setHours}
            readings={readings}
            isLoading={isPending}
            isRefreshing={isPlaceholderData && !error}
            error={error && !current ? error.message : undefined}
            staleSince={error && current ? dataUpdatedAt : undefined}
        />
    )
}
