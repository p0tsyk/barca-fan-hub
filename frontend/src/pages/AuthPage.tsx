import { useState } from "react";
import type { FormEvent } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err = mode === "login"
      ? await login(email, password)
      : await register(username, email, password);
    if (err) setError(err);
    else navigate("/");
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>{mode === "login" ? "Вход" : "Регистрация"}</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mode === "register" && (
          <input className="input" placeholder="Никнейм" value={username}
            onChange={(e) => setUsername(e.target.value)} required />
        )}
        <input className="input" type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Пароль (от 6 символов)"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: "#F04438", margin: 0 }}>{error}</p>}
        <button className="btn" type="submit">
          {mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>
        {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "login" ? "register" : "login"); }}>
          {mode === "login" ? "Регистрация" : "Вход"}
        </a>
      </p>
      {mode === "login" && <p className="muted">Демо-вход: fan@fanhub.dev / fan123</p>}
    </div>
  );
}