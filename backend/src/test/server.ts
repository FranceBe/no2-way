import { setupServer } from "msw/node";

// No default handler: each test declares the external calls it expects
export const server = setupServer();
