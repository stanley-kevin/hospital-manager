import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookingModal from '../components/BookingModal';

function Counter({ end, duration = 1500, suffix = "" }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = end / (duration / 16); // ~60fps
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);

    return <span>{count}{suffix}</span>;
}

export default function Home() {
    const navigate = useNavigate();
    const [bookingOpen, setBookingOpen] = useState(false);

    return (
        <>
            <Navbar />
            <main id="home">
                {/* Hero */}
                <section className="hero">
                    <div className="container hero-grid">
                        <div className="hero-copy">
                            <h1>
                                Book Your <span className="accent">Doctor</span> Appointment{' '}
                                <span className="accent">Online</span>!
                            </h1>
                            <p>Easily schedule your visit with experienced doctors.</p>
                            <div className="hero-cta">
                                <button className="btn primary" onClick={() => setBookingOpen(true)}>
                                    Book Appointment
                                </button>
                                <button className="btn ghost" onClick={() => navigate('/appointments')}>
                                    View My Appointments
                                </button>
                            </div>
                        </div>
                        <div className="hero-ill">
                            <img
                                src="/assets/mernlogo.jpg"
                                alt="Hospital Management System"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Feature Cards */}
                <section className="features container" style={{ paddingBottom: '3rem' }}>
                    <div
                        className="card interactive-card"
                        onClick={() => navigate('/doctors')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="card-icon">
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2b6cb0" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <h3>Search Doctors</h3>
                        <p>Find specialists by department &amp; location.</p>
                    </div>

                    <div
                        className="card interactive-card"
                        onClick={() => navigate('/appointments')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="card-icon">
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2b6cb0" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                        </div>
                        <h3>Manage Appointments</h3>
                        <p>View, reschedule, or cancel your bookings.</p>
                    </div>
                </section>

                {/* Section 1: Why Choose Us */}
                <section className="why-choose-us" style={{ padding: '5rem 0', background: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <div className="container">
                        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem', color: 'var(--text)' }}>Why Choose Us</h2>
                        <p style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            We provide outstanding healthcare services with qualified staff, state-of-the-art facilities, and 24/7 dedicated support.
                        </p>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {[
                                { icon: '👨‍⚕️', title: 'Experienced Doctors', desc: 'Our clinic hosts highly qualified specialists across multiple healthcare departments.' },
                                { icon: '💻', title: 'Easy Online Booking', desc: 'Book, reschedule, or cancel your doctor visits from the comfort of your home.' },
                                { icon: '🔒', title: 'Secure Patient Data', desc: 'Your personal records and medical histories are protected with high-level encryption.' },
                                { icon: '🚨', title: '24/7 Emergency Support', desc: 'Immediate medical assistance and helpline always active for any healthcare emergency.' },
                                { icon: '⚡', title: 'Fast Appointment Management', desc: 'Instant confirmation and synchronization between patient and doctor schedules.' },
                                { icon: '🤝', title: 'Trusted Healthcare Services', desc: 'Dedicated to providing top-quality clinical care and ensuring maximum patient safety.' }
                            ].map((item, idx) => (
                                <div key={idx} className="card" style={{ display: 'flex', gap: '1.25rem', padding: '1.75rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{item.icon}</span>
                                    <div>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text)' }}>{item.title}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 2: Hospital Statistics */}
                <section className="stats-section" style={{ padding: '5rem 0', background: 'var(--bg)' }}>
                    <div className="container">
                        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem', color: 'var(--text)' }}>Hospital Statistics</h2>
                        <p style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            Our continuous dedication to clinical excellence and patient care in numbers.
                        </p>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {[
                                { icon: '👨‍⚕️', label: 'Doctors', count: 50 },
                                { icon: '👥', label: 'Patients', count: 500 },
                                { icon: '📅', label: 'Appointments', count: 1000 },
                                { icon: '🏥', label: 'Departments', count: 10 }
                            ].map((stat, idx) => (
                                <div key={idx} className="card" style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    padding: '2rem', 
                                    background: '#ffffff', 
                                    textAlign: 'center', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem', background: 'var(--primary-light)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {stat.icon}
                                    </div>
                                    <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1.2 }}>
                                        <Counter end={stat.count} suffix="+" />
                                    </span>
                                    <span style={{ color: 'var(--muted)', marginTop: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="site-footer">
                <div className="container">
                    © {new Date().getFullYear()} Hospital Management System
                </div>
            </footer>

            <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
        </>
    );
}
