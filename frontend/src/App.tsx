import { WeatherWidget } from './WeatherWidget/WeatherWidget'
import './App.css'

const App = () => {
  return (
    <>
      <header className="app-header">
        <WeatherWidget location="camden" />
      </header>
    </>
  )
}

export default App
