import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../client";
import type { LinesSnapshot } from "../types";
import { MINUTE } from "./durations";

// Latest snapshot of every line, ingested every 15 min
export const linesQuery = () =>
  queryOptions({
    queryKey: ["lines"],
    queryFn: ({ signal }) => apiFetch<LinesSnapshot>("/lines", { signal }),
    staleTime: 5 * MINUTE,
    refetchInterval: 5 * MINUTE,
  });

export const useLines = () => useQuery(linesQuery());
