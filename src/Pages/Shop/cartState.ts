// Cart state is pure data plus a thin localStorage bridge, so the quantity and
// subtotal math is testable without rendering. The price, title, and stock are
// snapshotted when an item is added; the server re-reads prices at checkout, so
// a stale snapshot never changes what the buyer is charged.

export interface CartLine {
  itemId: string;
  title: string;
  priceCents: number;
  currency: string;
  stock: number;
  primaryImageUrl: string;
  quantity: number;
}

export const cartStorageKey = 'shop-cart';

const isCartLine = (value: unknown): value is CartLine => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const line = value as Record<string, unknown>;
  return (
    typeof line.itemId === 'string' &&
    typeof line.title === 'string' &&
    typeof line.priceCents === 'number' &&
    typeof line.currency === 'string' &&
    typeof line.stock === 'number' &&
    typeof line.primaryImageUrl === 'string' &&
    typeof line.quantity === 'number'
  );
};

export function loadCart(): CartLine[] {
  try {
    const stored = localStorage.getItem(cartStorageKey);
    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]): void {
  localStorage.setItem(cartStorageKey, JSON.stringify(lines));
}

export function addCartLine(lines: CartLine[], line: CartLine): CartLine[] {
  const existing = lines.find((current) => current.itemId === line.itemId);

  if (!existing) {
    return [...lines, { ...line, quantity: clampQuantity(line.quantity, line.stock) }];
  }

  return lines.map((current) =>
    current.itemId === line.itemId
      ? {
          ...current,
          quantity: clampQuantity(current.quantity + line.quantity, current.stock),
        }
      : current
  );
}

export function removeCartLine(lines: CartLine[], itemId: string): CartLine[] {
  return lines.filter((line) => line.itemId !== itemId);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartSubtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

function clampQuantity(quantity: number, stock: number): number {
  const whole = Number.isFinite(quantity) ? Math.trunc(quantity) : 1;
  return Math.max(1, Math.min(whole, Math.max(stock, 1)));
}
