import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await signOut(auth);
            navigate('/login');
        }
    };

    const close = () => setMenuOpen(false);

    return (
        <header className="site-header">
            <div className="container nav">
                <div className="brand">🏥 Hospital Management</div>
                <button
                    className="menu-toggle"
                    aria-label="Toggle navigation"
                    onClick={() => setMenuOpen((o) => !o)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
                <nav className={`menu${menuOpen ? ' open' : ''}`}>
                    <NavLink to="/" end onClick={close}>Home</NavLink>
                    <NavLink to="/doctors" onClick={close}>Doctors</NavLink>
                    <NavLink to="/appointments" onClick={close}>Appointments</NavLink>
                    <NavLink to="/about" onClick={close}>About Us</NavLink>
                    <NavLink to="/faq" onClick={close}>FAQ</NavLink>
                    <NavLink to="/contact" onClick={close}>Contact Us</NavLink>
                    {user?.role === 'admin' && (
                        <NavLink to="/admin" onClick={close}>Admin Panel</NavLink>
                    )}
                    <button className="btn ghost nav-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
}
