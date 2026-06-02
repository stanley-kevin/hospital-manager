import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [faqMenuOpen, setFaqMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close the FAQ dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setFaqMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await signOut(auth);
            navigate('/login');
        }
    };

    return (
        <>
            <header className="site-header">
                <div className="container nav">
                    {/* Brand / Logo */}
                    <div className="brand" onClick={() => navigate(user ? '/' : '/login')} style={{ cursor: 'pointer' }}>
                        🏥 Hospital Management
                    </div>

                    {/* Desktop & Mobile Main Navigation (Only visible if logged in) */}
                    {user && (
                        <nav className="nav-menu">
                            <div className="nav-links">
                                <NavLink to="/" end>Home</NavLink>
                                <NavLink to="/doctors">Doctors</NavLink>
                                <NavLink to="/appointments">Appointments</NavLink>
                                <NavLink to="/about">About Us</NavLink>
                                <NavLink to="/contact">Contact Us</NavLink>
                                {user?.role === 'admin' && (
                                    <NavLink to="/admin">Admin Panel</NavLink>
                                )}
                            </div>
                        </nav>
                    )}

                    {/* Right-aligned Navigation Actions */}
                    <div className="nav-actions">
                        {/* Login/Logout Button */}
                        {user ? (
                            <button className="btn-logout-nav" onClick={handleLogout}>
                                Logout
                            </button>
                        ) : (
                            <button className="btn-login-nav" onClick={() => navigate('/login')}>
                                Login
                            </button>
                        )}

                        {/* Help & Agreements Hamburger Menu */}
                        <div className="hamburger-container" ref={dropdownRef}>
                            <button
                                className={`hamburger-toggle${faqMenuOpen ? ' active' : ''}`}
                                onClick={() => setFaqMenuOpen((o) => !o)}
                                aria-label="Toggle Navigation Menu"
                                aria-expanded={faqMenuOpen}
                            >
                                <span className="bar"></span>
                                <span className="bar"></span>
                                <span className="bar"></span>
                            </button>

                            {/* Dropdown / Sidebar containing FAQ, Terms, and Privacy */}
                            {faqMenuOpen && (
                                <>
                                    {/* Backdrop Overlay for mobile slide-out drawer */}
                                    <div className="hamburger-overlay" onClick={() => setFaqMenuOpen(false)} />
                                    
                                    <div className="hamburger-dropdown show">
                                        <div className="dropdown-header">
                                            <span>Help & Support</span>
                                        </div>
                                        
                                        {/* FAQ (Authenticated only) */}
                                        {user && (
                                            <NavLink 
                                                to="/faq" 
                                                className="dropdown-item faq-item-link"
                                                onClick={() => setFaqMenuOpen(false)}
                                            >
                                                <span className="dropdown-icon faq-menu-icon">❓</span>
                                                <div className="dropdown-desc-wrap">
                                                    <span className="dropdown-item-title">FAQ</span>
                                                    <span className="dropdown-item-subtitle">Frequently Asked Questions</span>
                                                </div>
                                            </NavLink>
                                        )}

                                        {/* Terms & Conditions (Public) */}
                                        <NavLink 
                                            to="/terms" 
                                            className="dropdown-item terms-item-link"
                                            onClick={() => setFaqMenuOpen(false)}
                                        >
                                            <span className="dropdown-icon terms-menu-icon">📄</span>
                                            <div className="dropdown-desc-wrap">
                                                <span className="dropdown-item-title">Terms & Conditions</span>
                                                <span className="dropdown-item-subtitle">Rules & Agreement</span>
                                            </div>
                                        </NavLink>

                                        {/* Privacy Policy (Public) */}
                                        <NavLink 
                                            to="/privacy" 
                                            className="dropdown-item privacy-item-link"
                                            onClick={() => setFaqMenuOpen(false)}
                                        >
                                            <span className="dropdown-icon privacy-menu-icon">🔒</span>
                                            <div className="dropdown-desc-wrap">
                                                <span className="dropdown-item-title">Privacy Policy</span>
                                                <span className="dropdown-item-subtitle">Security & Data Usage</span>
                                            </div>
                                        </NavLink>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
