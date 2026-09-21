import axios from 'axios';

import type { ShopCheckoutConflict } from '../../api/Shop/ShopRouter';

const GENERIC_MESSAGE = 'Checkout could not be started.';

// checkoutErrorMessage turns a failed checkout into something the buyer can act
// on. A 409 names the item and, when another checkout is only holding it, says
// when it should be free again; every other failure stays generic.
export function checkoutErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return GENERIC_MESSAGE;
  }

  const conflict = error.response.data as Partial<ShopCheckoutConflict> | undefined;
  const title =
    typeof conflict?.title === 'string' && conflict.title
      ? conflict.title
      : 'This item';

  if (typeof conflict?.reservedUntil === 'number' && conflict.reservedUntil > 0) {
    return `${title} is in another checkout right now. Try again after ${formatTime(
      conflict.reservedUntil
    )}.`;
  }

  return `${title} is sold out.`;
}

function formatTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
