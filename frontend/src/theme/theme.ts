import { useSyncExternalStore } from "react";

// "system" follows the OS; "light" / "dark" are forced with data-theme on <html>
export type ThemePreference = "system" | "light" | "dark";
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const darkQuery = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(DARK_QUERY)
    : null;

// Storage can throw (private mode, blocked site data): fall back to "system"
export function getThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

// Sets data-theme on <html> and re-renders components that depend on the theme
export function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === "system") delete root.dataset.theme;
  else root.dataset.theme = preference;
  notify();
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Not persisted, still applied for this page
  }
  applyThemePreference(preference);
}

export function getResolvedTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return darkQuery()?.matches ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const query = darkQuery();
  query?.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    query?.removeEventListener("change", listener);
  };
}

// Light/dark actually displayed, re-rendered on toggle or OS change
export const useResolvedTheme = (): Theme =>
  useSyncExternalStore(subscribe, getResolvedTheme, () => "light");

export const useThemePreference = (): ThemePreference =>
  useSyncExternalStore(subscribe, getThemePreference, () => "system");

// Reads CSS custom properties for code that can't use var() (e.g. SVG attributes
// set by Recharts). Values follow the displayed theme
export function readTokens<K extends string>(names: readonly K[]): Record<K, string> {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    names.map((name) => [name, style.getPropertyValue(`--${name}`).trim()]),
  ) as Record<K, string>;
}
