import React from "react";
import "../css/NavBar.css";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {/* <li><a href="#about">About</a></li> */}
        <li>
          <Link to="connexion">Connexion</Link>
        </li>
        {/* <li><a href="#contact">Contact</a></li> */}
      </ul>
    </nav>
  );
};

export default NavBar;
