import { useEffect, useState } from "react";
import { useCart } from "../cart";

type Variant = { id: number; size: string; stock: number };
type Product = {
  id: number; name: string; description: string | null; price: number;
  category: string; is_available: boolean; variants: Variant[];
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Record<number, number>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const { add } = useCart();

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const pick = (p: Product) => {
    const variantId = sizes[p.id] ?? p.variants.find((v) => v.stock > 0)?.id;
    const v = p.variants.find((x) => x.id === variantId);
    if (!v || v.stock === 0) {
      setNotice(`${p.name}: нет размера в наличии`);
      return;
    }
    add({ variantId: v.id, productId: p.id, name: p.name, size: v.size, price: p.price });
    setNotice(`${p.name} (размер ${v.size}) — в корзине`);
  };

  return (
    <>
      <h1>Fan Shop</h1>
      {notice && <p style={{ color: "#12B76A" }}>{notice}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {products.map((p) => {
          const selected = sizes[p.id] ?? p.variants.find((v) => v.stock > 0)?.id ?? "";
          return (
            <article key={p.id} className="card" style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <strong>{p.name}</strong>
              <p className="muted" style={{ margin: 0 }}>{p.description}</p>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#A50044" }}>{p.price.toFixed(2)} €</div>
              <select className="input" value={selected}
                onChange={(e) => setSizes((s) => ({ ...s, [p.id]: Number(e.target.value) }))}>
                {p.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock === 0}>
                    Размер {v.size} — {v.stock > 0 ? `в наличии: ${v.stock}` : "нет в наличии"}
                  </option>
                ))}
              </select>
              <button className="btn" onClick={() => pick(p)}>В корзину</button>
            </article>
          );
        })}
      </div>
    </>
  );
}