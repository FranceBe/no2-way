# NO₂ Way API

REST API serving London air quality, road status, TfL lines, live arrivals, timetables, bike availability and current weather.

- **Base URL:** `https://x9p6qds5u7.execute-api.eu-west-2.amazonaws.com` (front-end: `import.meta.env.VITE_API_URL`)
- **Method:** all endpoints are `GET`
- **Format:** JSON (`content-type: application/json`)
- **Times:** all timestamps are **UTC**, formatted `YYYY-MM-DDTHH:mm` (e.g. `2026-10-02T14:15`), except `expected` in `/arrivals` (full ISO 8601)
- **Types:** every response shape is defined in `shared/src/index.ts` (`@no2-way/shared`), used by the backend routes, the front-end and its MSW mocks

## Overview

| Endpoint | Description | Source | Freshness |
|---|---|---|---|
| `GET /locations` | Neighbourhoods available | Config | Static |
| `GET /weather` | Current weather | Open-Meteo, live | Cached 10 min |
| `GET /air` | Air quality history | Database | Updated every hour |
| `GET /roads` | Road status history | Database | Updated every 15 min |
| `GET /lines` | Latest status of every line | Database | Updated every 15 min |
| `GET /lines/history` | Status history of one line | Database | Updated every 15 min |
| `GET /lines/stops` | Stations of a line | TfL, live | Cached 24 h |
| `GET /arrivals` | Next trains at a station | TfL, live | Cached 20 s |
| `GET /timetable` | First and last trains at a station | TfL, live | Cached 24 h |
| `GET /bikes` | Santander Cycles docks nearby | TfL, live | Cached 60 s |

## Errors

Every error returns a JSON body with a single `error` field:

```json
{ "error": "Unknown or missing location" }
```

| Status | Meaning | What the front-end should do |
|---|---|---|
| `400` | Invalid or missing parameter | Fix the request; show a validation message |
| `404` | Unknown path | Fix the URL |
| `429` | Rate limit exceeded | Retry after a short delay |
| `502` | TfL or Open-Meteo is unavailable | Show "data temporarily unavailable", retry later |
| `500` | Internal error | Show a generic error |

## Limits

- **Rate limit:** 10 requests per second, bursts up to 20. Beyond that: `429`.
- **CORS:** browsers may only call the API from the deployed site and `http://localhost:5173`.
- **History window (`hours`):** default depends on the endpoint, maximum 720 (30 days). Invalid values fall back to the default.
- **No pagination:** `/air`, `/roads` and `/lines/history` always return the whole window in one response, oldest first. The API reads every DynamoDB page itself; the front-end never receives a cursor.

---

## GET /locations

The neighbourhoods available. Use their `id` as the `location` parameter of other endpoints.

**Parameters:** none

**Response:** `Location[]`

