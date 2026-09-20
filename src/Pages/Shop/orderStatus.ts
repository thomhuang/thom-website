import type { ShopOrderStatus } from '../../api/Shop/ShopRouter';
import styles from './Shop.module.css';

export const getOrderStatusClass = (status: ShopOrderStatus) => {
  switch (status) {
    case 'paid':
      return styles.statusPaid;
    case 'refunded':
      return styles.statusRefunded;
    case 'refund_pending':
      return styles.statusRefundPending;
    case 'expired':
      return styles.statusExpired;
    default:
      return styles.statusPending;
  }
};

export const formatOrderStatus = (status: ShopOrderStatus) =>
  status.replace('_', ' ');

type OrderStatusCopy = {
  title: string;
  message: string;
};

// Buyer-facing wording for the confirmation page.
export const getOrderStatusCopy = (
  status: ShopOrderStatus
): OrderStatusCopy => {
  switch (status) {
    case 'refunded':
      return {
        title: 'Order refunded',
        message: 'This order could not be fulfilled and has been refunded.',
      };
    case 'refund_pending':
      return {
        title: 'Order being refunded',
        message: 'This order could not be fulfilled and is being refunded.',
      };
    case 'paid':
      return {
        title: 'Thank you',
        message: 'Payment received. Your order is confirmed.',
      };
    case 'expired':
      return {
        title: 'Checkout expired',
        message:
          'This checkout expired before payment. Feel free to try again.',
      };
    default:
      return {
        title: 'Order received',
        message:
          'Payment is still being confirmed. This page updates automatically.',
      };
  }
};
