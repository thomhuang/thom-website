import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import styles from './Shop.module.css';

export type ShopDropdownOption = {
  value: string;
  label: string;
};

type ShopDropdownProps = {
  label: string;
  value: string;
  options: ShopDropdownOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
};

export default function ShopDropdown({
  label,
  value,
  options,
  onChange,
  icon,
}: ShopDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        fieldRef.current &&
        !fieldRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <div className={styles.dropdownField} ref={fieldRef}>
      <span id={labelId}>{label}</span>
      <button
        type="button"
        className={styles.dropdownButton}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {icon}
        <span>{selectedLabel}</span>
        <svg
          className={styles.dropdownChevron}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <ul
          className={styles.dropdownMenu}
          role="menu"
          aria-labelledby={labelId}
        >
          {options.map((option) => (
            <li key={option.value} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={value === option.value}
                className={styles.dropdownMenuItem}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
