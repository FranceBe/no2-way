import { AirQualityWidget } from './AirQualityWidget/AirQualityWidget'
import { ThemeToggle } from './ThemeToggle/ThemeToggle'
import { WeatherWidget } from './WeatherWidget/WeatherWidget'
import './App.css'

const App = () => {
    return (
        <>
            <header className="app-header">
                <ThemeToggle />
                <WeatherWidget location="camden" />
            </header>
            <main className="app-main">
                <AirQualityWidget location="camden" />
            </main>
        </>
    )
}

export default App
