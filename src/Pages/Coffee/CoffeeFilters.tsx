import type {
  CoffeeGrinder,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import { formatBrewMethod } from './coffeeGroups';
import styles from './Coffee.module.css';

type CoffeeFiltersProps = {
  isOpen: boolean;
  roasterOptions: CoffeeRoaster[];
  grinderOptions: CoffeeGrinder[];
  brewMethodOptions: string[];
  selectedRoasterId: string;
  selectedGrinderId: string;
  selectedBrewMethod: string;
  onToggle: () => void;
  onRoasterChange: (value: string) => void;
  onGrinderChange: (value: string) => void;
  onBrewMethodChange: (value: string) => void;
};

export default function CoffeeFilters({
  isOpen,
  roasterOptions,
  grinderOptions,
  brewMethodOptions,
  selectedRoasterId,
  selectedGrinderId,
  selectedBrewMethod,
  onToggle,
  onRoasterChange,
  onGrinderChange,
  onBrewMethodChange,
}: CoffeeFiltersProps) {
  return (
    <div className={styles.filterGroup}>
      <button
        type="button"
        className={styles.filterToggle}
        aria-expanded={isOpen}
        aria-controls="coffee-filters"
        onClick={onToggle}
      >
        Filters
        <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>

      <div
        id="coffee-filters"
        className={[styles.filterBar, isOpen ? styles.filterBarOpen : ''].join(
          ' '
        )}
      >
        {roasterOptions.length > 0 && (
          <label className={styles.field} htmlFor="coffee-roaster-filter">
            Roaster
            <select
              id="coffee-roaster-filter"
              value={selectedRoasterId}
              onChange={(event) => onRoasterChange(event.target.value)}
            >
              <option value="">All roasters</option>
              {roasterOptions.map((roaster) => (
                <option value={roaster.id} key={roaster.id}>
                  {roaster.roaster}
                </option>
              ))}
            </select>
          </label>
        )}

        {grinderOptions.length > 0 && (
          <label className={styles.field} htmlFor="coffee-grinder-filter">
            Grinder
            <select
              id="coffee-grinder-filter"
              value={selectedGrinderId}
              onChange={(event) => onGrinderChange(event.target.value)}
            >
              <option value="">All grinders</option>
              {grinderOptions.map((grinder) => (
                <option value={grinder.id} key={grinder.id}>
                  {grinder.grinder}
                </option>
              ))}
            </select>
          </label>
        )}

        {brewMethodOptions.length > 0 && (
          <label className={styles.field} htmlFor="coffee-method-filter">
            Brew method
            <select
              id="coffee-method-filter"
              value={selectedBrewMethod}
              onChange={(event) => onBrewMethodChange(event.target.value)}
            >
              <option value="">All methods</option>
              {brewMethodOptions.map((method) => (
                <option value={method} key={method}>
                  {formatBrewMethod(method)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
