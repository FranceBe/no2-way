import { setupServer } from "msw/node";

// Shared MSW server for unit tests, started in setup.ts.
// No default handlers: each test suite declares the responses it needs with
// server.use(...), and they are reset after every test
export const server = setupServer();
