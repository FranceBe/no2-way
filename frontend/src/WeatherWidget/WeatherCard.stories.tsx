import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Weather } from "../api/types";
import { WeatherCard, WeatherCardMessage } from "./WeatherCard";

const baseWeather: Weather = {
  time: "2026-10-05T14:00",
  temperature: 17.4,
  feelsLike: 16.2,
  weatherCode: 0,
  isDay: true,
  precipitation: 0,
  windSpeed: 12.6,
};

// Story args: the base weather with some fields overridden
const withWeather = (overrides: Partial<Weather>) => ({
  weather: { ...baseWeather, ...overrides },
});

const meta = {
  title: "Weather/WeatherCard",
  component: WeatherCard,
  parameters: { layout: "centered" },
  args: {
    location: "camden",
    weather: baseWeather,
  },
} satisfies Meta<typeof WeatherCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- One story per weather condition ----------

export const ClearDay: Story = { args: withWeather({ weatherCode: 0, isDay: true }) };

export const ClearNight: Story = {
  args: withWeather({ weatherCode: 0, isDay: false, temperature: 9.8, feelsLike: 7.5 }),
};

export const PartlyCloudyDay: Story = { args: withWeather({ weatherCode: 2, isDay: true }) };

export const PartlyCloudyNight: Story = {
  args: withWeather({ weatherCode: 2, isDay: false, temperature: 11.2, feelsLike: 10 }),
};

export const Overcast: Story = { args: withWeather({ weatherCode: 3, temperature: 14 }) };

export const Fog: Story = {
  args: withWeather({ weatherCode: 45, temperature: 8.3, feelsLike: 6.9, windSpeed: 3.1 }),
};

export const Drizzle: Story = {
  args: withWeather({ weatherCode: 53, temperature: 12.1, precipitation: 0.3 }),
};

export const Rain: Story = {
  args: withWeather({ weatherCode: 63, temperature: 11.5, feelsLike: 9.4, precipitation: 2.4 }),
};

export const Snow: Story = {
  args: withWeather({ weatherCode: 73, temperature: -1.2, feelsLike: -5.6, precipitation: 1.1 }),
};

export const Thunderstorm: Story = {
  args: withWeather({
    weatherCode: 95,
    temperature: 21.3,
    feelsLike: 23,
    precipitation: 6.8,
    windSpeed: 38.4,
  }),
};

// ---------- Non-success states (rendered by WeatherWidget) ----------

export const Loading: Story = {
  render: () => <WeatherCardMessage busy>Loading weather…</WeatherCardMessage>,
};

export const ErrorState: Story = {
  name: "Error",
  render: () => <WeatherCardMessage>Weather unavailable (Network error)</WeatherCardMessage>,
};

// ---------- Every condition side by side ----------

const allConditions: { name: string; weather: Partial<Weather> }[] = [
  { name: "Clear day", weather: { weatherCode: 0, isDay: true } },
  { name: "Clear night", weather: { weatherCode: 0, isDay: false } },
  { name: "Partly cloudy day", weather: { weatherCode: 2, isDay: true } },
  { name: "Partly cloudy night", weather: { weatherCode: 2, isDay: false } },
  { name: "Overcast", weather: { weatherCode: 3 } },
  { name: "Fog", weather: { weatherCode: 45 } },
  { name: "Drizzle", weather: { weatherCode: 53 } },
  { name: "Rain", weather: { weatherCode: 63 } },
  { name: "Snow", weather: { weatherCode: 73 } },
  { name: "Thunderstorm", weather: { weatherCode: 95 } },
];

export const AllConditions: Story = {
  parameters: { layout: "padded" },
  render: ({ location }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 24,
      }}
    >
      {allConditions.map(({ name, weather }) => (
        <WeatherCard key={name} location={location} weather={{ ...baseWeather, ...weather }} />
      ))}
    </div>
  ),
};
