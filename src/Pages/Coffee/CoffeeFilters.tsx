import type {
  CoffeeGrinder,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import Dropdown from '../../Components/Dropdown/Dropdown';
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
          <Dropdown
            label="Roaster"
            value={selectedRoasterId}
            options={[
              { value: '', label: 'All roasters' },
              ...roasterOptions.map((roaster) => ({
                value: roaster.id,
                label: roaster.roaster,
              })),
            ]}
            onChange={onRoasterChange}
          />
        )}

        {grinderOptions.length > 0 && (
          <Dropdown
            label="Grinder"
            value={selectedGrinderId}
            options={[
              { value: '', label: 'All grinders' },
              ...grinderOptions.map((grinder) => ({
                value: grinder.id,
                label: grinder.grinder,
              })),
            ]}
            onChange={onGrinderChange}
          />
        )}

        {brewMethodOptions.length > 0 && (
          <Dropdown
            label="Brew method"
            value={selectedBrewMethod}
            options={[
              { value: '', label: 'All methods' },
              ...brewMethodOptions.map((method) => ({
                value: method,
                label: formatBrewMethod(method),
              })),
            ]}
            onChange={onBrewMethodChange}
          />
        )}
      </div>
    </div>
  );
}
