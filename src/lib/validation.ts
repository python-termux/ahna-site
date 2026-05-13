/**
 * Security validation utilities to prevent injection attacks and malicious input
 */

// Valid Google Maps URL domains - STRICT whitelist
const GOOGLE_MAPS_DOMAINS = new Set([
  "maps.app.goo.gl",
  "maps.google.com",
  "www.google.com",
  "google.com",
  "goo.gl",
]);

/**
 * Validate that a string is a real Google Maps URL, not code or malicious input
 * Only allows specific Google domains and /maps paths
 */
export function validateGoogleMapsUrl(url: string): { valid: boolean; error?: string } {
  // Basic checks
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "URL cannot be empty" };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: "URL is too long (max 500 characters)" };
  }

  // Must start with https:// - no javascript:, data:, or other protocols
  if (!trimmed.startsWith("https://")) {
    return { valid: false, error: "URL must start with https://" };
  }

  try {
    const urlObj = new URL(trimmed);
    const hostname = urlObj.hostname.toLowerCase();

    // Check domain is in whitelist
    let isValid = false;
    for (const domain of GOOGLE_MAPS_DOMAINS) {
      if (hostname === domain || hostname.endsWith("." + domain)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      return { valid: false, error: "URL must be from Google Maps" };
    }

    // Must contain /maps in path or be a short URL
    const pathname = urlObj.pathname.toLowerCase();
    const isShortUrl = hostname.includes("goo.gl") || hostname.includes("maps.app.goo.gl");
    const isMapsPath = pathname.includes("/maps");

    if (!isShortUrl && !isMapsPath) {
      return { valid: false, error: "URL must be a Google Maps link" };
    }

    // Check for suspicious characters that might indicate injection
    if (/[<>'"`;{}\\]/.test(trimmed)) {
      return { valid: false, error: "URL contains invalid characters" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate email format strictly to prevent injection
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim();

  // Check length
  if (trimmed.length === 0) {
    return { valid: false, error: "Email cannot be empty" };
  }
  if (trimmed.length > 254) {
    return { valid: false, error: "Email is too long" };
  }

  // RFC 5322 simplified email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Additional checks for common injection patterns
  const injectionRegex = /[<>'";{}\\`]/;
  if (injectionRegex.test(trimmed)) {
    return { valid: false, error: "Email contains invalid characters" };
  }

  // Check for SQL injection patterns
  const sqlRegex = /['";]/;
  if (sqlRegex.test(trimmed) || trimmed.includes("--")) {
    return { valid: false, error: "Email contains invalid characters" };
  }

  return { valid: true };
}

/**
 * Validate password - check it's not code or injection
 * Password validation is minimal since Supabase handles strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password is too long" };
  }

  // Check for null bytes and control characters
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(password)) {
    return { valid: false, error: "Password contains invalid characters" };
  }

  return { valid: true };
}

/**
 * Validate URL to prevent open redirect attacks
 */
export function validateRedirectUrl(url: string, allowedDomains: string[]): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  const trimmed = url.trim();

  // Relative URLs are always safe
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return { valid: true };
  }

  try {
    const urlObj = new URL(trimmed);
    const hostname = urlObj.hostname.toLowerCase();

    // Check if domain is in whitelist
    for (const domain of allowedDomains) {
      if (hostname === domain || hostname.endsWith("." + domain)) {
        return { valid: true };
      }
    }

    return { valid: false, error: "Redirect to this domain is not allowed" };
  } catch {
    return { valid: false, error: "Invalid redirect URL" };
  }
}

/**
 * Sanitize string input - remove control characters and null bytes
 * This complements HTML escaping done by React
 */
export function sanitizeInput(input: unknown, maxLength = 500): string {
  const str = String(input ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);

  return str;
}

/**
 * Validate phone number format - only digits, spaces, hyphens, parentheses, +
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: true }; // Phone is optional
  }

  const trimmed = phone.trim();
  if (trimmed.length > 30) {
    return { valid: false, error: "Phone number is too long" };
  }

  // Allow only: digits, +, -, (), and spaces
  const validPhoneRegex = /^[\d+\-() ]+$/;
  if (!validPhoneRegex.test(trimmed)) {
    return { valid: false, error: "Phone number contains invalid characters" };
  }

  return { valid: true };
}

/**
 * Validate website URL
 */
export function validateWebsiteUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: true }; // Website is optional
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { valid: true };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: "Website URL is too long" };
  }

  // Must be https or http
  if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) {
    return { valid: false, error: "Website must start with http:// or https://" };
  }

  try {
    new URL(trimmed);
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid website URL" };
  }
}

/**
 * Validate color theme value - only allow predefined themes
 */
export function validateThemeColor(color: string): { valid: boolean; error?: string } {
  const validThemes = [
    "white-indigo",
    "white-violet",
    "white-rose",
    "white-orange",
    "white-emerald",
    "white-sky",
    "white-amber",
    "indigo",
    "violet",
    "rose",
    "orange",
    "emerald",
    "sky",
    "amber",
  ];

  if (!color || typeof color !== "string") {
    return { valid: false, error: "Theme color is required" };
  }

  if (!validThemes.includes(color)) {
    return { valid: false, error: "Invalid theme color" };
  }

  return { valid: true };
}
