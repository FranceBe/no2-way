import { useWeather } from "../api/queries";
import { DropletIcon, getWeatherDisplay, ThermometerIcon, WindIcon } from "./icons";
import "./WeatherWidget.css";

type WeatherWidgetProps = {
  location?: string;
}

export const WeatherWidget = ({ location = "camden" }: WeatherWidgetProps) => {
  // GET /weather?location=camden — `weather` is the response, kept in react-query's state
  const { data: weather, isPending, error } = useWeather(location);

  if (isPending) {
    return (
      <section className="weather-card weather-card--status" aria-busy="true">
        <p>Loading weather…</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="weather-card weather-card--status">
        <p>Weather unavailable ({error.message})</p>
      </section>
    );
  }

  const { Icon, label } = getWeatherDisplay(weather.weatherCode, weather.isDay);

  return (
    <section
      className={`weather-card ${weather.isDay ? "weather-card--day" : "weather-card--night"}`}
      aria-label={`Weather in ${location}`}
    >
      <div className="weather-card__main">
        <div className="weather-card__icon">
          <Icon size={44} title={label} />
        </div>
        <div>
          <p className="weather-card__location">{location}</p>
          <p className="weather-card__temp">{Math.round(weather.temperature)}°C</p>
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
  );
};
