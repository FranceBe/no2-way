// Global setup for the "unit" vitest project
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest globals are off, so Testing Library can't unmount automatically
afterEach(() => cleanup());
