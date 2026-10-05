import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { clearCache } from "../shared/http";
import { server } from "./server";

// Any outgoing request without a handler fails the test: nothing reaches TfL or Open-Meteo
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
  server.resetHandlers();
  clearCache();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

afterAll(() => server.close());
