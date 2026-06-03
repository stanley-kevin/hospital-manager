import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BookingModal from '../components/BookingModal';
import { Doctors } from '../services/api';

const DEPARTMENTS = ['', 'Cardiology', 'Orthopedics', 'Dermatology', 'Neurology', 'Pediatrics', 'General Medicine', 'Gynecology', 'ENT'];

function getInitials(name = '') {
    return name
        .split(' ')
        .filter((w) => /^[A-Z]/.test(w))
        .slice(0, 2)
        .map((w) => w[0])
        .join('');
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ specialty: '', location: '', name: '' });
    const [bookingDoctor, setBookingDoctor] = useState(null);

    useEffect(() => {
        setLoading(true);
        Doctors.getAll()
            .then((data) => {
                setDoctors(data.doctors || []);
                setFiltered(data.doctors || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        let result = doctors;
        if (filters.specialty) result = result.filter((d) => d.specialty === filters.specialty);
        if (filters.location)
            result = result.filter((d) =>
                d.location?.toLowerCase().includes(filters.location.toLowerCase())
            );
        if (filters.name)
            result = result.filter((d) =>
                d.name?.toLowerCase().includes(filters.name.toLowerCase())
            );
        setFiltered(result);
    };

    const handleReset = () => {
        setFilters({ specialty: '', location: '', name: '' });
        setFiltered(doctors);
    };

    return (
        <>
            <Navbar />
            <main>
                <section className="container doctors-section" style={{ marginTop: '2rem' }}>
                    <h1 className="section-title">Our Doctors</h1>

                    {/* Search Form */}
                    <form className="doctor-search" onSubmit={handleSearch}>
                        <div className="field">
                            <label htmlFor="dept">Department</label>
                            <select
                                id="dept"
                                value={filters.specialty}
                                onChange={(e) => setFilters((f) => ({ ...f, specialty: e.target.value }))}
                            >
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>{d || 'All'}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="location">Location</label>
                            <input
                                id="location"
                                type="text"
                                placeholder="e.g. Mumbai"
                                value={filters.location}
                                onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="doctor-name">Doctor Name</label>
                            <input
                                id="doctor-name"
                                type="text"
                                placeholder="Search by name"
                                value={filters.name}
                                onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div className="actions">
                            <button className="btn primary" type="submit">Search</button>
                            <button className="btn ghost" type="button" onClick={handleReset}>Reset</button>
                        </div>
                    </form>

                    {/* State: Loading */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                            Loading doctors...
                        </div>
                    )}

                    {/* State: Error */}
                    {!loading && error && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#e53e3e' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
                            {error}
                        </div>
                    )}

                    {/* Doctors Grid */}
                    {!loading && !error && (
                        <div className="doctors-grid">
                            {filtered.length === 0 ? (
                                <div style={{ color: '#718096', padding: '2rem' }}>No doctors found.</div>
                            ) : (
                                filtered.map((doc) => (
                                    <div
                                        key={doc._id || doc.id}
                                        className="card doc-card"
                                        data-dept={doc.specialty}
                                        data-location={doc.location}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', height: '100%', padding: '1.25rem' }}
                                    >
                                        <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '1rem' }}>
                                            {doc.photo_url ? (
                                                <img 
                                                    src={doc.photo_url} 
                                                    alt={doc.name} 
                                                    className="avatar sm" 
                                                    style={{ objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <div className="avatar sm">{getInitials(doc.name)}</div>
                                            )}
                                            <div className="doc-info" style={{ flex: 1 }}>
                                                <div className="name" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>{doc.name}</div>
                                                <div className="meta" style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                                    {doc.specialty} {doc.designation ? `• ${doc.designation}` : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ width: '100%', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                            {doc.location && (
                                                <div style={{ color: 'var(--muted)' }}>
                                                    📍 <strong>Location:</strong> {doc.location}
                                                </div>
                                            )}
                                            <div style={{ color: 'var(--muted)' }}>
                                                📅 <strong>Status:</strong>{' '}
                                                <span style={{ 
                                                    color: doc.availability_status === 'Available' ? '#38a169' : '#e53e3e',
                                                    fontWeight: '700' 
                                                }}>
                                                    {doc.availability_status || 'Available'}
                                                </span>{' '}
                                                {doc.availability ? `(${doc.availability})` : ''}
                                            </div>
                                            {(doc.email || doc.phone) && (
                                                <div style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.15rem' }}>
                                                    {doc.email && <div>✉️ {doc.email}</div>}
                                                    {doc.phone && <div>📞 {doc.phone}</div>}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="btn secondary"
                                            onClick={() => setBookingDoctor(doc)}
                                            style={{ width: '100%', marginTop: '0.5rem' }}
                                        >
                                            Book
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>
            </main>

            <footer className="site-footer">
                <div className="container">
                    © {new Date().getFullYear()} Hospital Management System
                </div>
            </footer>

            <BookingModal
                isOpen={!!bookingDoctor}
                preselectedDoctor={bookingDoctor}
                onClose={() => setBookingDoctor(null)}
            />
        </>
    );
}
