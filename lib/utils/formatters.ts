/**
 * Data formatting utilities for strict input validation
 * Ensures data integrity across the platform
 */

/**
 * Converts input to STRICT CAPITAL LETTERS in real-time
 * Used for: PROJECT NAME, UNIT NUMBER
 */
export function toStrictUppercase(value: string): string {
  return value.toUpperCase();
}

/**
 * Converts input to Title Case (First Letter Caps, Rest Lowercase)
 * Used for: CLIENT NAME
 * Example: "john smith" → "John Smith"
 */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Gets current date in YYYY-MM-DD format
 * Auto-populated and non-editable to prevent report tampering
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats date for display
 * Example: "2026-02-05" → "February 5, 2026"
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
