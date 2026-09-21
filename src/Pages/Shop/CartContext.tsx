import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  addCartLine,
  CartLine,
  cartCount,
  cartSubtotalCents,
  loadCart,
  removeCartLine,
  saveCart,
} from './cartState';

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (line: CartLine) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

type CartProviderProps = {
  children: ReactNode;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: CartProviderProps) {
  const [lines, setLines] = useState<CartLine[]>(loadCart);

  useEffect(() => {
    saveCart(lines);
  }, [lines]);

  const add = useCallback((line: CartLine) => {
    setLines((current) => addCartLine(current, line));
  }, []);

  const remove = useCallback((itemId: string) => {
    setLines((current) => removeCartLine(current, itemId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  const value = useMemo(
    () => ({
      lines,
      count: cartCount(lines),
      subtotalCents: cartSubtotalCents(lines),
      add,
      remove,
      clear,
    }),
    [lines, add, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
