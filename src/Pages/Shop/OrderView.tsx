import { Link, useSearchParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { GetShopOrderByTokenAsync, ShopOrder } from '../../api/Shop/ShopRouter';
import { useDocumentTitle } from '../../hooks';
import { useAsync } from '../../useAsync';
import { formatDateTime, formatPrice } from './format';
import { formatOrderStatus, getOrderStatusClass } from './orderStatus';
import ShippingAddress from './ShippingAddress';
import styles from './Shop.module.css';

// The emailed magic-link destination. The token is the credential, so unlike the
// Stripe-return confirmation page this view may show the buyer's own email and
// shipping address.
export default function OrderView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    data: order,
    isLoading,
    error,
  } = useAsync<ShopOrder | null>(
    (signal) => GetShopOrderByTokenAsync(token, signal),
    [token],
    {
      enabled: Boolean(token),
      initialData: null,
      errorMessage: 'This order link is invalid or has expired.',
    }
  );
  const orderError = token ? error : 'No order was specified.';

  useDocumentTitle(order ? `Order #${order.id}` : 'Order');

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className={styles.statusText}>Loading order...</p>
      </main>
    );
  }

  if (orderError || !order) {
    return (
      <main className={styles.page}>
        <aside className={styles.errorNotice}>
          {orderError || 'This order link is invalid or has expired.'}
        </aside>
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.Shop}>
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.adminActions}>
        <Link className={styles.textLink} to={PAGES.Shop}>
          Back to shop
        </Link>
      </div>

      <article className={styles.orderCard}>
        <header className={styles.orderHeader}>
          <div>
            <h1 className={styles.orderTitle}>Order #{order.id}</h1>
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

        <p className={styles.cardMeta}>{order.customerEmail}</p>

        <ShippingAddress order={order} />

        <ul className={styles.orderLines}>
          {(order.lines ?? []).map((line) => (
            <li className={styles.orderLine} key={line.id}>
              <span>
                {line.quantity} x {line.title}
              </span>
              <span>
                {formatPrice(
                  line.unitPriceCents * line.quantity,
                  order.currency
                )}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