```json
[
  { "id": "camden", "name": "Camden", "lat": 51.539, "lon": -0.142, "corridor": "a1" },
  { "id": "canary-wharf", "name": "Canary Wharf", "lat": 51.505, "lon": -0.024, "corridor": "a13" }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Identifier used in URLs |
| `name` | string | Display name |
| `lat`, `lon` | number | Coordinates of the neighbourhood |
| `corridor` | string | TfL road corridor associated with the neighbourhood |

---

## GET /weather

Current weather for a neighbourhood.

**Parameters**

| Name | Required | Description |
|---|---|---|
| `location` | No | Location `id`. Defaults to the first location (Westminster) |

**Example:** `GET /weather?location=camden`

**Response:** `Weather`

```json
{
  "time": "2026-10-02T14:15",
  "temperature": 14.2,
  "feelsLike": 12.8,
  "weatherCode": 3,
  "isDay": true,
  "precipitation": 0,
  "windSpeed": 18.4
}
```

| Field | Type | Description |
|---|---|---|
| `time` | string | Time of the observation (UTC) |
| `temperature` | number | Temperature, °C |
| `feelsLike` | number | Apparent temperature, °C |
| `weatherCode` | number | WMO weather code (see below) |
| `isDay` | boolean | `true` during daytime |
| `precipitation` | number | Precipitation, mm |
| `windSpeed` | number | Wind speed at 10 m, km/h |

**WMO weather codes**

| Code | Meaning |
|---|---|
| 0 | Clear sky |
| 1–3 | Mainly clear, partly cloudy, overcast |
| 45, 48 | Fog |
| 51–57 | Drizzle |
| 61–67 | Rain |
| 71–77 | Snow |
| 80–82 | Rain showers |
| 85, 86 | Snow showers |
| 95–99 | Thunderstorm |

---

## GET /air

Hourly air quality for a neighbourhood.

**Parameters**

| Name | Required | Description |
|---|---|---|
| `location` | Yes | Location `id` |
| `hours` | No | History window in hours. Default `48`, max `720` |

**Example:** `GET /air?location=camden&hours=24`

**Response:** `AirReading[]`, sorted by time, oldest first

```json
[
  {
    "ts": "2026-10-02T14:00",
    "grid": "51.50,-0.10",
    "pm2_5": 9.4,
    "pm10": 15.2,
    "nitrogen_dioxide": 31,
    "ozone": 40,
    "european_aqi": 28
  }
]
```

| Field | Type | Description |
|---|---|---|
| `ts` | string | Hour of the reading (UTC) |
| `grid` | string | Model grid cell (~10 km). Locations with the same `grid` share identical values |
| `pm2_5`, `pm10` | number \| null | Particulate matter, µg/m³ |
| `nitrogen_dioxide` | number \| null | NO₂, µg/m³ |
| `ozone` | number \| null | O₃, µg/m³ |
| `european_aqi` | number \| null | European Air Quality Index |

> Values come from the Open-Meteo forecast model, not from street-level sensors.

---

## GET /roads

Status history of the road corridor associated with a neighbourhood.

**Parameters**

| Name | Required | Description |
|---|---|---|
| `location` | Yes | Location `id` |
| `hours` | No | History window in hours. Default `48`, max `720` |

**Example:** `GET /roads?location=camden&hours=24`

**Response:** `RoadsResponse`

```json
{
  "corridor": "a1",
  "readings": [
    {
      "ts": "2026-10-02T14:15",
      "name": "A1",
      "severity": "Good",
      "description": "No Exceptional Delays",
      "score": 0
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `corridor` | string | TfL corridor id |
| `readings[].ts` | string | Snapshot time (UTC, every 15 min) |
| `readings[].name` | string | Corridor display name |
| `readings[].severity` | string | TfL severity, e.g. `Good`, `Serious`, `Severe` |
| `readings[].description` | string | Human-readable status |
| `readings[].score` | number \| null | `0` (good) to `5` (closed). `null` for unknown severities |

---

## GET /lines

Latest status of every Tube, Overground, DLR and Elizabeth line.

**Parameters:** none

**Response:** `LinesSnapshot`

```json
{
  "ts": "2026-10-02T14:15",
  "lines": [
    {
      "id": "district",
      "name": "District",
      "mode": "tube",
      "statuses": [
        { "severity": 5, "description": "Part Closure", "reason": "District Line: No service between…" },
        { "severity": 9, "description": "Minor Delays", "reason": "District Line: Minor delays…" }
      ]
    },
    {
      "id": "victoria",
      "name": "Victoria",
      "mode": "tube",
      "statuses": [{ "severity": 10, "description": "Good Service", "reason": null }]
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `ts` | string \| null | Snapshot time (UTC). `null` before the first ingestion |
| `lines[].id` | string | TfL line id (use with `/lines/history`, `/lines/stops`, `/arrivals`) |
| `lines[].name` | string | Display name |
| `lines[].mode` | string | `tube`, `overground`, `dlr` or `elizabeth-line` |
| `lines[].statuses` | LineStatus[] | **All** current statuses. A line can have several at once |
| `statuses[].severity` | number | TfL severity code (see below) |
| `statuses[].description` | string | e.g. `Good Service`, `Minor Delays` |
| `statuses[].reason` | string \| null | Explanation, only when disrupted |

**TfL line severity codes (main values)**

| Code | Meaning |
|---|---|
| 20 | Service Closed (e.g. at night) |
| 10 | Good Service |
| 9 | Minor Delays |
| 6 | Severe Delays |
| 5 | Part Closure |
| 4 | Planned Closure |
| 1 | Part Suspended |
| 0 | Suspended |

> Lower is worse, except `20`. Treat `20` separately when computing the "worst" status.

---

## GET /lines/history

Status history of one line, one snapshot every 15 minutes.

**Parameters**

| Name | Required | Description |
|---|---|---|
| `line` | Yes | Line `id` (lowercase letters, digits, hyphens) |
| `hours` | No | History window in hours. Default `168` (7 days), max `720` |

**Example:** `GET /lines/history?line=northern&hours=24`

**Response:** `LineHistoryEntry[]`, sorted by time, oldest first

```json
[
  {
    "ts": "2026-10-02T14:15",
    "name": "Northern",
    "mode": "tube",
    "statuses": [{ "severity": 9, "description": "Minor Delays", "reason": "Northern Line: …" }]
  }
]
```

Fields: same as a line in `/lines`, with `ts` instead of `id`.

---

## GET /lines/stops

Stations served by a line, sorted alphabetically.

**Parameters**

| Name | Required | Description |
|---|---|---|
| `line` | Yes | Line `id` |

**Example:** `GET /lines/stops?line=northern`

**Response:** `Stop[]`

```json
[
  { "id": "940GZZLUAGL", "name": "Angel Underground Station", "lat": 51.5322, "lon": -0.1058 },
  { "id": "940GZZLUKSX", "name": "King's Cross St. Pancras Underground Station", "lat": 51.5304, "lon": -0.1239 }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Station id (NaPTAN), used by `/arrivals` and `/timetable` |
| `name` | string | Full TfL name (you may strip " Underground Station") |
| `lat`, `lon` | number | Station position, usable with `/bikes?lat=…&lon=…` |

---

## GET /arrivals

Next trains at a station, sorted by waiting time.

**Parameters**

| Name | Required | Description |
|---|---|---|
| `stop` | Yes | Station `id` from `/lines/stops` |
| `line` | No | Only this line |
| `direction` | No | `inbound` or `outbound` |

**Example:** `GET /arrivals?stop=940GZZLUKSX&line=northern&direction=outbound`

**Response:** `Arrival[]`

```json
[
  {
    "line": "northern",
    "lineName": "Northern",
    "platform": "Southbound - Platform 7",
    "direction": "outbound",
    "destination": "Morden Underground Station",
    "towards": "Morden via Bank",
    "minutes": 3,
    "expected": "2026-10-02T14:18:30Z"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `line`, `lineName` | string | Line id and name |
| `platform` | string | e.g. `Southbound - Platform 7` |
| `direction` | string \| null | `inbound` or `outbound` |
| `destination` | string \| null | Final station |
| `towards` | string \| null | Short destination label, as on station boards |
| `minutes` | number | Minutes until arrival (rounded down) |
| `expected` | string | Expected arrival time (ISO 8601, UTC) |

> `inbound` / `outbound` do not always match north/south intuitively. `platform` is usually clearer for users: consider grouping arrivals by platform.

---

## GET /timetable

First and last trains at a station, per type of day.

**Parameters**

| Name | Required | Description |
|---|---|---|
| `line` | Yes | Line `id` |
| `stop` | Yes | Station `id` |
| `direction` | No | `inbound` or `outbound`. Default `outbound` |

**Example:** `GET /timetable?line=northern&stop=940GZZLUKSX&direction=outbound`

**Response:** `Timetable`

```json
{
  "line": "northern",
  "stop": "940GZZLUKSX",
  "direction": "outbound",
  "schedules": [
    { "name": "Monday - Thursday", "first": "05:42", "last": "00:31" },
    { "name": "Saturday (also Good Friday)", "first": "05:54", "last": "00:29" }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `schedules[].name` | string | Type of day, as named by TfL |
| `schedules[].first` | string \| null | First train, `HH:mm` (local London time) |
| `schedules[].last` | string \| null | Last train, `HH:mm`. Can be after midnight (e.g. `00:31`) |

---

## GET /bikes

Santander Cycles docking stations near a neighbourhood or a point (e.g. a station), closest first (max 20).

**Parameters:** either `location`, or `lat` and `lon`

| Name | Required | Description |
|---|---|---|
| `location` | Without `lat`/`lon` | Location `id` |
| `lat`, `lon` | Without `location` | A point in Greater London (lat 51.2–51.8, lon −0.6–0.4), e.g. a stop from `/lines/stops`. Anything else: `400` |
| `radius` | No | Search radius in metres. Default `500`, max `2000` |

**Examples:** `GET /bikes?location=camden&radius=500`, `GET /bikes?lat=51.5392&lon=-0.1426`

**Response:** `BikePoint[]`

```json
[
  {
    "id": "BikePoints_123",
    "name": "Camden Road, Camden",
    "lat": 51.541,
    "lon": -0.139,
    "bikes": 7,
    "emptyDocks": 12,
    "docks": 20,
    "distance": 180
  }
]
```

| Field | Type | Description |
|---|---|---|
| `bikes` | number | Bikes available |
| `emptyDocks` | number | Free docks to return a bike |
| `docks` | number | Total docks |
| `distance` | number | Distance from the neighbourhood centre (or the given point), metres |

---

## Example: commute check

```ts
const API = import.meta.env.VITE_API_URL;

// 1. Pick a line, list its stations
const stops = await fetch(`${API}/lines/stops?line=northern`).then((r) => r.json());

// 2. Next trains at the chosen station, in the chosen direction
const arrivals = await fetch(
  `${API}/arrivals?stop=940GZZLUKSX&line=northern&direction=outbound`
).then((r) => r.json());

// 3. Line status before leaving
const { lines } = await fetch(`${API}/lines`).then((r) => r.json());
const northern = lines.find((l: { id: string }) => l.id === "northern");
```