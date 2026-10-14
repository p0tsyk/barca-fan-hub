import { useEffect, useState } from "react";

type Source = { id: number; name: string; tier: number };
type Post = { id: number; title: string; content: string; post_type: string; source: Source | null };

const TIER_COLORS: Record<number, string> = {
  1: "#12B76A", 2: "#2E90FA", 3: "#EAAA08", 4: "#F79009", 5: "#F04438",
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts);
  }, []);

  return (
    <>
      <h1>Media Pulse</h1>
      {posts.map((p) => (
        <article key={p.id} className="card">
          <h3 style={{ margin: "0 0 8px" }}>{p.title}</h3>
          {p.source && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="badge" style={{ background: TIER_COLORS[p.source.tier] }}>
                Tier {p.source.tier}
              </span>
              <span className="muted">{p.source.name} · {p.post_type}</span>
            </div>
          )}
          <p className="muted" style={{ marginTop: 8 }}>{p.content}</p>
        </article>
      ))}
    </>
  );
}