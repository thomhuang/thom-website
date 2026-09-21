import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import type { ShopItemSummary } from '../../api/Shop/ShopRouter';
import { formatPrice, formatStock } from './format';
import styles from './Shop.module.css';

type ShopCardProps = {
  item: ShopItemSummary;
  canManage: boolean;
  isDeleting: boolean;
  isSelected: boolean;
  onDelete: (item: ShopItemSummary) => void;
  onToggleSelected: (id: string) => void;
};

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <span className={styles.cardPlaceholder}>No image</span>;
  }

  return (
    <img
      className={styles.cardImage}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export default function ShopCard({
  item,
  canManage,
  isDeleting,
  isSelected,
  onDelete,
  onToggleSelected,
}: ShopCardProps) {
  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} to={`${PAGES.ShopItem}/${item.id}`}>
        <div className={styles.cardMedia}>
          <CardImage src={item.primaryImageUrl} alt={item.title} />
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardInfo}>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            {item.brand && <p className={styles.cardMeta}>{item.brand}</p>}
          </div>
          <div className={styles.cardPricing}>
            <p className={styles.cardPrice}>
              {formatPrice(item.priceCents, item.currency)}
            </p>
            <p className={styles.cardMeta}>{formatStock(item.stock)}</p>
            {!item.isPublished && <p className={styles.draftTag}>Draft</p>}
          </div>
        </div>
      </Link>

      {canManage && (
        <div className={styles.cardActions}>
          <label className={styles.selectControl}>
            <input
              type="checkbox"
              aria-label={`Select ${item.title}`}
              checked={isSelected}
              onChange={() => onToggleSelected(item.id)}
            />
            Select
          </label>
          <Link
            className={styles.textLink}
            to={`${PAGES.ShopEntry}/${item.id}`}
          >
            Edit
          </Link>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onDelete(item)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting' : 'Delete'}
          </button>
        </div>
      )}
    </article>
  );
}
