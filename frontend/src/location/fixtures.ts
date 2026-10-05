import type { Location } from '../api/types'

// Same shape as GET /locations, for stories and tests
export const FIXTURE_LOCATIONS: Location[] = [
    { id: 'camden', name: 'Camden', lat: 51.539, lon: -0.142, corridor: 'a1' },
    {
        id: 'hackney',
        name: 'Hackney',
        lat: 51.545,
        lon: -0.055,
        corridor: 'a10',
    },
    {
        id: 'brixton',
        name: 'Brixton',
        lat: 51.461,
        lon: -0.116,
        corridor: 'a23',
    },
]
