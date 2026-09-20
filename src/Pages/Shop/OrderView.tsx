import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { GetShopOrderByTokenAsync, ShopOrder } from '../../api/Shop/ShopRouter';
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
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setOrderError('No order was specified.');
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadOrder = async () => {
      setIsLoading(true);
      setOrderError('');

      try {
        const loadedOrder = await GetShopOrderByTokenAsync(
          token,
          controller.signal
        );

        if (isMounted) {
          setOrder(loadedOrder);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setOrder(null);
          setOrderError('This order link is invalid or has expired.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token]);

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
