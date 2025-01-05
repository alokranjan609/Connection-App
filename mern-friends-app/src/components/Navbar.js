import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";



const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Friend Finder</div>
      <div className="navbar-links">
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;
