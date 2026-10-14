import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

type Player = {
  id: number;
  shirt_number: number;
  name: string;
  position_group: string;
  positions: string[];
  nationality: string;
  status: string;
};

type Slot = { key: string; groups: string[]; x: number; y: number };

const FORMATIONS: Record<string, Slot[]> = {
  "4-3-3": [
    { key: "GK", groups: ["GK"], x: 50, y: 90 },
    { key: "LB", groups: ["DEF"], x: 14, y: 72 },
    { key: "CB1", groups: ["DEF"], x: 37, y: 78 },
    { key: "CB2", groups: ["DEF"], x: 63, y: 78 },
    { key: "RB", groups: ["DEF"], x: 86, y: 72 },
    { key: "CM1", groups: ["MID"], x: 30, y: 52 },
    { key: "CM2", groups: ["MID"], x: 50, y: 46 },
    { key: "CM3", groups: ["MID"], x: 70, y: 52 },
    { key: "LW", groups: ["FWD"], x: 20, y: 24 },
    { key: "ST", groups: ["FWD"], x: 50, y: 18 },
    { key: "RW", groups: ["FWD"], x: 80, y: 24 },
  ],
  "4-4-2": [
    { key: "GK", groups: ["GK"], x: 50, y: 90 },
    { key: "LB", groups: ["DEF"], x: 14, y: 72 },
    { key: "CB1", groups: ["DEF"], x: 37, y: 78 },
    { key: "CB2", groups: ["DEF"], x: 63, y: 78 },
    { key: "RB", groups: ["DEF"], x: 86, y: 72 },
    { key: "LM", groups: ["MID"], x: 18, y: 48 },
    { key: "CM1", groups: ["MID"], x: 40, y: 52 },
    { key: "CM2", groups: ["MID"], x: 60, y: 52 },
    { key: "RM", groups: ["MID"], x: 82, y: 48 },
    { key: "ST1", groups: ["FWD"], x: 40, y: 20 },
    { key: "ST2", groups: ["FWD"], x: 60, y: 20 },
  ],
  "3-5-2": [
    { key: "GK", groups: ["GK"], x: 50, y: 90 },
    { key: "CB1", groups: ["DEF"], x: 30, y: 78 },
    { key: "CB2", groups: ["DEF"], x: 50, y: 80 },
    { key: "CB3", groups: ["DEF"], x: 70, y: 78 },
    { key: "LWB", groups: ["DEF", "MID"], x: 12, y: 52 },
    { key: "CM1", groups: ["MID"], x: 35, y: 50 },
    { key: "CM2", groups: ["MID"], x: 50, y: 44 },
    { key: "CM3", groups: ["MID"], x: 65, y: 50 },
    { key: "RWB", groups: ["DEF", "MID"], x: 88, y: 52 },
    { key: "ST1", groups: ["FWD"], x: 40, y: 20 },
    { key: "ST2", groups: ["FWD"], x: 60, y: 20 },
  ],
};

export default function Builder() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [formation, setFormation] = useState("4-3-3");
  const [assign, setAssign] = useState<Record<string, number | null>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/players").then((r) => r.json()).then(setPlayers);
  }, []);

  const slots = FORMATIONS[formation];

  const assignedIds = useMemo(
    () => Object.values(assign).filter((v): v is number => v !== null),
    [assign],
  );

  const bench = players.filter(
    (p) => p.status === "available" && !assignedIds.includes(p.id),
  );

  const place = (slot: Slot, playerId: number) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    if (!slot.groups.includes(player.position_group)) {
      setNotice(`${player.name}: амплуа ${player.position_group} не подходит слоту ${slot.key}`);
      return;
    }
    setAssign((prev) => {
      const next = { ...prev };
      for (const s of slots) if (next[s.key] === playerId) next[s.key] = null;
      next[slot.key] = playerId;
      return next;
    });
    setSelected(null);
    setNotice(null);
  };

  const save = async () => {
  if (!username) {
    navigate("/login");
    return;
  }
  if (assignedIds.length !== 11) {
    setNotice("Расставь всех 11 игроков, чтобы сохранить");
    return;
  }
  const token = localStorage.getItem("token");
  const r = await fetch("/api/lineups", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ formation, title: `Мой ${formation}`, slots: assign }),
  });
  if (!r.ok) {
    const d = await r.json();
    setNotice(d.error ?? "Ошибка сохранения");
    return;
  }
  setNotice("Состав сохранён на сервере!");
};

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Lineup Builder</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select className="input" value={formation}
            onChange={(e) => { setFormation(e.target.value); setAssign({}); }}>
            {Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}
          </select>
          <button className="btn" style={{ background: "#667085" }} onClick={() => setAssign({})}>
          </button>
          <button className="btn" onClick={save}>Сохранить</button>
        </div>
      </div>
      <p className="muted">
        На поле {assignedIds.length}/11 · Тяни игроков мышкой или кликни игрока → кликни слот.
        Клик по поставленному игроку возвращает его на скамейку.
      </p>
      {notice && <p style={{ color: "#F79009" }}>{notice}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div className="pitch">
          {slots.map((s) => {
            const pid = assign[s.key] ?? null;
            const p = players.find((pl) => pl.id === pid);
            return (
              <div
                key={s.key}
                className={"slot" + (p ? "" : " empty")}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  place(s, Number(e.dataTransfer.getData("text/plain")));
                }}
                onClick={() => {
                  if (pid) setAssign((prev) => ({ ...prev, [s.key]: null }));
                  else if (selected) place(s, selected);
                }}
              >
                <div className="circle">{p ? p.shirt_number : "+"}</div>
                <div className="label">{p ? p.name : s.key}</div>
              </div>
            );
          })}
        </div>
        <aside>
          <h3 style={{ marginTop: 0 }}>Скамейка ({bench.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto" }}>
            {bench.map((p) => (
              <div
                key={p.id}
                className={"bench-item" + (selected === p.id ? " selected" : "")}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(p.id))}
                onClick={() => setSelected(selected === p.id ? null : p.id)}
              >
                <strong>#{p.shirt_number}</strong>
                <span>{p.name}</span>
                <span className="muted" style={{ marginLeft: "auto" }}>{p.position_group}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}