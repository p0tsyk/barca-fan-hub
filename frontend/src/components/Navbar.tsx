import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/squad", label: "Squad" },
  { to: "/builder", label: "Builder" },
  { to: "/tribune", label: "Tribune" },
  { to: "/shop", label: "Shop" },
  { to: "/my-lineups", label: "Мои составы" },
];

export default function Navbar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <span className="logo">Barça Fan Hub</span>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {username ? (
          <>
            <span className="muted">{username}</span>
            <button className="btn" style={{ padding: "6px 12px" }}
              onClick={() => { logout(); navigate("/"); }}>
              Выйти
            </button>
          </>
        ) : (
          <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
            Вход
          </NavLink>
        )}
      </div>
    </header>
  );
}