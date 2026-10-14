import { useEffect, useState } from "react";

type Player = {
  id: number; shirt_number: number; name: string; position_group: string;
  positions: string[]; nationality: string; status: string;
};

const STATUS: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "#12B76A" },
  injured: { label: "Injured", color: "#F04438" },
  doubtful: { label: "Doubtful", color: "#EAAA08" },
  suspended: { label: "Suspended", color: "#F79009" },
};

export default function Squad() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch("/api/players").then((r) => r.json()).then(setPlayers);
  }, []);

  return (
    <>
      <h1>Squad</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {players.map((p) => (
          <article key={p.id} className="card" style={{ margin: 0 }}>
            <strong>#{p.shirt_number} {p.name}</strong>
            <p className="muted" style={{ margin: "6px 0" }}>
              {p.position_group} · {p.positions.join(", ")} · {p.nationality}
            </p>
            <span className="badge" style={{ background: STATUS[p.status]?.color ?? "#667085" }}>
              {STATUS[p.status]?.label ?? p.status}
            </span>
          </article>
        ))}
      </div>
    </>
  );
}