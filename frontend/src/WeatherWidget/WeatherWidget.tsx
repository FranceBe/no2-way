import { useWeather } from '../api/queries'
import { WeatherCard, WeatherCardMessage } from './WeatherCard'

type WeatherWidgetProps = {
    location?: string
}

export const WeatherWidget = ({ location = 'camden' }: WeatherWidgetProps) => {
    // GET /weather?location=camden — `weather` is the response, kept in react-query's state
    const { data: weather, isPending, error } = useWeather(location)

    if (isPending)
        return <WeatherCardMessage busy>Loading weather…</WeatherCardMessage>
    if (error)
        return (
            <WeatherCardMessage>
                Weather unavailable ({error.message})
            </WeatherCardMessage>
        )

    return <WeatherCard location={location} weather={weather} />
}
