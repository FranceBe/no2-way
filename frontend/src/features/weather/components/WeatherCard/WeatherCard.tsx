import type { ReactNode } from 'react'
import type { Weather } from '@no2-way/shared'
import { getWeatherDisplay } from '../../utils/getWeatherDisplay'
import { DropletIcon, ThermometerIcon, WindIcon } from '../icons'
import './WeatherCard.css'

type WeatherCardProps = {
    locationName: string
    weather: Weather
}

// Presentational card: no data fetching, so it can be rendered as-is in Storybook
export const WeatherCard = ({ locationName, weather }: WeatherCardProps) => {
    const { Icon, label } = getWeatherDisplay(
        weather.weatherCode,
        weather.isDay
    )

    return (
        <section
            className={`weather-card ${weather.isDay ? 'weather-card--day' : 'weather-card--night'}`}
            aria-label={`Weather in ${locationName}`}
        >
            <div className="weather-card__main">
                <div className="weather-card__icon">
                    <Icon size={44} title={label} />
                </div>
                <div>
                    <p className="weather-card__location">{locationName}</p>
                    <p className="weather-card__temp">
                        {Math.round(weather.temperature)}°C
                    </p>
                    <p className="weather-card__label">{label}</p>
                </div>
            </div>

            <ul className="weather-card__details">
                <li title="Feels like">
                    <ThermometerIcon size={16} />
                    {Math.round(weather.feelsLike)}°C
                </li>
                <li title="Wind speed">
                    <WindIcon size={16} />
                    {Math.round(weather.windSpeed)} km/h
                </li>
                <li title="Precipitation">
                    <DropletIcon size={16} />
                    {weather.precipitation} mm
                </li>
            </ul>
        </section>
    )
}

type WeatherCardMessageProps = {
    children: ReactNode
    busy?: boolean
}

// Same card shell, used for the loading and error states
export const WeatherCardMessage = ({
    children,
    busy = false,
}: WeatherCardMessageProps) => (
    <section
        className="weather-card weather-card--status"
        aria-busy={busy || undefined}
    >
        <p>{children}</p>
    </section>
)
