import { http, HttpResponse, delay } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "../test/server";
import { cached, fetchJson, tflUrl, UpstreamError } from "./http";

const URL_ = "https://api.example.test/data";

describe("fetchJson", () => {
  it("returns the parsed body", async () => {
    server.use(http.get(URL_, () => HttpResponse.json({ value: 42 })));
    await expect(fetchJson(URL_)).resolves.toEqual({ value: 42 });
  });

  it("turns an HTTP error into an UpstreamError naming the host", async () => {
    server.use(http.get(URL_, () => new HttpResponse(null, { status: 503 })));
    const error = await fetchJson<never>(URL_).catch((err: Error) => err);

    expect(error).toBeInstanceOf(UpstreamError);
    expect(error.message).toBe("HTTP 503 from api.example.test");
  });

  it("turns a network error into an UpstreamError", async () => {
    server.use(http.get(URL_, () => HttpResponse.error()));
    await expect(fetchJson(URL_)).rejects.toThrow(UpstreamError);
  });

  it("gives up after the timeout", async () => {
    server.use(
      http.get(URL_, async () => {
        await delay(200);
        return HttpResponse.json({});
      })
    );
    await expect(fetchJson(URL_, 20)).rejects.toThrow(/^Request failed: /);
  });
});

describe("tflUrl", () => {
  it("builds the URL with its parameters", () => {
    expect(tflUrl("/Line/northern/Timetable/940GZZLUKSX", { direction: "inbound" }).href).toBe(
      "https://api.tfl.gov.uk/Line/northern/Timetable/940GZZLUKSX?direction=inbound"
    );
  });

  it("adds the API key when configured", () => {
    vi.stubEnv("TFL_APP_KEY", "secret");
    expect(tflUrl("/BikePoint").searchParams.get("app_key")).toBe("secret");
  });

  it("leaves the key out otherwise", () => {
    expect(tflUrl("/BikePoint").searchParams.has("app_key")).toBe(false);
  });
});

describe("cached", () => {
  it("loads once while the value is fresh, then again once it expires", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T12:00:00Z") });
    const load = vi.fn().mockResolvedValueOnce("first").mockResolvedValueOnce("second");

    await expect(cached("key", 60_000, load)).resolves.toBe("first");
    vi.advanceTimersByTime(59_999);
    await expect(cached("key", 60_000, load)).resolves.toBe("first");
    expect(load).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    await expect(cached("key", 60_000, load)).resolves.toBe("second");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("keeps one value per key", async () => {
    await cached("a", 60_000, async () => "A");
    await expect(cached("b", 60_000, async () => "B")).resolves.toBe("B");
  });

  it("does not cache a failure", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce("ok");

    await expect(cached("key", 60_000, load)).rejects.toThrow("down");
    await expect(cached("key", 60_000, load)).resolves.toBe("ok");
  });
});
