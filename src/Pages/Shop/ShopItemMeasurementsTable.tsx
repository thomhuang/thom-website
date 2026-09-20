import { useEffect, useState } from 'react';

import type { ShopMeasurement } from '../../api/Shop/ShopRouter';
import { formatMeasurement } from './format';
import type { MeasurementUnit } from './format';
import styles from './Shop.module.css';

const measurementUnitStorageKey = 'shop-measurement-unit';

const getInitialMeasurementUnit = (): MeasurementUnit =>
  localStorage.getItem(measurementUnitStorageKey) === 'cm' ? 'cm' : 'in';

export default function ShopItemMeasurementsTable({
  measurements,
}: {
  measurements: ShopMeasurement[];
}) {
  const [unit, setUnit] = useState<MeasurementUnit>(getInitialMeasurementUnit);

  useEffect(() => {
    localStorage.setItem(measurementUnitStorageKey, unit);
  }, [unit]);

  return (
    <section
      className={styles.measurements}
      aria-labelledby="shop-measurements-title"
    >
      <div className={styles.measurementsHeader}>
        <h2 id="shop-measurements-title" className={styles.measurementsTitle}>
          Measurements
        </h2>
        <div
          className={styles.unitToggle}
          role="group"
          aria-label="Measurement units"
        >
          {(['in', 'cm'] as MeasurementUnit[]).map((option) => (
            <button
              type="button"
              key={option}
              className={[
                styles.unitToggleButton,
                unit === option ? styles.selectedUnit : '',
              ].join(' ')}
              onClick={() => setUnit(option)}
              aria-pressed={unit === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <table className={styles.measurementsTable}>
        <tbody>
          {measurements.map((measurement) => (
            <tr key={measurement.id ?? measurement.label}>
              <th scope="row">{measurement.label}</th>
              <td>{formatMeasurement(measurement.valueInches, unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
