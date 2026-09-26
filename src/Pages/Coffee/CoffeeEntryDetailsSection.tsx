import Dropdown from '../../Components/Dropdown/Dropdown';
import CoffeeLookupPicker from './CoffeeLookupPicker';
import { brewMethods } from './coffeeEntryDraft';
import type {
  BrewLogDraft,
  FieldErrors,
  SetDraftField,
  UpdateDraft,
} from './coffeeEntryDraft';
import type { CoffeeLookup } from './useCoffeeLookup';
import styles from './Coffee.module.css';

type CoffeeEntryDetailsSectionProps = {
  draft: BrewLogDraft;
  fieldErrors: FieldErrors;
  daysSinceRoast: string;
  updateDraft: UpdateDraft;
  setDraftField: SetDraftField;
  roaster: CoffeeLookup;
};

export default function CoffeeEntryDetailsSection({
  draft,
  fieldErrors,
  daysSinceRoast,
  updateDraft,
  setDraftField,
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

        <Dropdown
          label={
            <span className={styles.labelRow}>
              Brew method
              <span className={styles.required}>Required</span>
            </span>
          }
          value={draft.brewMethod}
          options={[{ value: '', label: 'Select' }, ...brewMethods]}
          onChange={(value) => setDraftField('brewMethod', value)}
          buttonAriaLabel="Brew method"
        />

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

        <label className={styles.field} htmlFor="roast-date">
          Roast date
          <input
            id="roast-date"
            type="date"
            value={draft.roastDate}
            onChange={updateDraft('roastDate')}
          />
          {fieldErrors.roastDate && (
            <span className={styles.fieldError}>{fieldErrors.roastDate}</span>
          )}
        </label>

        <label className={styles.field} htmlFor="days-since-roast">
          Days since roast
          <input
            id="days-since-roast"
            type="text"
            value={daysSinceRoast}
            placeholder="12"
            readOnly
            aria-readonly="true"
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
