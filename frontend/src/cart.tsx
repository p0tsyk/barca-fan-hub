import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartItem = {
  variantId: number; productId: number; name: string;
  size: string; price: number; qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (item: Omit<CartItem, "qty">, qty = 1) =>
    setItems((prev) => {
      const ex = prev.find((i) => i.variantId === item.variantId);
      if (ex) return prev.map((i) => (i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...item, qty }];
    });

  const setQty = (variantId: number, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
    );

  const remove = (variantId: number) =>
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart вне CartProvider");
  return ctx;
}