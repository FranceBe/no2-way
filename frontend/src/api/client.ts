import type { ApiError as ApiErrorBody } from "./types";

const API_URL = import.meta.env.VITE_API_URL;

// Error thrown by every API call. status 0 = network failure (no HTTP response)
export class ApiError extends Error {
  name = "ApiError";
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Params = Record<string, string | number | undefined>;

// GET on the API, typed JSON result. Undefined params are left out of the URL
export async function apiFetch<T>(
  path: string,
  { params = {}, signal }: { params?: Params; signal?: AbortSignal } = {}
): Promise<T> {
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    // Let react-query see its own cancellations untouched
    if (signal?.aborted) throw err;
    throw new ApiError(0, "Network error");
  }

  if (!res.ok) {
    // The API answers { error: "..." } on 4xx/5xx; fall back to the status text
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }
  return (await res.json()) as T;
}
