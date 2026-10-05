import { useOutletContext, useSearchParams } from 'react-router'
import { useLocations } from '../api/queries'
import type { Location } from '../api/types'

// The only place the default neighbourhood is written down
export const DEFAULT_LOCATION_ID = 'camden'
export const LOCATION_PARAM = 'location'

// The neighbourhood the whole app shows, kept in ?location=… so it survives a
// reload and can be shared. An unknown or missing id falls back to the default
export const useSelectedLocation = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const { data: locations = [], isPending, error } = useLocations()

    const requestedId = searchParams.get(LOCATION_PARAM)
    const location =
        locations.find((l) => l.id === requestedId) ??
        locations.find((l) => l.id === DEFAULT_LOCATION_ID) ??
        locations[0]

    // Other query params are kept; each change is a history entry, so Back works
    const setLocation = (id: string) =>
        setSearchParams((params) => {
            const next = new URLSearchParams(params)
            next.set(LOCATION_PARAM, id)
            return next
        })

    return { locations, location, setLocation, isPending, error }
}

// For tab pages: App only renders them once the location is resolved
export const useCurrentLocation = () => useOutletContext<Location>()
