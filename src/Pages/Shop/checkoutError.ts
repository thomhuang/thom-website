import axios from 'axios';

import type { ShopCheckoutConflict } from '../../api/Shop/ShopRouter';

const GENERIC_MESSAGE = 'Checkout could not be started.';

// checkoutErrorMessage turns a failed checkout into something the buyer can act
// on. A 409 names the item that ran out; every other failure stays generic.
export function checkoutErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return GENERIC_MESSAGE;
  }

  const conflict = error.response.data as Partial<ShopCheckoutConflict> | undefined;
  const title =
    typeof conflict?.title === 'string' && conflict.title
      ? conflict.title
      : 'This item';

  return `${title} is sold out.`;
}
