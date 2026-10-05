// Error from an external API (TfL, Open-Meteo): mapped to HTTP 502
export class UpstreamError extends Error {
  name = "UpstreamError";
}

// fetch + timeout + JSON parsing, with explicit errors
export async function fetchJson<T>(url: string | URL, timeoutMs = 5000): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    throw new UpstreamError(`Request failed: ${(err as Error).message}`);
  }
  if (!res.ok) throw new UpstreamError(`HTTP ${res.status} from ${new URL(url).hostname}`);
  return (await res.json()) as T;
}

// Builds a TfL URL; adds the API key when configured
export const tflUrl = (path: string, params: Record<string, string> = {}): URL => {
  const url = new URL(`https://api.tfl.gov.uk${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (process.env.TFL_APP_KEY) url.searchParams.set("app_key", process.env.TFL_APP_KEY);
  return url;
};

// In-memory cache: lives as long as the Lambda container stays warm
const cache = new Map<string, { expires: number; value: unknown }>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await load();
  cache.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}

// Tests only: forget every cached value
export const clearCache = (): void => cache.clear();
