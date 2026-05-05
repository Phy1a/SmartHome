import React from "react";
import "../css/index.css";
import "../css/NavBar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface props {
  title: string;
}

function NavBar(props: props): React.JSX.Element {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  return (
    <nav>
      <header className="topbar">
        <span>Home Sync</span>
        <div className="topbar-title">{props.title}</div>
        <div className="topbar-actions">
          <Link to="/">Home</Link>

          <Link to="/inscription">Inscription</Link>

          <Link to="/connexion">Connexion</Link>

          <button
            onClick={() => navigate("/profile")}
            className="user-avatar btn btn-sm"
            style={{
              fontSize: 18,
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </button>
        </div>
      </header>
    </nav>
  );
}

export default NavBar;
