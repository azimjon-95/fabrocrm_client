import React from 'react';
import { Link } from 'react-router-dom';
import './style.css'; // Stil fayli (agar kerak bo'lsa)

function Navbar() {
    return (
        <div className="navbar">
            <div className="navbar-brand">
                <h1>Mebel Sex Tizimi</h1>
            </div>
            <div className="navbar-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/accountant">Buxgalter</Link>
                <Link to="/manager">Meneger</Link>
                <Link to="/director">Direktor</Link>
            </div>

        </div>
    );
}

export default Navbar;