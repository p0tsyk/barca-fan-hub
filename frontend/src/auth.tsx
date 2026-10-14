import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AuthState = {
  token: string | null;
  username: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (u: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));

  const login = async (email: string, password: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) return data.error ?? "Ошибка входа";
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    setToken(data.token);
    setUsername(data.username);
    return null;
  };

  const register = async (u: string, email: string, password: string) => {
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, email, password }),
    });
    const data = await r.json();
    if (!r.ok) return data.error ?? "Ошибка регистрации";
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth вне AuthProvider");
  return ctx;
}