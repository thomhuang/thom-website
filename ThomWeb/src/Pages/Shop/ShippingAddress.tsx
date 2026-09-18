import { ShopOrder } from '../../api/Shop/ShopRouter';
import styles from './Shop.module.css';

// Renders the structured shipping address Checkout collects. Falls back to the
// legacy formatted string for orders placed before the structured columns.
export default function ShippingAddress({ order }: { order: ShopOrder }) {
  if (order.shipLine1) {
    const region = [order.shipCity, order.shipState, order.shipPostalCode]
      .filter(Boolean)
      .join(', ');

    return (
      <p className={styles.cardMeta}>
        {order.shipName && (
          <>
            {order.shipName}
            <br />
          </>
        )}
        {order.shipLine1}
        {order.shipLine2 ? `, ${order.shipLine2}` : ''}
        <br />
        {region}
        {order.shipCountry && (
          <>
            <br />
            {order.shipCountry}
          </>
        )}
      </p>
    );
  }

  if (order.shippingAddress) {
    return <p className={styles.cardMeta}>{order.shippingAddress}</p>;
  }

  return null;
}
