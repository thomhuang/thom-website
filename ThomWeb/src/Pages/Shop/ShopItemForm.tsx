import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CreateShopItemAsync,
  GetShopBrandsAsync,
  GetShopItemByIdAsync,
  ShopBrand,
  UpdateShopItemAsync,
} from '../../api/Shop/ShopRouter';
import { formatPriceInput, parsePriceToCents } from './format';
import { SHOP_CATEGORIES, suggestionsForCategory } from './measurements';
import styles from './Shop.module.css';

type MeasurementDraft = {
  label: string;
  value: string;
};

type ShopItemDraft = {
  title: string;
  description: string;
  brand: string;
  category: string;
  price: string;
  stock: string;
  measurements: MeasurementDraft[];
  isPublished: boolean;
};

type DraftField =
  | 'title'
  | 'description'
  | 'brand'
  | 'category'
  | 'price'
  | 'stock';

const createEmptyDraft = (): ShopItemDraft => ({
  title: '',
  description: '',
  brand: '',
  category: '',
  price: '',
  stock: '1',
  measurements: [],
  isPublished: false,
});

const validateStock = (value: string) =>
  /^\d+$/.test(value.trim()) ? null : 'Enter a whole number';

const MEASUREMENT_ERROR = 'Enter inches between 0 and 100';

