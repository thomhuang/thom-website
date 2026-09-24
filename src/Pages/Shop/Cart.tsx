import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { StartShopCheckoutAsync } from '../../api/Shop/ShopRouter';
import { useDocumentTitle } from '../../hooks';
import { useCart } from './CartContext';
import { checkoutErrorMessage } from './checkoutError';
import { formatPrice } from './format';
import styles from './Shop.module.css';

export default function Cart() {
  useDocumentTitle('Cart');

  const { lines, count, subtotalCents, remove, clear } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const startCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const session = await StartShopCheckoutAsync(
        lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity }))
      );
      // Stripe's URL is server-controlled, but validate the origin anyway so a
      // tampered response cannot turn this into an open redirect.
      const checkout = new URL(session.url);
      if (checkout.protocol !== 'https:' || checkout.hostname !== 'checkout.stripe.com') {
        throw new Error('unexpected checkout URL');
      }
      window.location.assign(checkout.href);
    } catch (error) {
      setCheckoutError(checkoutErrorMessage(error));
      setIsCheckingOut(false);
    }
  };

  if (lines.length === 0) {
    return (
      <main className={styles.page}>
        <h1>Cart</h1>
        <p className={styles.statusText}>Your cart is empty.</p>
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.Shop}>
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const currency = lines[0].currency || 'usd';

  return (
    <main className={styles.page}>
      <div className={styles.adminActions}>
        <Link className={styles.textLink} to={PAGES.Shop}>
          Back to shop
        </Link>
      </div>

      <h1>Cart</h1>

      <ul className={styles.cartList}>
        {lines.map((line) => (
          <li key={line.itemId} className={styles.cartRow}>
            {line.primaryImageUrl ? (
              <img
                className={styles.cartThumb}
                src={line.primaryImageUrl}
                alt=""
              />
            ) : (
              <span className={styles.cartThumbPlaceholder} />
            )}
            <div className={styles.cartInfo}>
              <Link
                className={styles.textLink}
                to={`${PAGES.ShopItem}/${line.itemId}`}
              >
                {line.title}
              </Link>
              <p className={styles.cardMeta}>
                {formatPrice(line.priceCents, line.currency)} each
              </p>
            </div>
            <p className={styles.cartLineTotal}>
              {formatPrice(line.priceCents * line.quantity, line.currency)}
            </p>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => remove(line.itemId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.cartSummary}>
        <p className={styles.cartSubtotal}>
          Subtotal ({count}) {formatPrice(subtotalCents, currency)}
        </p>
        <p className={styles.cardMeta}>
          Shipping and tax are calculated at checkout.
        </p>
        <button
          type="button"
          className={styles.buyButton}
          onClick={startCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Redirecting...' : 'Checkout'}
        </button>
        {checkoutError && (
          <p className={styles.errorNotice}>{checkoutError}</p>
        )}
        <button type="button" className={styles.deleteButton} onClick={clear}>
          Clear cart
        </button>
      </div>
    </main>
  );
}
