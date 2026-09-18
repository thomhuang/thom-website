import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import { GetShopOrdersAsync, ShopOrder } from '../../api/Shop/ShopRouter';
import { formatDateTime, formatPrice } from './format';
import styles from './Shop.module.css';

export default function ShopOrders() {
  const { isAdmin, isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (isAuthLoading || !isAdmin) {
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setOrdersError('');

      try {
        const loadedOrders = await GetShopOrdersAsync(controller.signal);

        if (isMounted) {
          setOrders(loadedOrders);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setOrders([]);
          setOrdersError('Orders could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAdmin, isAuthLoading]);

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="shop-orders-title">
        <h1 id="shop-orders-title">Orders</h1>
        <p className={styles.deck}>Every checkout, newest first.</p>
      </section>

      <div className={styles.adminActions}>
        <Link className={styles.textLink} to={PAGES.Shop}>
          Back to shop
        </Link>
      </div>

      {isAuthLoading && (
        <aside className={styles.notice}>Checking admin access...</aside>
      )}

      {!isAuthLoading && !isAdmin && (
        <section className={styles.publicState} aria-labelledby="shop-orders-admin">
          <h2 id="shop-orders-admin">Sign in to view orders.</h2>
          <p>The order list is admin-only.</p>
        </section>
      )}

      {!isAuthLoading && isAdmin && ordersError && (
        <aside className={styles.errorNotice}>{ordersError}</aside>
      )}

      {!isAuthLoading && isAdmin && isLoading && (
        <p className={styles.statusText}>Loading orders...</p>
      )}

      {!isAuthLoading && isAdmin && !isLoading && orders.length === 0 && (
        <div className={styles.emptyState}>
          <p>No orders yet.</p>
          <p>Completed checkouts will show here.</p>
        </div>
      )}

      {!isAuthLoading && isAdmin && !isLoading && orders.length > 0 && (
        <section className={styles.orderList} aria-label="Orders">
          {orders.map((order) => (
            <article className={styles.orderCard} key={order.id}>
              <header className={styles.orderHeader}>
                <div>
                  <h2 className={styles.orderTitle}>Order #{order.id}</h2>
                  <p className={styles.cardMeta}>
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className={styles.orderHeaderMeta}>
                  <span
                    className={
                      order.status === 'paid'
                        ? styles.statusPaid
                        : styles.statusPending
                    }
                  >
                    {order.status}
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

              {order.shippingAddress && (
                <p className={styles.cardMeta}>{order.shippingAddress}</p>
              )}

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

              <p className={styles.orderSession}>{order.stripeSessionId}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
