import React from "react";
import "../css/NavBar.css";
import { Link } from "react-router-dom";

interface props {
  title: string;
}

function NavBar(props: props): React.JSX.Element {
  return (
    <nav>
      <header className="topbar">
        <div className="topbar-title">{props.title}</div>
        <div className="topbar-actions">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Home Sync
            </span>
            <li>
              <Link to="/inscription">Inscription</Link>
            </li>
            <li>
              <Link to="/connexion">Connexion</Link>
            </li>
          </ul>
        </div>
      </header>
    </nav>
  );
}

export default NavBar;