// Measurements are entered in inches. Blank input is not a value; invalid or
// out-of-range input returns null.
const parseMeasurementValue = (value: string): number | null => {
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
const measurementRowError = (row: MeasurementDraft): string | null => {
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
const serializeDraft = (draft: ShopItemDraft) =>
  JSON.stringify({
    ...draft,
    title: draft.title.trim(),
    description: draft.description.trim(),
    brand: draft.brand.trim(),
    category: draft.category.trim(),
    price: draft.price.trim(),
    stock: draft.stock.trim(),
    measurements: draft.measurements.map((measurement) => ({
      label: measurement.label.trim(),
      value: measurement.value.trim(),
    })),
  });

export default function ShopItemForm() {
  const { itemId } = useParams<{ itemId?: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthLoading } = useAuth();
  const isEditing = Boolean(itemId);

  const [draft, setDraft] = useState<ShopItemDraft>(createEmptyDraft);
  const [savedDraftJson, setSavedDraftJson] = useState<string | null>(null);
  const [brandOptions, setBrandOptions] = useState<ShopBrand[]>([]);
  const [formError, setFormError] = useState('');
  const [isItemLoading, setIsItemLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemLoadFailed, setItemLoadFailed] = useState(false);

  const priceCents = parsePriceToCents(draft.price);
  const stockError = validateStock(draft.stock);
  const titleError = draft.title.trim() ? null : 'Title is required';
  const priceError =
    priceCents === null || priceCents < 1 ? 'Enter a price like 18.00' : null;
  const fieldErrors = {
    title: titleError,
    price: priceError,
    stock: stockError,
  };
  const measurementErrors = draft.measurements.map(measurementRowError);
  const hasMeasurementError = measurementErrors.some(Boolean);
  const canShowForm =
    !isAuthLoading && isAdmin && !isItemLoading && !itemLoadFailed;

  useEffect(() => {
    if (!isEditing || !itemId) {
      setDraft(createEmptyDraft());
      setSavedDraftJson(null);
      setFormError('');
      setItemLoadFailed(false);
      setIsItemLoading(false);
      return;
    }

    if (isAuthLoading) {
      return;
    }

    if (!isAdmin) {
      setIsItemLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadItem = async () => {
      setIsItemLoading(true);
      setFormError('');
      setItemLoadFailed(false);

      try {
        const item = await GetShopItemByIdAsync(itemId, controller.signal);

        if (isMounted) {
          const loadedDraft: ShopItemDraft = {
            title: item.title,
            description: item.description,
            brand: item.brand || '',
            category: item.category || '',
            price: formatPriceInput(item.priceCents),
            stock: String(item.stock),
            measurements: (item.measurements ?? []).map((measurement) => ({
              label: measurement.label,
              value: String(measurement.valueInches),
            })),
            isPublished: item.isPublished,
          };

          setDraft(loadedDraft);
          setSavedDraftJson(serializeDraft(loadedDraft));
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setItemLoadFailed(true);
          setFormError('Listing could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsItemLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAdmin, isAuthLoading, isEditing, itemId]);

  useEffect(() => {
    if (isAuthLoading || !isAdmin) {
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadBrands = async () => {
      try {
        const brands = await GetShopBrandsAsync(controller.signal);

        if (isMounted) {
          setBrandOptions(brands);
        }
      } catch {
        // Brand suggestions are optional; the listing form still works.
      }
    };

    loadBrands();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAdmin, isAuthLoading]);

  const updateDraft =
    (field: DraftField) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setDraft((currentDraft) => ({
        ...currentDraft,
        [field]: event.target.value,
      }));
    };

  const updateMeasurement =
    (index: number, field: keyof MeasurementDraft) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setDraft((currentDraft) => ({
        ...currentDraft,
        measurements: currentDraft.measurements.map((measurement, currentIndex) =>
          currentIndex === index ? { ...measurement, [field]: value } : measurement
        ),
      }));
    };

  const addMeasurement = (label = '') => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      measurements: [...currentDraft.measurements, { label, value: '' }],
    }));
  };

  const removeMeasurement = (index: number) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      measurements: currentDraft.measurements.filter(
        (_measurement, currentIndex) => currentIndex !== index
      ),
    }));
  };

  // Only suggest labels the listing does not already carry, so a chip never
  // creates a duplicate row.
  const suggestions = suggestionsForCategory(draft.category).filter(
    (suggestion) =>
      !draft.measurements.some(
        (measurement) =>
          measurement.label.trim().toLowerCase() === suggestion.toLowerCase()
      )
  );

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      Object.values(fieldErrors).some(Boolean) ||
      hasMeasurementError ||
      priceCents === null
    ) {
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const measurements = draft.measurements
      .map((row) => ({
        label: row.label.trim(),
        valueInches: parseMeasurementValue(row.value),
      }))
      .filter(
        (measurement): measurement is { label: string; valueInches: number } =>
          measurement.label !== '' && measurement.valueInches !== null
      );

    const request = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      brandId: '',
      brand: draft.brand.trim(),
      category: draft.category.trim(),
      priceCents,
      currency: 'usd',
      stock: Number(draft.stock),
      measurements,
      isPublished: draft.isPublished,
    };

    try {
      if (isEditing && itemId) {
        if (serializeDraft(draft) !== savedDraftJson) {
          await UpdateShopItemAsync(itemId, request);
        }

        navigate(`${PAGES.ShopItem}/${itemId}`);
        return;
      }

      const createdItem = await CreateShopItemAsync(request);

      // Images are managed on the listing page, which now has an id.
      navigate(`${PAGES.ShopItem}/${createdItem.id}`);
    } catch {
      setFormError(
        isEditing
          ? 'Listing could not be updated.'
          : 'Listing could not be saved.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="shop-entry-title">
        <h1 id="shop-entry-title">
          {isEditing ? 'Edit listing' : 'New listing'}
        </h1>
        <p className={styles.deck}>
          Everything a buyer sees on the listing page.
        </p>
      </section>

      {isAuthLoading && (
        <aside className={styles.notice}>Checking admin access...</aside>
      )}

      {!isAuthLoading && !isAdmin && (
        <section className={styles.publicState} aria-labelledby="shop-entry-admin">
          <h2 id="shop-entry-admin">Sign in to manage listings.</h2>
          <p>The public shop is view-only.</p>
        </section>
      )}

      {!isAuthLoading && isAdmin && isItemLoading && (
        <aside className={styles.notice}>Loading listing...</aside>
      )}

      {!isAuthLoading && isAdmin && itemLoadFailed && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}
          <div className={styles.adminActions}>
            <Link className={styles.textLink} to={PAGES.Shop}>
              Back to shop
            </Link>
          </div>
        </>
      )}

      {canShowForm && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}

          <form className={styles.form} onSubmit={saveItem}>
            <section className={styles.section} aria-labelledby="shop-details">
              <h2 id="shop-details">Listing details</h2>

              <div className={styles.fieldGrid}>
                <label className={styles.field} htmlFor="shop-title-input">
                  <span className={styles.labelRow}>
                    Title
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="shop-title-input"
                    className={fieldErrors.title ? styles.invalid : undefined}
                    type="text"
                    value={draft.title}
                    onChange={updateDraft('title')}
                    maxLength={200}
                    required
                  />
                  {fieldErrors.title && (
                    <span className={styles.fieldError}>{fieldErrors.title}</span>
                  )}
                </label>

                <label className={styles.field} htmlFor="shop-price">
                  <span className={styles.labelRow}>
                    Price (USD)
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="shop-price"
                    className={fieldErrors.price ? styles.invalid : undefined}
                    type="text"
                    inputMode="decimal"
                    placeholder="18.00"
                    value={draft.price}
                    onChange={updateDraft('price')}
                    required
                  />
                  {fieldErrors.price && (
                    <span className={styles.fieldError}>{fieldErrors.price}</span>
                  )}
                </label>

                <label className={styles.field} htmlFor="shop-stock">
                  <span className={styles.labelRow}>
                    Stock
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="shop-stock"
                    className={fieldErrors.stock ? styles.invalid : undefined}
                    type="text"
                    inputMode="numeric"
                    value={draft.stock}
                    onChange={updateDraft('stock')}
                    required
                  />
                  {fieldErrors.stock && (
                    <span className={styles.fieldError}>{fieldErrors.stock}</span>
                  )}
                </label>

                <label className={styles.field} htmlFor="shop-brand">
                  Brand
                  <input
                    id="shop-brand"
                    type="text"
                    list="shop-brand-options"
                    value={draft.brand}
                    onChange={updateDraft('brand')}
                    placeholder="e.g. Acme Coffee"
                  />
                  <datalist id="shop-brand-options">
                    {brandOptions.map((brand) => (
                      <option value={brand.brand} key={brand.id} />
                    ))}
                  </datalist>
                </label>

                <label className={styles.field} htmlFor="shop-category">
                  Category
                  <input
                    id="shop-category"
                    type="text"
                    list="shop-category-options"
                    value={draft.category}
                    onChange={updateDraft('category')}
                    placeholder="e.g. pants"
                  />
                  <datalist id="shop-category-options">
                    {SHOP_CATEGORIES.map((category) => (
                      <option value={category} key={category} />
                    ))}
                  </datalist>
                  <span className={styles.hint}>
                    Free-form; it only picks the suggested measurements.
                  </span>
                </label>
              </div>

              <label className={styles.field} htmlFor="shop-description">
                Description
                <textarea
                  id="shop-description"
                  value={draft.description}
                  onChange={updateDraft('description')}
                  maxLength={5000}
                  rows={6}
                />
              </label>

              <label className={styles.checkboxField} htmlFor="shop-published">
                <input
                  id="shop-published"
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      isPublished: event.target.checked,
                    }))
                  }
                />
                Published
                <span className={styles.hint}>
                  Drafts are only visible while signed in.
                </span>
              </label>
            </section>

            <section className={styles.section} aria-labelledby="shop-measurements">
              <h2 id="shop-measurements">Measurements</h2>
              <p className={styles.hint}>
                Optional. Values are inches; the listing page converts to cm on
                request. Add any labels you like — the category above just
                suggests common ones.
              </p>

              {suggestions.length > 0 && (
                <div className={styles.suggestionRow}>
                  <span className={styles.hint}>Quick add:</span>
                  {suggestions.map((suggestion) => (
                    <button
                      type="button"
                      className={styles.suggestionChip}
                      key={suggestion}
                      onClick={() => addMeasurement(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {draft.measurements.length === 0 ? (
                <p className={styles.hint}>No measurements on this listing.</p>
              ) : (
                <ul className={styles.measurementList}>
                  {draft.measurements.map((measurement, index) => {
                    const error = measurementErrors[index];

                    return (
                      <li className={styles.measurementRow} key={index}>
                        <input
                          className={styles.measurementLabel}
                          type="text"
                          placeholder="Label (e.g. Waist)"
                          value={measurement.label}
                          onChange={updateMeasurement(index, 'label')}
                          maxLength={60}
                          aria-label="Measurement label"
                        />
                        <input
                          className={[
                            styles.measurementValue,
                            error ? styles.invalid : '',
                          ].join(' ')}
                          type="text"
                          inputMode="decimal"
                          placeholder="Inches"
                          value={measurement.value}
                          onChange={updateMeasurement(index, 'value')}
                          aria-label="Measurement value in inches"
                        />
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => removeMeasurement(index)}
                        >
                          Remove
                        </button>
                        {error && (
                          <span className={styles.fieldError}>{error}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className={styles.adminActions}>
                <button
                  type="button"
                  className={styles.textLink}
                  onClick={() => addMeasurement()}
                >
                  Add measurement
                </button>
              </div>
            </section>

            <div className={styles.actions}>
              <Link className={styles.textLink} to={PAGES.Shop}>
                Cancel
              </Link>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving'
                  : isEditing
                    ? 'Save changes'
                    : 'Save listing'}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
