import type { ChangeEventHandler } from 'react';

import type { ShopItem, ShopItemRequest } from '../../api/Shop/ShopRouter';
import { formatPriceInput, parsePriceToCents } from './format';
import { suggestionsForCategory } from './measurements';

export type MeasurementDraft = {
  label: string;
  value: string;
};

export type ShopItemDraft = {
  title: string;
  description: string;
  brand: string;
  category: string;
  size: string;
  price: string;
  stock: string;
  measurements: MeasurementDraft[];
  isPublished: boolean;
};

export type DraftField =
  | 'title'
  | 'description'
  | 'brand'
  | 'category'
  | 'size'
  | 'price'
  | 'stock';

export type ShopItemFieldChangeHandler = ChangeEventHandler<
  HTMLInputElement | HTMLTextAreaElement
>;

export type UpdateShopItemDraft = (
  field: DraftField
) => ShopItemFieldChangeHandler;

export type ShopItemFieldErrors = {
  title: string | null;
  price: string | null;
  stock: string | null;
};

export const createEmptyDraft = (): ShopItemDraft => ({
  title: '',
  description: '',
  brand: '',
  category: '',
  size: '',
  price: '',
  stock: '1',
  measurements: [],
  isPublished: false,
});

export const createDraftFromItem = (item: ShopItem): ShopItemDraft => ({
  title: item.title,
  description: item.description,
  brand: item.brand || '',
  category: item.category || '',
  size: item.size || '',
  price: formatPriceInput(item.priceCents),
  stock: String(item.stock),
  measurements: (item.measurements ?? []).map((measurement) => ({
    label: measurement.label,
    value: String(measurement.valueInches),
  })),
  isPublished: item.isPublished,
});

export const validateStock = (value: string) =>
  /^\d+$/.test(value.trim()) ? null : 'Enter a whole number';

export const MEASUREMENT_ERROR = 'Enter inches between 0 and 100';

// Measurements are entered in inches. Blank input is not a value; invalid or
// out-of-range input returns null.
export const parseMeasurementValue = (value: string): number | null => {
  const trimmed = value.trim();

  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);

  return parsed > 0 && parsed <= 100 ? parsed : null;
};

// measurementRowError returns a message for a row that has been started but is
// incomplete. A row with neither a label nor a value is an empty placeholder,
// not an error, so a stray blank row never blocks saving.
export const measurementRowError = (
  row: MeasurementDraft
): string | null => {
  const label = row.label.trim();
  const value = row.value.trim();

  if (!label && !value) {
    return null;
  }
  if (!label) {
    return 'Add a label';
  }
  if (!value) {
    return 'Add a value';
  }
  if (parseMeasurementValue(value) === null) {
    return MEASUREMENT_ERROR;
  }

  return null;
};

// Serializing the draft lets saveItem tell a loaded listing from an edited one,
// so opening a listing and saving it untouched sends no request. Text fields are
// trimmed because the request trims them, so whitespace-only edits are no-ops.
export const serializeDraft = (draft: ShopItemDraft) =>
  JSON.stringify({
    ...draft,
    title: draft.title.trim(),
    description: draft.description.trim(),
    brand: draft.brand.trim(),
    category: draft.category.trim(),
    size: draft.size.trim(),
    price: draft.price.trim(),
    stock: draft.stock.trim(),
    measurements: draft.measurements.map((measurement) => ({
      label: measurement.label.trim(),
      value: measurement.value.trim(),
    })),
  });

export const getDraftValidation = (draft: ShopItemDraft) => {
  const priceCents = parsePriceToCents(draft.price);

  const fieldErrors: ShopItemFieldErrors = {
    title: draft.title.trim() ? null : 'Title is required',
    price:
      priceCents === null || priceCents < 1 ? 'Enter a price like 18.00' : null,
    stock: validateStock(draft.stock),
  };

  return {
    priceCents,
    fieldErrors,
    measurementErrors: draft.measurements.map(measurementRowError),
  };
};

// Only suggest labels the listing does not already carry, so a chip never
// creates a duplicate row.
export const getMeasurementSuggestions = (draft: ShopItemDraft) =>
  suggestionsForCategory(draft.category).filter(
    (suggestion) =>
      !draft.measurements.some(
        (measurement) =>
          measurement.label.trim().toLowerCase() === suggestion.toLowerCase()
      )
  );

export const createRequestFromDraft = (
  draft: ShopItemDraft,
  priceCents: number
): ShopItemRequest => ({
  title: draft.title.trim(),
  description: draft.description.trim(),
  brandId: '',
  brand: draft.brand.trim(),
  category: draft.category.trim(),
  size: draft.size.trim(),
  priceCents,
  currency: 'usd',
  stock: Number(draft.stock),
  measurements: draft.measurements
    .map((row) => ({
      label: row.label.trim(),
      valueInches: parseMeasurementValue(row.value),
    }))
    .filter(
      (measurement): measurement is { label: string; valueInches: number } =>
        measurement.label !== '' && measurement.valueInches !== null
    ),
  isPublished: draft.isPublished,
});
