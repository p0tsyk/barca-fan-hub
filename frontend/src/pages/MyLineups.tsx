import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";

type Lineup = {
  id: number; title: string; formation: string;
  created_at: string; author: string;
};

export default function MyLineups() {
  const { username } = useAuth();
  const [list, setList] = useState<Lineup[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/lineups", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setList);
  }, []);

  const del = async (id: number) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/lineups/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setList((prev) => prev.filter((l) => l.id !== id));
  };

  if (!username) return <p className="muted">Войди, чтобы увидеть свои составы.</p>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Мои составы</h1>
        <Link to="/builder" className="btn">Создать новый</Link>
      </div>
      {list.length === 0 && <p className="muted">Пока нет сохранённых составов.</p>}
      {list.map((l) => (
        <article key={l.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>{l.title}</strong>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              {l.formation} · {new Date(l.created_at).toLocaleString("ru-RU")}
            </p>
          </div>
          <button className="btn" style={{ background: "#F04438" }} onClick={() => del(l.id)}>
            Удалить
          </button>
        </article>
      ))}
    </>
  );
}