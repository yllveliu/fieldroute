import React from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

export default function Navbar(): React.ReactElement {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          FieldRoute
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/customer">Customer</Link>
          </li>
          <li>
            <Link to="/dispatcher">Dispatcher</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
