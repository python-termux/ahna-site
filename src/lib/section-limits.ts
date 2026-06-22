// Per-section edit rate limiting for the business editor.
// Each editable section has its own hourly limit so hitting the limit on one
// section never blocks the others. Limits are adjustable here by an admin.

export type SectionId =
  | "branding" | "theme" | "images" | "services"
  | "contact" | "stats" | "hours" | "social";

export const SECTION_IDS: SectionId[] = [
  "branding", "theme", "images", "services", "contact", "stats", "hours", "social",
];

// ── Admin-adjustable thresholds ───────────────────────────────────────────────
export const SECTION_EDIT_LIMIT = 8;       // default edits per section per window
export const SECTION_EDIT_WINDOW = 3600;   // window length in seconds (1 hour)

// Per-section overrides (optional). Anything not listed uses SECTION_EDIT_LIMIT.
export const SECTION_LIMIT_OVERRIDES: Partial<Record<SectionId, number>> = {
  // e.g. branding: 6,
};

export function sectionLimit(id: SectionId): number {
  return SECTION_LIMIT_OVERRIDES[id] ?? SECTION_EDIT_LIMIT;
}

// Which business columns belong to each section (used to diff what changed).
export const SECTION_FIELDS: Record<SectionId, string[]> = {
  branding: ["name", "tagline", "description"],
  theme:    ["theme_color", "corner_radius"],
  images:   ["hero_image", "gallery", "about_image"],
  services: ["services"],
  contact:  ["phone", "email", "address", "website"],
  stats:    ["stat_years", "stat_clients", "stat_projects"],
  hours:    ["hours"],
  social:   ["social"],
};

// Friendly, non-technical section names for user messages.
export const SECTION_LABELS: Record<SectionId, { en: string; ar: string }> = {
  branding: { en: "Branding",     ar: "العلامة التجارية" },
  theme:    { en: "Theme",        ar: "المظهر" },
  images:   { en: "Images",       ar: "الصور" },
  services: { en: "Services",     ar: "الخدمات" },
  contact:  { en: "Contact Info", ar: "معلومات الاتصال" },
  stats:    { en: "Stats",        ar: "الإحصائيات" },
  hours:    { en: "Hours",        ar: "ساعات العمل" },
  social:   { en: "Social Links", ar: "روابط التواصل" },
};
