import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Weather } from "../api/types";
import { WeatherCard, WeatherCardMessage } from "./WeatherCard";

const weather: Weather = {
  time: "2026-10-05T14:00",
  temperature: 17.6,
  feelsLike: 16.2,
  weatherCode: 0,
  isDay: true,
  precipitation: 0.4,
  windSpeed: 12.5,
};

const renderCard = (overrides: Partial<Weather> = {}) =>
  render(<WeatherCard location="camden" weather={{ ...weather, ...overrides }} />);

describe("WeatherCard", () => {
  it("is exposed as a region named after the location", () => {
    renderCard();
    expect(screen.getByRole("region", { name: "Weather in camden" })).toBeInTheDocument();
  });

  it("shows the location, the rounded temperature and the condition label", () => {
    renderCard();
    const card = screen.getByRole("region");
    expect(within(card).getByText("camden")).toBeInTheDocument();
    expect(within(card).getByText("18°C")).toBeInTheDocument();
    expect(within(card).getByText("Clear sky", { selector: "p" })).toBeInTheDocument();
  });

  it("gives the weather icon an accessible name", () => {
    renderCard({ weatherCode: 95 });
    expect(screen.getByRole("img", { name: "Thunderstorm" })).toBeInTheDocument();
  });

  it("shows feels like, wind speed and precipitation", () => {
    renderCard();
    expect(screen.getByTitle("Feels like")).toHaveTextContent("16°C");
    expect(screen.getByTitle("Wind speed")).toHaveTextContent("13 km/h");
    expect(screen.getByTitle("Precipitation")).toHaveTextContent("0.4 mm");
  });

  it("rounds negative temperatures", () => {
    renderCard({ temperature: -1.6, feelsLike: -5.4 });
    expect(screen.getByText("-2°C")).toBeInTheDocument();
    expect(screen.getByTitle("Feels like")).toHaveTextContent("-5°C");
  });

  it.each([
    [true, "weather-card--day"],
    [false, "weather-card--night"],
  ])("uses the right theme when isDay=%s", (isDay, className) => {
    renderCard({ isDay });
    expect(screen.getByRole("region")).toHaveClass("weather-card", className);
  });
});

describe("WeatherCardMessage", () => {
  it("renders its message", () => {
    render(<WeatherCardMessage>Weather unavailable</WeatherCardMessage>);
    expect(screen.getByText("Weather unavailable")).toBeInTheDocument();
  });

  it("is marked as busy only while loading", () => {
    const { container, rerender } = render(<WeatherCardMessage busy>Loading…</WeatherCardMessage>);
    expect(container.firstChild).toHaveAttribute("aria-busy", "true");

    rerender(<WeatherCardMessage>Done</WeatherCardMessage>);
    expect(container.firstChild).not.toHaveAttribute("aria-busy");
  });
});
