import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { ApiPath, ApiResponses } from "@no2-way/shared";
import { LOCATIONS } from "./shared/locations";
import { UpstreamError } from "./shared/http";
import { type Query, HttpError, json } from "./shared/response";
import { getAir, getRoads, getLines, getLineHistory } from "./routes/history";
import { getWeather, getLineStops, getArrivals, getBikes, getTimetable } from "./routes/live";

// Path -> handler. To add an endpoint: declare its response in @no2-way/shared,
// write its function, add one line here. The type checks that every path of the
// contract has a handler, and that each handler returns the declared shape
type Routes = { [P in ApiPath]: (q: Query) => ApiResponses[P] | Promise<ApiResponses[P]> };

const routes: Routes = {
  "/locations": () => LOCATIONS,
  "/weather": getWeather,
  "/air": getAir,
  "/roads": getRoads,
  "/lines": getLines,
  "/lines/history": getLineHistory,
  "/lines/stops": getLineStops,
  "/arrivals": getArrivals,
  "/timetable": getTimetable,
  "/bikes": getBikes,
};

const isApiPath = (path: string): path is ApiPath => Object.hasOwn(routes, path);

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (!isApiPath(event.rawPath)) return json(404, { error: "Not found" });
  const route: (q: Query) => unknown = routes[event.rawPath];

  try {
    return json(200, await route(event.queryStringParameters ?? {}));
  } catch (err) {
    // Expected errors: status and message are meant for the client
    if (err instanceof HttpError) return json(err.status, { error: err.message });

    // External API down: details in the logs only
    if (err instanceof UpstreamError) {
      console.error(err);
      return json(502, { error: "Upstream service unavailable" });
    }

    // Anything else is a bug: never leak internal details
    console.error(err);
    return json(500, { error: "Internal error" });
  }
};