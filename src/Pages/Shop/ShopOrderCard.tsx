import type { ShopOrder } from '../../api/Shop/ShopRouter';
import { formatDateTime, formatPrice } from './format';
import { formatOrderStatus, getOrderStatusClass } from './orderStatus';
import ShippingAddress from './ShippingAddress';
import styles from './Shop.module.css';

export default function ShopOrderCard({
  order,
  onRelease,
}: {
  order: ShopOrder;
  onRelease?: (order: ShopOrder) => void;
}) {
  return (
    <article className={styles.orderCard}>
      <header className={styles.orderHeader}>
        <div>
          <h2 className={styles.orderTitle}>Order #{order.id}</h2>
          <p className={styles.cardMeta}>{formatDateTime(order.createdAt)}</p>
        </div>
        <div className={styles.orderHeaderMeta}>
          <span className={getOrderStatusClass(order.status)}>
            {formatOrderStatus(order.status)}
          </span>
          <p className={styles.orderTotal}>
            {formatPrice(order.amountTotalCents, order.currency)}
          </p>
        </div>
      </header>

      {(order.customerName || order.customerEmail) && (
        <p className={styles.cardMeta}>
          {[order.customerName, order.customerEmail]
            .filter(Boolean)
            .join(' | ')}
        </p>
      )}

      <ShippingAddress order={order} />

      <ul className={styles.orderLines}>
        {(order.lines ?? []).map((line) => (
          <li className={styles.orderLine} key={line.id}>
            <span>
              {line.quantity} x {line.title}
            </span>
            <span>
              {formatPrice(line.unitPriceCents * line.quantity, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.orderSession}>{order.stripeSessionId}</p>

      {order.status === 'pending' && onRelease && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onRelease(order)}
        >
          Release hold
        </button>
      )}
    </article>
  );
}
