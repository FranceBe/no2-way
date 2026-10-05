import type { RouteObject } from 'react-router'
import { AppLayout } from '../layout/AppLayout/AppLayout'
import { AirQualityPage } from '../pages/AirQualityPage/AirQualityPage'
import { RoadsPage } from '../pages/RoadsPage/RoadsPage'
import { ToDefaultTab } from './ToDefaultTab'
import { TransportPage } from '../pages/TransportPage/TransportPage'

// Shared by main.tsx (browser router) and the tests (memory router)
export const routes: RouteObject[] = [
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { index: true, element: <ToDefaultTab /> },
            { path: 'air-quality', element: <AirQualityPage /> },
            { path: 'roads', element: <RoadsPage /> },
            { path: 'transport', element: <TransportPage /> },
            { path: '*', element: <ToDefaultTab /> },
        ],
    },
]
