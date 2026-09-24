import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { GetShopOrderAsync, PublicShopOrder } from '../../api/Shop/ShopRouter';
import { useDocumentTitle } from '../../hooks';
import { useAsync } from '../../useAsync';
import { formatPrice } from './format';
import { getOrderStatusCopy } from './orderStatus';
import styles from './Shop.module.css';

// While payment is still settling, poll for the webhook's result instead of
// making the buyer guess when to refresh. Capped so a stuck order does not poll
// forever.
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') ?? '';

  const {
    data: order,
    setData: setOrder,
    isLoading,
    error,
  } = useAsync<PublicShopOrder | null>(
    (signal) => GetShopOrderAsync(sessionId, signal),
    [sessionId],
    {
      enabled: Boolean(sessionId),
      initialData: null,
      errorMessage: 'Order could not be found.',
    }
  );
  const orderError = sessionId ? error : 'No order was specified.';

  useDocumentTitle('Order confirmation');

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
  }, [order?.status, sessionId, setOrder]);

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
  const { title, message } = getOrderStatusCopy(order.status);

  return (
    <main className={styles.page}>
      <div className={styles.adminActions}>
        <Link className={styles.textLink} to={PAGES.Shop}>
          Back to shop
        </Link>
      </div>

      <article className={styles.detail}>
        <div className={styles.detailBody}>
          <h1 className={styles.detailTitle}>{title}</h1>
          <p className={styles.cardMeta}>{message}</p>

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
