import CoffeeLookupPicker from './CoffeeLookupPicker';
import { RATIO_PREFIX, roastLevels } from './coffeeEntryDraft';
import type { BrewLogDraft, FieldErrors, UpdateDraft } from './coffeeEntryDraft';
import type { TemperatureUnit } from './format';
import type { CoffeeLookup } from './useCoffeeLookup';
import styles from './Coffee.module.css';

type CoffeeEntryBrewSectionProps = {
  draft: BrewLogDraft;
  fieldErrors: FieldErrors;
  yieldAmount: string;
  temperatureUnit: TemperatureUnit;
  updateDraft: UpdateDraft;
  changeTemperatureUnit: (unit: TemperatureUnit) => void;
  grinder: CoffeeLookup;
};

export default function CoffeeEntryBrewSection({
  draft,
  fieldErrors,
  yieldAmount,
  temperatureUnit,
  updateDraft,
  changeTemperatureUnit,
  grinder,
}: CoffeeEntryBrewSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="brew-setup">
      <h2 id="brew-setup">Brew setup</h2>

      <div className={styles.fieldGrid}>
        <label className={styles.field} htmlFor="ratio">
          <span className={styles.labelRow}>
            Ratio
            <span className={styles.required}>Required</span>
          </span>
          <span className={styles.ratioInput}>
            <span aria-hidden="true">{RATIO_PREFIX}</span>
            <input
              id="ratio"
              className={fieldErrors.ratio ? styles.invalid : undefined}
              type="text"
              inputMode="decimal"
              pattern="\d+(\.\d+)?"
              title="Enter a number"
              value={draft.ratio}
              onChange={updateDraft('ratio')}
              placeholder="16.67"
              required
            />
          </span>
          {fieldErrors.ratio && (
            <span className={styles.fieldError}>{fieldErrors.ratio}</span>
          )}
        </label>

        <label className={styles.field} htmlFor="grind-setting">
          <span className={styles.labelRow}>
            Grind setting
            <span className={styles.required}>Required</span>
          </span>
          <input
            id="grind-setting"
            className={fieldErrors.grindSetting ? styles.invalid : undefined}
            type="text"
            inputMode="decimal"
            pattern="\d+(\.\d+)?"
            title="Enter a number"
            value={draft.grindSetting}
            onChange={updateDraft('grindSetting')}
            required
          />
          {fieldErrors.grindSetting && (
            <span className={styles.fieldError}>{fieldErrors.grindSetting}</span>
          )}
        </label>

        <label className={styles.field} htmlFor="roast-level">
          <span className={styles.labelRow}>Roast level</span>
          <select
            id="roast-level"
            value={draft.roastLevel}
            onChange={updateDraft('roastLevel')}
          >
            <option value="">Select</option>
            {roastLevels.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field} htmlFor="dose">
          Dose (g)
          <input
            id="dose"
            className={fieldErrors.dose ? styles.invalid : undefined}
            type="text"
            inputMode="numeric"
            pattern="\d+"
            value={draft.dose}
            onChange={updateDraft('dose')}
            placeholder="20"
          />
          {fieldErrors.dose && (
            <span className={styles.fieldError}>{fieldErrors.dose}</span>
          )}
        </label>

        <label className={styles.field} htmlFor="yield-amount">
          Yield (g)
          <input
            id="yield-amount"
            type="text"
            value={yieldAmount}
            placeholder="320"
            readOnly
            aria-readonly="true"
          />
        </label>

        <label className={styles.field} htmlFor="water-temp">
          <span className={styles.labelRow}>
            Water temperature
            <span
              className={styles.unitToggle}
              role="group"
              aria-label="Temperature units"
            >
              {(['C', 'F'] as TemperatureUnit[]).map((unit) => (
                <button
                  type="button"
                  key={unit}
                  className={[
                    styles.unitToggleButton,
                    temperatureUnit === unit ? styles.selectedUnit : '',
                  ].join(' ')}
                  onClick={() => changeTemperatureUnit(unit)}
                  aria-pressed={temperatureUnit === unit}
                >
                  °{unit}
                </button>
              ))}
            </span>
          </span>
          <input
            id="water-temp"
            className={fieldErrors.waterTemperature ? styles.invalid : undefined}
            type="text"
            inputMode="decimal"
            pattern="\d+(\.\d+)?"
            title="Enter a number"
            value={draft.waterTemperature}
            onChange={updateDraft('waterTemperature')}
            placeholder={temperatureUnit === 'C' ? '93' : '199'}
          />
          {fieldErrors.waterTemperature && (
            <span className={styles.fieldError}>
              {fieldErrors.waterTemperature}
            </span>
          )}
        </label>

        <label className={styles.field} htmlFor="brew-time">
          Brew time
          <input
            id="brew-time"
            className={fieldErrors.brewTime ? styles.invalid : undefined}
            type="text"
            value={draft.brewTime}
            onChange={updateDraft('brewTime')}
            placeholder="3:20"
            pattern="\d{1,2}:[0-5]\d"
            title="Enter a time like 3:20"
          />
          {fieldErrors.brewTime && (
            <span className={styles.fieldError}>{fieldErrors.brewTime}</span>
          )}
        </label>
      </div>

      <CoffeeLookupPicker
        idPrefix="grinder"
        title="Grinder"
        searchPlaceholder="Search grinder"
        emptyMessage="No matching grinders yet."
        lookup={grinder}
      />
    </section>
  );
}
