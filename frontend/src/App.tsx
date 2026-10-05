import { Outlet } from 'react-router'
import { LocationSelect } from './location/LocationSelect'
import { useSelectedLocation } from './location/useSelectedLocation'
import { Tabs } from './Tabs/Tabs'
import { ThemeToggle } from './ThemeToggle/ThemeToggle'
import { WeatherWidget } from './WeatherWidget/WeatherWidget'
import './App.css'

// Layout shared by every tab. The selected location lives here and is handed
// to the widgets, which never pick one themselves
const App = () => {
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
                    <Outlet context={location} />
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

export default App
