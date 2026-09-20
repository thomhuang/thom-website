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
import ShopItemDetailsFields from './ShopItemDetailsFields';
import ShopItemMeasurements from './ShopItemMeasurements';
import {
  createDraftFromItem,
  createEmptyDraft,
  createRequestFromDraft,
  getDraftValidation,
  getMeasurementSuggestions,
  serializeDraft,
} from './shopItemDraft';
import type {
  MeasurementDraft,
  ShopItemDraft,
  UpdateShopItemDraft,
} from './shopItemDraft';
import styles from './Shop.module.css';

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

  const { priceCents, fieldErrors, measurementErrors } = getDraftValidation(draft);
  const hasMeasurementError = measurementErrors.some(Boolean);
  const suggestions = getMeasurementSuggestions(draft);
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
          const loadedDraft = createDraftFromItem(item);
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

  const updateDraft: UpdateShopItemDraft = (field) => (event) => {
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
        measurements: currentDraft.measurements.map(
          (measurement, currentIndex) =>
            currentIndex === index
              ? { ...measurement, [field]: value }
              : measurement
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

  const changePublished = (isPublished: boolean) => {
    setDraft((currentDraft) => ({ ...currentDraft, isPublished }));
  };

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

    const request = createRequestFromDraft(draft, priceCents);

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
            <ShopItemDetailsFields
              draft={draft}
              fieldErrors={fieldErrors}
              brandOptions={brandOptions}
              updateDraft={updateDraft}
              onPublishedChange={changePublished}
            />
            <ShopItemMeasurements
              measurements={draft.measurements}
              errors={measurementErrors}
              suggestions={suggestions}
              onUpdate={updateMeasurement}
              onAdd={addMeasurement}
              onRemove={removeMeasurement}
            />

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
