import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { LocationSelect, useSelectedLocation } from '@/shared/location'
import { Tabs } from '@/app/tabs/Tabs'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { WeatherWidget } from '@/features/weather'
import './AppLayout.css'

// Layout shared by every tab. The selected location lives here and is handed
// to the widgets, which never pick one themselves
export const AppLayout = () => {
    const { locations, location, setLocation, isPending, error } =
        useSelectedLocation()

    return (
        <>
            <header className="app-header">
                <ThemeToggle />
                <div className="app-header__end">
                    <LocationSelect
                        locations={locations}
                        value={location?.id}
                        onChange={setLocation}
                    />
                    {location && <WeatherWidget location={location} />}
                </div>
            </header>
            <Tabs />
            <main className="app-main">
                {location ? (
                    // The pages are loaded lazily (see routes.tsx)
                    <Suspense
                        fallback={
                            <p className="app-message" aria-busy>
                                Loading…
                            </p>
                        }
                    >
                        <Outlet context={location} />
                    </Suspense>
                ) : (
                    <p className="app-message" aria-busy={isPending}>
                        {isPending
                            ? 'Loading neighbourhoods…'
                            : error
                              ? `Neighbourhoods unavailable (${error.message})`
                              : 'No neighbourhood available.'}
                    </p>
                )}
            </main>
        </>
    )
}
