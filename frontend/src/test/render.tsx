import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

// No retries, so error states show up immediately; no garbage collection
// timers left running once a test is over
export const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

type ProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  client?: QueryClient; // pass one to seed or inspect the cache
};

// render() wrapped in every provider the app needs. A fresh QueryClient per
// call keeps tests independent; it is returned for cache assertions
export function renderWithProviders(
  ui: ReactElement,
  { client = createTestQueryClient(), ...options }: ProvidersOptions = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper: Wrapper, ...options }) };
}
