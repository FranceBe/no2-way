import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Weather } from "../api/types";
import { WeatherWidget } from "./WeatherWidget";

const weather: Weather = {
  time: "2026-10-05T14:00",
  temperature: 9.2,
  feelsLike: 7.4,
  weatherCode: 63,
  isDay: true,
  precipitation: 2.1,
  windSpeed: 21,
};

// Default handler: the API answers with `weather` for any location
const server = setupServer(
  http.get("*/weather", () => HttpResponse.json(weather)),
);

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Fresh client per test, no retries so error states show up immediately
const renderWidget = (location?: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WeatherWidget location={location} />
    </QueryClientProvider>,
  );
};

describe("WeatherWidget", () => {
  it("shows a loading state, then the weather", async () => {
    renderWidget();

    expect(screen.getByText("Loading weather…")).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "Weather in camden" })).toBeInTheDocument();
    expect(screen.getByText("Rain", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("9°C")).toBeInTheDocument();
    expect(screen.queryByText("Loading weather…")).not.toBeInTheDocument();
  });

  it("requests the weather of the given location", async () => {
    let requestedLocation: string | null = null;
    server.use(
      http.get("*/weather", ({ request }) => {
        requestedLocation = new URL(request.url).searchParams.get("location");
        return HttpResponse.json(weather);
      }),
    );

    renderWidget("brixton");

    expect(await screen.findByRole("region", { name: "Weather in brixton" })).toBeInTheDocument();
    expect(requestedLocation).toBe("brixton");
  });

  it("shows the API error message", async () => {
    server.use(
      http.get("*/weather", () =>
        HttpResponse.json({ error: "Unknown or missing location" }, { status: 400 }),
      ),
    );

    renderWidget("atlantis");

    expect(
      await screen.findByText("Weather unavailable (Unknown or missing location)"),
    ).toBeInTheDocument();
  });

  it("shows a network error when the API can't be reached", async () => {
    server.use(http.get("*/weather", () => HttpResponse.error()));

    renderWidget();

    expect(await screen.findByText("Weather unavailable (Network error)")).toBeInTheDocument();
  });
});
