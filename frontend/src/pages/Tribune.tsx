import { useEffect, useState } from "react";
import { useAuth } from "../auth";

type Comment = { id: number; content: string; created_at: string; author: string };
type Post = { id: number; title: string; content: string; post_type: string; source: any };

export default function Tribune() {
  const { username, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts);
  }, []);

  const loadComments = async (postId: number) => {
    if (comments[postId] || loadingComments[postId]) return;
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    
    const r = await fetch(`/api/posts/${postId}/comments`);
    const data = await r.json();
    
    setComments((prev) => ({ ...prev, [postId]: data }));
    setLoadingComments((prev) => ({ ...prev, [postId]: false }));
  };

  const submitComment = async (postId: number) => {
    if (!username) {
      alert("Войдите в систему, чтобы комментировать");
      return;
    }
    const text = newComment[postId]?.trim();
    if (!text) return;

    const r = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: text }),
    });

    if (r.ok) {
      const added = await r.json();
      setComments((prev) => ({
        ...prev,
        [postId]: [added, ...(prev[postId] || [])],
      }));
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } else {
      const err = await r.json();
      alert(err.error || "Ошибка отправки");
    }
  };

  return (
    <>
      <h1>Tribune</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Обсуждаем последние новости, инсайды и составы. {!username && "Войдите, чтобы участвовать в дискуссии."}
      </p>
      
      {posts.map((p) => (
        <article key={p.id} className="card">
          <h3 style={{ margin: "0 0 8px" }}>{p.title}</h3>
          <p className="muted" style={{ margin: "0 0 16px" }}>{p.content}</p>
          
          <div style={{ borderTop: "1px solid #E4E7EC", paddingTop: 16 }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 16 }}>Комментарии</h4>
            
            {!comments[p.id] && !loadingComments[p.id] && (
              <button 
                className="btn" 
                style={{ padding: "6px 12px", fontSize: 13, background: "#667085" }} 
                onClick={() => loadComments(p.id)}
              >
                Показать комментарии
              </button>
            )}
            
            {loadingComments[p.id] && <p className="muted">Загрузка...</p>}
            
            {comments[p.id] && (
              <div style={{ marginBottom: 16 }}>
                {comments[p.id].length === 0 && (
                  <p className="muted" style={{ fontSize: 14 }}>Пока нет комментариев. Будьте первым!</p>
                )}
                {comments[p.id].map((c) => (
                  <div key={c.id} style={{ marginBottom: 10, padding: 10, background: "#F9FAFB", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: 13, color: "#A50044" }}>{c.author}</strong>
                      <span className="muted" style={{ fontSize: 11 }}>
                        {new Date(c.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 14, color: "#344054" }}>{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder={username ? "Написать комментарий..." : "Войдите, чтобы комментировать"}
                value={newComment[p.id] || ""}
                onChange={(e) => setNewComment((prev) => ({ ...prev, [p.id]: e.target.value }))}
                disabled={!username}
                onKeyDown={(e) => e.key === "Enter" && submitComment(p.id)}
              />
              <button
                className="btn"
                onClick={() => submitComment(p.id)}
                disabled={!username || !(newComment[p.id]?.trim())}
              >
                Отправить
              </button>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}