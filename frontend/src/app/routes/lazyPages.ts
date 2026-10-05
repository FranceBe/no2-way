import { lazy } from 'react'

// One chunk per tab, loaded on first visit: Recharts only comes with the air
// quality tab. AppLayout shows a fallback in the page area meanwhile
export const AirQualityPage = lazy(() =>
    import('../pages/AirQualityPage/AirQualityPage').then((m) => ({
        default: m.AirQualityPage,
    }))
)
export const RoadsPage = lazy(() =>
    import('../pages/RoadsPage/RoadsPage').then((m) => ({
        default: m.RoadsPage,
    }))
)
export const TransportPage = lazy(() =>
    import('../pages/TransportPage/TransportPage').then((m) => ({
        default: m.TransportPage,
    }))
)
