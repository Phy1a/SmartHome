import React from "react";
import "../css/index.css";
import "../css/NavBar.css";
import { Link } from "react-router-dom";

interface props {
  title: string;
}

function NavBar(props: props): React.JSX.Element {
  return (
    <nav>
      <header className="topbar">
        <span>Home Sync</span>
        <div className="topbar-title">{props.title}</div>
        <div className="topbar-actions">
          <Link to="/">Home</Link>

          <Link to="/inscription">Inscription</Link>

          <Link to="/connexion">Connexion</Link>
        </div>
      </header>
    </nav>
  );
}

export default NavBar;
