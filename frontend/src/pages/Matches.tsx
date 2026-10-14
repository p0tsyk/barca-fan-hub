import { useEffect, useState } from "react";

type Match = {
  id: number; competition: string; home_team: string; away_team: string;
  kickoff_at: string; status: string; home_score: number | null;
  away_score: number | null; stadium: string;
};

const STATUS: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Upcoming", color: "#004D98" },
  live: { label: "LIVE", color: "#F04438" },
  finished: { label: "Finished", color: "#667085" },
};

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch("/api/matches").then((r) => r.json()).then(setMatches);
  }, []);

  return (
    <>
      <h1>Match Center</h1>
      {matches.map((m) => (
        <article key={m.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <strong>{m.home_team} — {m.away_team}</strong>
            <span className="badge" style={{ background: STATUS[m.status]?.color ?? "#667085" }}>
              {STATUS[m.status]?.label ?? m.status}
            </span>
          </div>
          <p className="muted" style={{ margin: "8px 0 0" }}>
            {m.competition} ·{" "}
            {new Date(m.kickoff_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}{" "}
            · {m.stadium}
            {m.home_score !== null && <strong> · {m.home_score}:{m.away_score}</strong>}
          </p>
        </article>
      ))}
    </>
  );
}