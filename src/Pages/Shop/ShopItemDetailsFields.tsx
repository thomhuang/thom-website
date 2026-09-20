import type { ShopBrand } from '../../api/Shop/ShopRouter';
import { SHOP_CATEGORIES } from './measurements';
import type {
  ShopItemDraft,
  ShopItemFieldErrors,
  UpdateShopItemDraft,
} from './shopItemDraft';
import styles from './Shop.module.css';

type ShopItemDetailsFieldsProps = {
  draft: ShopItemDraft;
  fieldErrors: ShopItemFieldErrors;
  brandOptions: ShopBrand[];
  updateDraft: UpdateShopItemDraft;
  onPublishedChange: (isPublished: boolean) => void;
};

export default function ShopItemDetailsFields({
  draft,
  fieldErrors,
  brandOptions,
  updateDraft,
  onPublishedChange,
}: ShopItemDetailsFieldsProps) {
  return (
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

      <label className={styles.field} htmlFor="shop-size">
        Size
        <input
          id="shop-size"
          type="text"
          value={draft.size}
          onChange={updateDraft('size')}
          placeholder="e.g. Large"
          maxLength={40}
        />
        <span className={styles.hint}>
          Free-form; leave blank when it does not apply.
        </span>
      </label>

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
          onChange={(event) => onPublishedChange(event.target.checked)}
        />
        Published
        <span className={styles.hint}>
          Drafts are only visible while signed in.
        </span>
      </label>
    </section>
  );
}
