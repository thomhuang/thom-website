import { useState } from 'react';

import type { CoffeeEntrySummary } from '../../api/Coffee/CoffeeRouter';
import CoffeeGroupSection from './CoffeeGroupSection';
import CoffeePager from './CoffeePager';
import { getTotalPages, useCoffeePageSize } from './coffeePagination';
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
  const [coffeePage, setCoffeePage] = useState(1);
  const pageSize = useCoffeePageSize();
  const totalPages = getTotalPages(group.coffees.length, pageSize);
  const currentPage = Math.min(coffeePage, totalPages);
  const pageCoffees = group.coffees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Keep the page in range when a coffee is deleted.
  if (coffeePage > totalPages) {
    setCoffeePage(totalPages);
  }

  return (
    <section className={styles.roasterGroup}>
      <details className={styles.roasterDetails}>
        <summary className={styles.roasterSummary}>
          <h3 className={styles.roasterTitle}>{group.roasterName}</h3>
          <span className={styles.groupCount}>{getRoasterCountLabel(group)}</span>
        </summary>

        <div className={styles.coffeeGroups}>
          {pageCoffees.map((coffee) => (
            <CoffeeGroupSection
              key={coffee.key}
              group={coffee}
              temperatureUnit={temperatureUnit}
              canManage={canManage}
              deletingEntryId={deletingEntryId}
              onDelete={onDelete}
            />
          ))}
          <CoffeePager
            label="Coffees"
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCoffeePage}
          />
        </div>
      </details>
    </section>
  );
}
