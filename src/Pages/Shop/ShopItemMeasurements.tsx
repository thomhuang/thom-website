import type { ChangeEventHandler } from 'react';

import type { MeasurementDraft } from './shopItemDraft';
import styles from './Shop.module.css';

type ShopItemMeasurementsProps = {
  measurements: MeasurementDraft[];
  errors: (string | null)[];
  suggestions: string[];
  onUpdate: (
    index: number,
    field: keyof MeasurementDraft
  ) => ChangeEventHandler<HTMLInputElement>;
  onAdd: (label?: string) => void;
  onRemove: (index: number) => void;
};

export default function ShopItemMeasurements({
  measurements,
  errors,
  suggestions,
  onUpdate,
  onAdd,
  onRemove,
}: ShopItemMeasurementsProps) {
  return (
    <section className={styles.section} aria-labelledby="shop-measurements">
      <h2 id="shop-measurements">Measurements</h2>
      <p className={styles.hint}>
        Optional. Values are inches; the listing page converts to cm on request.
        Add any labels you like — the category above just suggests common ones.
      </p>

      {suggestions.length > 0 && (
        <div className={styles.suggestionRow}>
          <span className={styles.hint}>Quick add:</span>
          {suggestions.map((suggestion) => (
            <button
              type="button"
              className={styles.suggestionChip}
              key={suggestion}
              onClick={() => onAdd(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {measurements.length === 0 ? (
        <p className={styles.hint}>No measurements on this listing.</p>
      ) : (
        <ul className={styles.measurementList}>
          {measurements.map((measurement, index) => {
            const error = errors[index];

            return (
              <li className={styles.measurementRow} key={index}>
                <input
                  className={styles.measurementLabel}
                  type="text"
                  placeholder="Label (e.g. Waist)"
                  value={measurement.label}
                  onChange={onUpdate(index, 'label')}
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
                  onChange={onUpdate(index, 'value')}
                  aria-label="Measurement value in inches"
                />
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onRemove(index)}
                >
                  Remove
                </button>
                {error && <span className={styles.fieldError}>{error}</span>}
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.adminActions}>
        <button
          type="button"
          className={styles.textLink}
          onClick={() => onAdd()}
        >
          Add measurement
        </button>
      </div>
    </section>
  );
}
