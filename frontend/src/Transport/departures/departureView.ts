import type { Arrival } from '@no2-way/shared'
import { shortStationName } from '../stations'

export interface Destination {
    name: string
    via: string | null // branch, e.g. "Bank" for the Northern line
}

// What the board shows for a train. TfL leaves `destination` empty now and
// then; `towards` ("Edgware via Bank") is the fallback, and carries the branch
export function destinationOf(arrival: Arrival): Destination {
    const [towardsName, via = null] = (arrival.towards ?? '').split(' via ')
    const name =
        (arrival.destination && shortStationName(arrival.destination)) ||
        towardsName ||
        // What the real boards say when they don't know either
        'Check front of train'
    return { name, via }
}

export interface PlatformName {
    name: string // "Platform 8"
    heading: string | null // "Northbound"
}

// TfL names platforms "Northbound - Platform 8"
export function splitPlatform(platform: string): PlatformName {
    const [heading, name] = platform.split(' - ')
    return name ? { name, heading } : { name: platform, heading: null }
}
