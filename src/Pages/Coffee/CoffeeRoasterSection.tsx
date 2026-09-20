import type { CoffeeEntrySummary } from '../../api/Coffee/CoffeeRouter';
import CoffeeGroupSection from './CoffeeGroupSection';
import { getRoasterCountLabel } from './coffeeGroups';
import type { RoasterGroup } from './coffeeGroups';
import type { TemperatureUnit } from './format';
import styles from './Coffee.module.css';

type CoffeeRoasterSectionProps = {
  group: RoasterGroup;
  temperatureUnit: TemperatureUnit;
  canManage: boolean;
  deletingEntryId: string | null;
  onDelete: (entry: CoffeeEntrySummary) => void;
};

export default function CoffeeRoasterSection({
  group,
  temperatureUnit,
  canManage,
  deletingEntryId,
  onDelete,
}: CoffeeRoasterSectionProps) {
  return (
    <section className={styles.roasterGroup}>
      <details className={styles.roasterDetails}>
        <summary className={styles.roasterSummary}>
          <h3 className={styles.roasterTitle}>{group.roasterName}</h3>
          <span className={styles.groupCount}>{getRoasterCountLabel(group)}</span>
        </summary>

        <div className={styles.coffeeGroups}>
          {group.coffees.map((coffee) => (
            <CoffeeGroupSection
              key={coffee.key}
              group={coffee}
              temperatureUnit={temperatureUnit}
              canManage={canManage}
              deletingEntryId={deletingEntryId}
              onDelete={onDelete}
            />
          ))}
        </div>
      </details>
    </section>
  );
}
