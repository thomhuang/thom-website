import CoffeeLookupPicker from './CoffeeLookupPicker';
import { brewMethods } from './coffeeEntryDraft';
import type { BrewLogDraft, UpdateDraft } from './coffeeEntryDraft';
import type { CoffeeLookup } from './useCoffeeLookup';
import styles from './Coffee.module.css';

type CoffeeEntryDetailsSectionProps = {
  draft: BrewLogDraft;
  updateDraft: UpdateDraft;
  roaster: CoffeeLookup;
};

export default function CoffeeEntryDetailsSection({
  draft,
  updateDraft,
  roaster,
}: CoffeeEntryDetailsSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="coffee-details">
      <h2 id="coffee-details">Coffee details</h2>

      <div className={styles.fieldGrid}>
        <label className={styles.field} htmlFor="brew-date">
          <span className={styles.labelRow}>
            Date
            <span className={styles.required}>Required</span>
          </span>
          <input
            id="brew-date"
            type="date"
            value={draft.date}
            onChange={updateDraft('date')}
            required
          />
        </label>

        <label className={styles.field} htmlFor="brew-method">
          <span className={styles.labelRow}>
            Brew method
            <span className={styles.required}>Required</span>
          </span>
          <select
            id="brew-method"
            value={draft.brewMethod}
            onChange={updateDraft('brewMethod')}
            required
          >
            <option value="">Select</option>
            {brewMethods.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field} htmlFor="coffee-name">
          <span className={styles.labelRow}>
            Coffee
            <span className={styles.required}>Required</span>
          </span>
          <input
            id="coffee-name"
            type="text"
            value={draft.coffeeName}
            onChange={updateDraft('coffeeName')}
            required
          />
        </label>

        <label className={styles.field} htmlFor="coffee-origin">
          Origin
          <input
            id="coffee-origin"
            type="text"
            value={draft.origin}
            onChange={updateDraft('origin')}
            placeholder="Mbeya, Tanzania"
          />
        </label>

        <label className={styles.field} htmlFor="coffee-varietal">
          Coffee varietal
          <input
            id="coffee-varietal"
            type="text"
            value={draft.coffeeVarietal}
            onChange={updateDraft('coffeeVarietal')}
            placeholder="Bourbon"
          />
        </label>

        <label className={styles.field} htmlFor="processing-method">
          Processing method
          <input
            id="processing-method"
            type="text"
            value={draft.processingMethod}
            onChange={updateDraft('processingMethod')}
            placeholder="Washed"
          />
        </label>

        <label className={styles.field} htmlFor="days-since-roast">
          Days since roast
          <input
            id="days-since-roast"
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.daysSinceRoast}
            onChange={updateDraft('daysSinceRoast')}
            placeholder="12"
          />
        </label>
      </div>

      <CoffeeLookupPicker
        idPrefix="roaster"
        title="Roaster"
        searchPlaceholder="Search roaster"
        emptyMessage="No matching roasters yet."
        lookup={roaster}
      />
    </section>
  );
}
