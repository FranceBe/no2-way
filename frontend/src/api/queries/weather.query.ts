import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type { Weather } from "../types";
import { MINUTE } from "./durations";

// Live data, cached 10 min by the API
export const weatherQuery = (location: string) =>
  queryOptions({
    queryKey: ["weather", location],
    queryFn: ({ signal }) => apiFetch<Weather>("/weather", { params: { location }, signal }),
    staleTime: 10 * MINUTE,
    refetchInterval: 10 * MINUTE,
  });

export const useWeather = (location: string) => useQuery(weatherQuery(location));
