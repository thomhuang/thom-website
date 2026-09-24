import type { CoffeeEntrySummary } from '../../api/Coffee/CoffeeRouter';
import { getEntryStatGroups, getTastingNotes } from './coffeeGroups';
import type { TemperatureUnit } from './format';
import styles from './Coffee.module.css';

type CoffeeEntryDetailsProps = {
  entry: CoffeeEntrySummary;
  temperatureUnit: TemperatureUnit;
};

export default function CoffeeEntryDetails({
  entry,
  temperatureUnit,
}: CoffeeEntryDetailsProps) {
  const statGroups = getEntryStatGroups(entry, temperatureUnit);
  const tastingNotes = getTastingNotes(entry);

  return (
    <>
      {statGroups.map((statGroup) => (
        <div className={styles.statGroup} key={statGroup.title}>
          <h5 className={styles.statGroupTitle}>{statGroup.title}</h5>
          <dl className={styles.statList}>
            {statGroup.stats.map((stat) => (
              <div className={styles.statRow} key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      {(tastingNotes || entry.pourNotes) && (
        <div className={styles.entryText}>
          {tastingNotes && <p className={styles.entryNotes}>{tastingNotes}</p>}
          {entry.pourNotes && (
            <p className={styles.entryNotes}>
              <span className={styles.entryNoteLabel}>Pour notes</span>
              {entry.pourNotes}
            </p>
          )}
        </div>
      )}
    </>
  );
}
