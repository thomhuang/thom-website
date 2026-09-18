import type { ShopImage } from '../../api/Shop/ShopRouter';

export const formatPrice = (priceCents: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(priceCents / 100);

// Prices are stored in cents, so parse the dollar input without floating point
// drift before sending it back.
export const parsePriceToCents = (value: string): number | null => {
  const trimmed = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }

  const [whole, fraction = ''] = trimmed.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  return Number.isSafeInteger(cents) ? cents : null;
};

export const formatPriceInput = (priceCents: number) =>
  (priceCents / 100).toFixed(2);

export const getPrimaryImage = (images: ShopImage[]) =>
  images.length > 0 ? images[0].url : '';
