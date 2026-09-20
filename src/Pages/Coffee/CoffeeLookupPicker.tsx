import type { CoffeeLookup } from './useCoffeeLookup';
import styles from './Coffee.module.css';

type CoffeeLookupPickerProps = {
  idPrefix: string;
  title: string;
  searchPlaceholder: string;
  emptyMessage: string;
  lookup: CoffeeLookup;
};

// Searchable option list with an inline "add by name" field. Used for both the
// roaster and the grinder on the brew entry form.
export default function CoffeeLookupPicker({
  idPrefix,
  title,
  searchPlaceholder,
  emptyMessage,
  lookup,
}: CoffeeLookupPickerProps) {
  return (
    <div
      className={styles.roasterPicker}
      role="group"
      aria-labelledby={`${idPrefix}-picker-label`}
    >
      <div className={styles.labelRow} id={`${idPrefix}-picker-label`}>
        {title}
        <span className={styles.required}>Required</span>
      </div>

      <input
        type="search"
        value={lookup.search}
        onChange={(event) => lookup.changeSearch(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
      />

      {lookup.selectedOption && (
        <p className={styles.selectedRoaster}>
          Selected: {lookup.selectedOption.label}
        </p>
      )}

      <div className={styles.roasterResults}>
        {lookup.filteredOptions.map((option) => (
          <button
            type="button"
            className={[
              styles.roasterOption,
              lookup.selectedOption?.id === option.id
                ? styles.selectedOption
                : '',
            ].join(' ')}
            key={option.id}
            onClick={() => lookup.select(option)}
            aria-pressed={lookup.selectedOption?.id === option.id}
          >
            <span>{option.label}</span>
          </button>
        ))}
        {lookup.filteredOptions.length === 0 && (
          <p className={styles.emptyResults}>{emptyMessage}</p>
        )}
      </div>

      <div className={styles.inlineAdd}>
        <p className={styles.inlineTitle}>Add {title.toLowerCase()}</p>
        <div className={styles.inlineFields}>
          <label className={styles.field} htmlFor={`new-${idPrefix}`}>
            {title}
            <input
              id={`new-${idPrefix}`}
              type="text"
              value={lookup.newValue}
              onChange={(event) => lookup.setNewValue(event.target.value)}
            />
          </label>
          <button
            type="button"
            className={styles.addButton}
            onClick={lookup.add}
            disabled={!lookup.newValue.trim() || lookup.isSubmitting}
          >
            {lookup.isSubmitting ? 'Saving' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
