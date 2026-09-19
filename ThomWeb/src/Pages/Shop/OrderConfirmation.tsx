import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { GetShopOrderAsync, PublicShopOrder } from '../../api/Shop/ShopRouter';
import { formatPrice } from './format';
import styles from './Shop.module.css';

// While payment is still settling, poll for the webhook's result instead of
// making the buyer guess when to refresh. Capped so a stuck order does not poll
// forever.
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') ?? '';
  const [order, setOrder] = useState<PublicShopOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (!sessionId) {
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
        const loadedOrder = await GetShopOrderAsync(
          sessionId,
          controller.signal
        );

        if (isMounted) {
          setOrder(loadedOrder);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setOrder(null);
          setOrderError('Order could not be found.');
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
  }, [sessionId]);

  // The webhook can land after the Stripe redirect, so a pending order is polled
  // until it settles. A failed poll keeps the last known order rather than
  // blanking the page.
  useEffect(() => {
    if (!sessionId || order?.status !== 'pending') {
      return;
    }

    let isMounted = true;
    let attempts = 0;
    let timer: number | undefined;

    const poll = async () => {
      attempts += 1;

      try {
        const latest = await GetShopOrderAsync(sessionId);

        if (!isMounted) {
          return;
        }

        setOrder(latest);

        if (latest.status !== 'pending') {
          return;
        }
      } catch {
        // Transient failure: keep the current order and try again.
      }

      if (isMounted && attempts < MAX_POLLS) {
        timer = window.setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    timer = window.setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;

      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [order?.status, sessionId]);

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
          {orderError || 'Order could not be found.'}
        </aside>
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.Shop}>
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const isPending = order.status === 'pending';
  const isPaid = order.status === 'paid';
  const isRefunded = order.status === 'refunded';
  const isRefundPending = order.status === 'refund_pending';

  return (
    <main className={styles.page}>
      <div className={styles.adminActions}>
        <Link className={styles.textLink} to={PAGES.Shop}>
          Back to shop
        </Link>
      </div>

      <article className={styles.detail}>
        <div className={styles.detailBody}>
          <h1 className={styles.detailTitle}>
            {isRefunded
              ? 'Order refunded'
              : isRefundPending
                ? 'Order being refunded'
                : isPaid
                  ? 'Thank you'
                  : 'Order received'}
          </h1>
          <p className={styles.cardMeta}>
            {isRefunded
              ? 'This order could not be fulfilled and has been refunded.'
              : isRefundPending
                ? 'This order could not be fulfilled and is being refunded.'
                : isPaid
                  ? 'Payment received. Your order is confirmed.'
                  : 'Payment is still being confirmed. This page updates automatically.'}
          </p>

          <p className={styles.detailPrice}>
            {formatPrice(order.amountTotalCents, order.currency)}
          </p>

          <ul>
            {(order.lines ?? []).map((line) => (
              <li key={line.id} className={styles.cardMeta}>
                {line.quantity} x {line.title}
              </li>
            ))}
          </ul>

          {/* The confirmation endpoint returns no personal data, so the buyer's
              email and shipping address are not shown here. Point at the emailed
              order link without claiming a delivery the best-effort send may not
              have made; the email is only attempted once payment settles. */}
          {!isPending && (
            <p className={styles.cardMeta}>
              Check your email for a private link to your full order details.
            </p>
          )}
        </div>
      </article>
    </main>
  );
}
