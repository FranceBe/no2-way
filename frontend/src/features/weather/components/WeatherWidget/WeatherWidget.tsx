import { useWeather } from '@/shared/api/queries'
import type { Location } from '@no2-way/shared'
import { WeatherCard, WeatherCardMessage } from '../WeatherCard/WeatherCard'

type WeatherWidgetProps = {
    location: Location
}

export const WeatherWidget = ({ location }: WeatherWidgetProps) => {
    // GET /weather?location=<id> — `weather` is the response, kept in react-query's state
    const { data: weather, isPending, error } = useWeather(location.id)

    if (isPending)
        return <WeatherCardMessage busy>Loading weather…</WeatherCardMessage>
    if (error)
        return (
            <WeatherCardMessage>
                Weather unavailable ({error.message})
            </WeatherCardMessage>
        )

    return <WeatherCard locationName={location.name} weather={weather} />
}
