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
  setCartLineQuantity,
} from './cartState';

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (line: CartLine) => void;
  setQuantity: (itemId: string, quantity: number) => void;
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

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setLines((current) => setCartLineQuantity(current, itemId, quantity));
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
      setQuantity,
      remove,
      clear,
    }),
    [lines, add, setQuantity, remove, clear]
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
