import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import { useDocumentTitle } from '../../hooks';
import { useAsync } from '../../useAsync';
import {
  GetShopOrdersAsync,
  ReleaseShopOrderHoldAsync,
  ShopOrder,
} from '../../api/Shop/ShopRouter';
import ShopOrderCard from './ShopOrderCard';
import styles from './Shop.module.css';

const ORDERS_PAGE_SIZE = 20;

export default function ShopOrders() {
  useDocumentTitle('Orders');

  const { isAdmin, isAuthLoading } = useAuth();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [actionError, setActionError] = useState('');

  const {
    data,
    setData,
    isLoading,
    error: loadError,
  } = useAsync(
    async (signal) => {
      const page = await GetShopOrdersAsync({
        signal,
        limit: ORDERS_PAGE_SIZE,
      });

      return { orders: page.orders ?? [], nextCursor: page.nextCursor };
    },
    [isAdmin, isAuthLoading],
    {
      enabled: !isAuthLoading && isAdmin,
      initialData: { orders: [] as ShopOrder[], nextCursor: '' },
      errorMessage: 'Orders could not be loaded.',
    }
  );
  const { orders, nextCursor } = data;
  const ordersError = loadError || actionError;

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setActionError('');

    try {
      const page = await GetShopOrdersAsync({
        cursor: nextCursor,
        limit: ORDERS_PAGE_SIZE,
      });

      setData((current) => ({
        orders: [...current.orders, ...(page.orders ?? [])],
        nextCursor: page.nextCursor,
      }));
    } catch {
      setActionError('More orders could not be loaded.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const releaseHold = async (order: ShopOrder) => {
    setActionError('');

    try {
      await ReleaseShopOrderHoldAsync(order.stripeSessionId);
      setData((current) => ({
        ...current,
        orders: current.orders.map((existing) =>
          existing.id === order.id
            ? { ...existing, status: 'expired' as const }
            : existing
        ),
      }));
    } catch {
      setActionError('The hold could not be released.');
    }
  };

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
            <ShopOrderCard key={order.id} order={order} onRelease={releaseHold} />
          ))}
        </section>
      )}

      {!isAuthLoading && isAdmin && !isLoading && nextCursor && (
        <div className={styles.adminActions}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load more orders'}
          </button>
        </div>
      )}
    </main>
  );
}
