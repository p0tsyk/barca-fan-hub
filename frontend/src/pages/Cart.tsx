import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useCart } from "../cart";

type Region = { id: number; region: string; base_price: number };

export default function Cart() {
  const { items, setQty, remove, clear, subtotal } = useCart();
  const { username } = useAuth();
  const navigate = useNavigate();
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/delivery-regions").then((r) => r.json()).then((list) => {
      setRegions(list);
      if (list.length) setRegionId(list[0].id);
    });
  }, []);

  const delivery = regions.find((r) => r.id === regionId)?.base_price ?? 0;
  const total = subtotal + delivery;

  const checkout = async () => {
    if (!username) {
      navigate("/login");
      return;
    }
    const token = localStorage.getItem("token");
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        delivery_region_id: regionId,
        items: items.map((i) => ({ variant_id: i.variantId, quantity: i.qty })),
      }),
    });
    const d = await r.json();
    if (!r.ok) {
      setNotice(d.error ?? "Ошибка оформления заказа");
      return;
    }
    clear();
    setNotice(`Заказ оформлен! Трек-номер: ${d.tracking_number}. Итого: ${d.total_price.toFixed(2)} €`);
  };

  return (
    <>
      <h1>Корзина</h1>
      {notice && <p style={{ color: "#12B76A" }}>{notice}</p>}
      {items.length === 0 && !notice && <p className="muted">Корзина пуста. Загляни в Shop.</p>}
      {items.map((i) => (
        <article key={i.variantId} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <strong>{i.name}</strong>
            <p className="muted" style={{ margin: "2px 0 0" }}>Размер {i.size} · {i.price.toFixed(2)} €</p>
          </div>
          <button className="btn" style={{ background: "#667085", padding: "4px 10px" }}
            onClick={() => setQty(i.variantId, i.qty - 1)}>−</button>
          <span style={{ minWidth: 24, textAlign: "center" }}>{i.qty}</span>
          <button className="btn" style={{ background: "#667085", padding: "4px 10px" }}
            onClick={() => setQty(i.variantId, i.qty + 1)}>+</button>
          <button className="btn" style={{ background: "#F04438", padding: "4px 10px" }}
            onClick={() => remove(i.variantId)}>✕</button>
        </article>
      ))}
      {items.length > 0 && (
        <div className="card" style={{ maxWidth: 420 }}>
          <p style={{ margin: "0 0 8px" }}>Товары: <strong>{subtotal.toFixed(2)} €</strong></p>
          <select className="input" value={regionId} onChange={(e) => setRegionId(Number(e.target.value))}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.region} — доставка {r.base_price.toFixed(2)} €</option>
            ))}
          </select>
          <p style={{ margin: "8px 0" }}>Итого: <strong>{total.toFixed(2)} €</strong></p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={checkout}>Оформить заказ</button>
            <button className="btn" style={{ background: "#667085" }} onClick={clear}>Очистить</button>
          </div>
        </div>
      )}
    </>
  );
}