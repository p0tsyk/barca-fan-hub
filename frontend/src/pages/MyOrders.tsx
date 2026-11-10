import { useEffect, useState } from "react";
import { useAuth } from "../auth";

type OrderItem = { product: string | null; size: string | null; quantity: number; price: number };
type Order = {
  id: number; status: string; tracking_number: string | null;
  delivery_price: number; total_price: number; created_at: string;
  region: string | null; items: OrderItem[];
};

export default function MyOrders() {
  const { username } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  if (!username) return <p className="muted">Войди, чтобы увидеть свои заказы.</p>;

  return (
    <>
      <h1>Мои заказы</h1>
      {orders.length === 0 && <p className="muted">Заказов пока нет.</p>}
      {orders.map((o) => (
        <article key={o.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Заказ {o.tracking_number ?? `#${o.id}`}</strong>
            <span className="badge" style={{ background: o.status === "created" ? "#2E90FA" : "#12B76A" }}>
              {o.status}
            </span>
          </div>
          <p className="muted" style={{ margin: "6px 0" }}>
            {new Date(o.created_at).toLocaleString("ru-RU")} · {o.region ?? "без доставки"}
          </p>
          {o.items.map((it, idx) => (
            <p key={idx} style={{ margin: "2px 0" }}>
              {it.quantity} × {it.product} (размер {it.size}) — {(it.quantity * it.price).toFixed(2)} €
            </p>
          ))}
          <p style={{ margin: "8px 0 0" }}>
            Итого с доставкой: <strong>{o.total_price.toFixed(2)} €</strong>
          </p>
        </article>
      ))}
    </>
  );
}