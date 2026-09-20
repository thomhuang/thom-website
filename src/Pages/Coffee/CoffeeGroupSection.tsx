import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import type { CoffeeEntrySummary } from '../../api/Coffee/CoffeeRouter';
import CoffeeEntryCard from './CoffeeEntryCard';
import {
  formatCoffeeMetadata,
  formatCount,
  getGroupPrefill,
} from './coffeeGroups';
import type { CoffeeGroup } from './coffeeGroups';
import type { TemperatureUnit } from './format';
import styles from './Coffee.module.css';

type CoffeeGroupSectionProps = {
  group: CoffeeGroup;
  temperatureUnit: TemperatureUnit;
  canManage: boolean;
  deletingEntryId: string | null;
  onDelete: (entry: CoffeeEntrySummary) => void;
};

export default function CoffeeGroupSection({
  group,
  temperatureUnit,
  canManage,
  deletingEntryId,
  onDelete,
}: CoffeeGroupSectionProps) {
  const coffeeMetadata = Array.from(
    new Set(group.entries.map(formatCoffeeMetadata).filter(Boolean))
  );
  const groupMeta = coffeeMetadata.join(' · ');
  const brewCount = formatCount(group.entries.length, 'brew', 'brews');

  return (
    <section className={styles.coffeeGroup}>
      <details className={styles.groupDetails}>
        <summary className={styles.groupSummary}>
          <h4 className={styles.groupTitle}>{group.coffeeName}</h4>
          {canManage && (
            <Link
              className={styles.textLink}
              to={PAGES.CoffeeEntry}
              state={{ prefill: getGroupPrefill(group) }}
              onClick={(event) => event.stopPropagation()}
              aria-label={`New brew for ${group.coffeeName}`}
            >
              + New brew
            </Link>
          )}
          <span className={styles.groupCount}>{brewCount}</span>
        </summary>

        {groupMeta && <p className={styles.entryMeta}>{groupMeta}</p>}

        <div className={styles.entryGrid}>
          {group.entries.map((entry) => (
            <CoffeeEntryCard
              key={entry.id}
              entry={entry}
              temperatureUnit={temperatureUnit}
              canManage={canManage}
              isDeleting={deletingEntryId === entry.id}
              onDelete={onDelete}
            />
          ))}
        </div>
      </details>
    </section>
  );
}
