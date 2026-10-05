import type { RouteObject } from 'react-router'
import App from './App'
import { AirQualityPage } from './pages/AirQualityPage'
import { RoadsPage } from './pages/RoadsPage'
import { ToDefaultTab } from './pages/ToDefaultTab'
import { TransportPage } from './pages/TransportPage'

// Shared by main.tsx (browser router) and the tests (memory router)
export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <ToDefaultTab /> },
            { path: 'air-quality', element: <AirQualityPage /> },
            { path: 'roads', element: <RoadsPage /> },
            { path: 'transport', element: <TransportPage /> },
            { path: '*', element: <ToDefaultTab /> },
        ],
    },
]
