import React from "react";
import "../css/NavBar.css";
import { Link } from "react-router-dom";

function NavBar(): React.JSX.Element {
  return (
    <nav>
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
    </nav>
  );
}

export default NavBar;
