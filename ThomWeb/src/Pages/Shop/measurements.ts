// Categories and measurement labels are suggestions, not a schema. The server
// stores whatever labels a listing carries, so a category only decides which
// quick-add chips the admin form offers.
export const SHOP_CATEGORIES = ['tops', 'pants', 'outerwear', 'other'] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  tops: 'Tops',
  pants: 'Pants',
  outerwear: 'Outerwear',
  other: 'Other',
};

const MEASUREMENT_SUGGESTIONS: Record<string, string[]> = {
  tops: ['Pit to pit', 'Back length', 'Shoulder', 'Sleeve'],
  pants: ['Waist', 'Inseam', 'Rise', 'Thigh', 'Leg opening'],
  outerwear: ['Pit to pit', 'Back length', 'Shoulder', 'Sleeve'],
  other: [],
};

// suggestionsForCategory is case-insensitive so a hand-typed "Pants" still gets
// the pants chips.
export const suggestionsForCategory = (category: string): string[] =>
  MEASUREMENT_SUGGESTIONS[category.trim().toLowerCase()] ?? [];

export const categoryLabel = (category: string): string =>
  CATEGORY_LABELS[category.trim().toLowerCase()] ?? category.trim();
