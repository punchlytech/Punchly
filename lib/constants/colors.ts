/**
 * Punchly Brand Colors — for use in JavaScript contexts (Canvas, PDF, inline styles)
 * These match the CSS custom properties registered in globals.css
 */
export const colors = {
  primaryNavy: "#0B3C5D",
  primaryBlue: "#1F6FA3",
  success: "#2E7D32",
  warning: "#F9A825",
  issue: "#EF6C00",
  critical: "#C62828",
  backgroundLight: "#F7F9FB",
  surface: "#FFFFFF",
  border: "#E1E6EB",
  primaryText: "#1A1A1A",
  secondaryText: "#5A6977",
} as const;

export type BrandColor = keyof typeof colors;
