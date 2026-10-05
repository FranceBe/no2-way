import { setThemePreference, useThemePreference, type ThemePreference } from "../theme/theme";
import "./ThemeToggle.css";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

// Auto follows the OS; Light / Dark are saved and win over the OS setting
export const ThemeToggle = () => {
  const preference = useThemePreference();

  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className="theme-toggle__button"
          aria-pressed={preference === value}
          onClick={() => setThemePreference(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
