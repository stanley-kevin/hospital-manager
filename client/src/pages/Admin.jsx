import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuth, AdminAppointments, AdminStats, AdminDoctors, AdminPatients } from '../services/adminApi';

const STATUS_BADGE = {
    pending:   { bg: '#fff7ed', color: '#c05621', border: '#fed7aa' },
    confirmed: { bg: '#f0fff4', color: '#276749', border: '#9ae6b4' },
    cancelled: { bg: '#fff5f5', color: '#c53030', border: '#fed7d7' },
    completed: { bg: '#ebf8ff', color: '#2b6cb0', border: '#bee3f8' },
};

const DEPARTMENTS = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'General Medicine'
];

export default function AdminPage() {
    const navigate = useNavigate();
    const adminUser = AdminAuth.getUser();

    // ── Layout & Responsive States ───────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doctors' | 'patients'
    const [isMobile, setIsMobile] = useState(window.innerWidth < 991);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // ── Overview Data States ─────────────────────────────────────────────────
    const [stats, setStats]               = useState(null);
    const [activity, setActivity]         = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [loadingAppts, setLoadingAppts] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    // ── Doctor Management States ──────────────────────────────────────────────
    const [doctors, setDoctors] = useState([]);
    const [searchDoc, setSearchDoc] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);
    const [docModalMode, setDocModalMode] = useState('add'); // 'add' | 'edit'
    const [currentDoc, setCurrentDoc] = useState(null);
    const [docForm, setDocForm] = useState({
        name: '',
        specialty: 'General Medicine',
        designation: '',
        location: '',
        email: '',
        phone: '',
        availability_status: 'Available',
        photo_url: '',
    });

    // ── Patient Management States ─────────────────────────────────────────────
    const [patients, setPatients] = useState([]);
    const [searchPat, setSearchPat] = useState('');
    const [loadingPats, setLoadingPats] = useState(false);
    const [showPatModal, setShowPatModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [loadingPatDetails, setLoadingPatDetails] = useState(false);

    // ── Handle Responsive Layout ─────────────────────────────────────────────
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 991;
            setIsMobile(mobile);
            if (!mobile) setMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Loaders ──────────────────────────────────────────────────────────────
    const loadStats = useCallback(async () => {
        try { const { stats: s } = await AdminStats.stats(); setStats(s); } catch {}
    }, []);

    const loadActivity = useCallback(async () => {
        try { const { activity: a } = await AdminStats.activity(); setActivity(a || []); } catch {}
    }, []);

    const loadAllAppointments = useCallback(async (status = '') => {
        setLoadingAppts(true);
        try {
            const params = status ? { status } : {};
            const { appointments: list } = await AdminAppointments.getAll(params);
            setAppointments(list || []);
        } catch {
            setAppointments([]);
        } finally {
            setLoadingAppts(false);
        }
    }, []);

    const loadDoctors = useCallback(async () => {
        setLoadingDocs(true);
        try {
            const { doctors: list } = await AdminDoctors.getAll();
            setDoctors(list || []);
        } catch {
            setDoctors([]);
        } finally {
            setLoadingDocs(false);
        }
    }, []);

    const loadPatients = useCallback(async () => {
        setLoadingPats(true);
        try {
            const { patients: list } = await AdminPatients.getAll();
            setPatients(list || []);
        } catch {
            setPatients([]);
        } finally {
            setLoadingPats(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        loadStats();
        loadActivity();
        loadAllAppointments();
        loadDoctors();
        loadPatients();
    }, [loadStats, loadActivity, loadAllAppointments, loadDoctors, loadPatients]);

    // Refresh active tab data dynamically
    useEffect(() => {
        if (activeTab === 'overview') {
            loadStats();
            loadAllAppointments(filterStatus);
        } else if (activeTab === 'doctors') {
            loadDoctors();
        } else if (activeTab === 'patients') {
            loadPatients();
        }
    }, [activeTab, loadStats, loadAllAppointments, loadDoctors, loadPatients, filterStatus]);

    // ── Appointment Action Handlers ──────────────────────────────────────────
    const handleApprove = async (id) => {
        setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
        try {
            await AdminAppointments.approve(id);
            setAppointments((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: 'confirmed' } : a))
            );
            loadStats();
        } catch { alert('Failed to approve appointment.'); }
        finally { setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; }); }
    };

    const handleReject = async (id) => {
        setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
        try {
            await AdminAppointments.reject(id);
            setAppointments((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
            );
            loadStats();
        } catch { alert('Failed to reject appointment.'); }
        finally { setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; }); }
    };

    const handleLogout = () => {
        AdminAuth.logout();
        navigate('/admin-login', { replace: true });
    };

    // ── Doctor Action Handlers ───────────────────────────────────────────────
    const handleOpenAddDoc = () => {
        setDocForm({
            name: '',
            specialty: 'General Medicine',
            designation: '',
            location: '',
            email: '',
            phone: '',
            availability_status: 'Available',
            photo_url: '',
        });
        setDocModalMode('add');
        setCurrentDoc(null);
        setShowDocModal(true);
    };

    const handleOpenEditDoc = (doc) => {
        setDocForm({
            name: doc.name || '',
            specialty: doc.specialty || 'General Medicine',
            designation: doc.designation || '',
            location: doc.location || '',
            email: doc.email || '',
            phone: doc.phone || '',
            availability_status: doc.availability_status || 'Available',
            photo_url: doc.photo_url || '',
        });
        setDocModalMode('edit');
        setCurrentDoc(doc);
        setShowDocModal(true);
    };

    const handleDocFormChange = (e) => {
        const { name, value } = e.target;
        setDocForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Profile photo must be smaller than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setDocForm(prev => ({ ...prev, photo_url: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveDoctor = async (e) => {
        e.preventDefault();
        try {
            if (docModalMode === 'add') {
                await AdminDoctors.create(docForm);
                alert('Doctor added successfully!');
            } else {
                await AdminDoctors.update(currentDoc.id, docForm);
                alert('Doctor updated successfully!');
            }
            setShowDocModal(false);
            loadDoctors();
            loadStats();
        } catch (err) {
            alert(err.message || 'Failed to save doctor.');
        }
    };

    const handleDeleteDoctor = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete Dr. ${name}? This will also cancel all their pending/scheduled appointments.`)) {
            try {
                await AdminDoctors.delete(id);
                alert('Doctor deleted successfully.');
                loadDoctors();
                loadStats();
            } catch {
                alert('Failed to delete doctor.');
            }
        }
    };

    // ── Patient Action Handlers ──────────────────────────────────────────────
    const handleViewPatientDetails = async (id) => {
        setLoadingPatDetails(true);
        try {
            const { patient, appointments: appts } = await AdminPatients.getById(id);
            setSelectedPatient(patient);
            setPatientAppointments(appts || []);
            setShowPatModal(true);
        } catch {
            alert('Failed to load patient details.');
        } finally {
            setLoadingPatDetails(false);
        }
    };

    const handleDeletePatient = async (id, name) => {
        if (window.confirm(`⚠️ WARNING: Deleting ${name}'s account will permanently wipe their credentials and cancel all booked appointments. Do you wish to continue?`)) {
            try {
                await AdminPatients.delete(id);
                alert('Patient account deleted successfully.');
                loadPatients();
                loadStats();
            } catch {
                alert('Failed to delete patient account.');
            }
        }
    };

    // ── Filters & Searches ───────────────────────────────────────────────────
    const filteredDoctors = doctors.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchDoc.toLowerCase());
        const matchesDept   = filterDept ? doc.specialty === filterDept : true;
        return matchesSearch && matchesDept;
    });

    const filteredPatients = patients.filter((pat) => {
        const term = searchPat.toLowerCase();
        return (
            pat.name.toLowerCase().includes(term) ||
            (pat.email || '').toLowerCase().includes(term) ||
            (pat.phone || '').includes(term)
        );
    });

    // ── Styles Configuration ─────────────────────────────────────────────────
    const sidebarWidth = '260px';
    const primaryColor = '#1a365d';
    const accentColor = '#2b6cb0';

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc', display: 'flex', flexDirection: isMobile ? 'column' : 'row', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Sidebar Navigation */}
            <aside style={{
                width: isMobile ? '100%' : sidebarWidth,
                background: 'linear-gradient(180deg, #1a365d 0%, #2d3748 100%)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                zIndex: 100,
                position: isMobile ? 'relative' : 'sticky',
                top: 0,
                height: isMobile ? 'auto' : '100vh',
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.75rem' }}>🏥</span>
                        <div>
                            <h1 style={{ fontSize: '1.05rem', margin: 0, fontWeight: '800', letterSpacing: '0.5px' }}>Hospital Admin</h1>
                            <span style={{ fontSize: '0.75rem', color: '#90cdf4' }}>{adminUser?.email}</span>
                        </div>
                    </div>
                    {isMobile && (
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>
                    )}
                </div>

                {/* Sidebar Navigation Items */}
                <nav style={{
                    display: (isMobile && !mobileMenuOpen) ? 'none' : 'flex',
                    flexDirection: 'column',
                    padding: '1rem 0.75rem',
                    gap: '0.35rem',
                    flexGrow: 1
                }}>
                    {[
                        { id: 'overview', label: '📊 Dashboard Overview' },
                        { id: 'doctors', label: '👨‍⚕️ Doctor Management' },
                        { id: 'patients', label: '👥 Patient Management' },
                    ].map((tab) => {
                        const isSel = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.85rem 1.25rem',
                                    background: isSel ? 'rgba(255,255,255,0.15)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: isSel ? '#fff' : '#a0aec0',
                                    fontSize: '0.9rem',
                                    fontWeight: isSel ? '700' : '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                }}
                                onMouseOver={(e) => { if (!isSel) e.currentTarget.style.color = '#fff'; }}
                                onMouseOut={(e) => { if (!isSel) e.currentTarget.style.color = '#a0aec0'; }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}

                    <div style={{ marginTop: 'auto', padding: '1rem 0.5rem 0' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                background: 'rgba(229,62,62,0.1)',
                                color: '#feb2b2',
                                border: '1px solid rgba(229,62,62,0.2)',
                                borderRadius: '8px',
                                padding: '0.65rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(229,62,62,0.25)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(229,62,62,0.1)'; e.currentTarget.style.color = '#feb2b2'; }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                
                {/* Header */}
                <header style={{
                    background: '#fff',
                    padding: '1.25rem 2rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: primaryColor, margin: 0, textTransform: 'capitalize' }}>
                        {activeTab === 'overview' ? '📊 Dashboard Overview' : 
                         activeTab === 'doctors' ? '👨‍⚕️ Doctor Management' : '👥 Patient Management'}
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: '#718096', display: isMobile ? 'none' : 'inline' }}>
                        📅 System Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </header>

                <main style={{ padding: '2rem', maxWidth: '1200px', width: '100%', margin: '0 auto', flexGrow: 1 }}>

                    {/* ─────────────────────────────────────────────────────────────────
                        VIEW 1: DASHBOARD OVERVIEW
                        ───────────────────────────────────────────────────────────────── */}
                    {activeTab === 'overview' && (
                        <div>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                {[
                                    { icon: '👨‍⚕️', label: 'Total Doctors',        value: stats?.totalDoctors },
                                    { icon: '👥', label: 'Registered Patients',     value: stats?.totalUsers },
                                    { icon: '📅', label: "Today's Appointments",   value: stats?.todayAppointments },
                                    { icon: '⏳', label: 'Pending Approvals',      value: stats?.pendingAppointments },
                                    { icon: '✅', label: 'Confirmed bookings',     value: stats?.confirmedAppointments },
                                    { icon: '📋', label: 'Total Appointments',     value: stats?.totalAppointments },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} style={{
                                        background: '#fff', borderRadius: '12px', padding: '1.5rem',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                                        border: '1px solid #edf2f7',
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                    }}>
                                        <div style={{ fontSize: '2rem', background: '#ebf8ff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                                        <div>
                                            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: primaryColor, lineHeight: 1.1 }}>
                                                {value ?? '—'}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '0.25rem', fontWeight: '500' }}>{label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* All Appointments */}
                            <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', overflow: 'hidden' }}>
                                <div style={{
                                    padding: '1.25rem 2rem',
                                    background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    flexWrap: 'wrap', gap: '1rem'
                                }}>
                                    <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>📋</span> All Booked Appointments
                                    </h3>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => { setFilterStatus(e.target.value); loadAllAppointments(e.target.value); }}
                                        style={{
                                            padding: '.45rem .9rem', borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.2)', fontSize: '.85rem', cursor: 'pointer',
                                            background: 'rgba(255,255,255,0.15)', color: '#fff',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="" style={{ color: '#1a202c' }}>All Statuses</option>
                                        <option value="pending"   style={{ color: '#1a202c' }}>Pending</option>
                                        <option value="confirmed" style={{ color: '#1a202c' }}>Confirmed</option>
                                        <option value="cancelled" style={{ color: '#1a202c' }}>Cancelled</option>
                                        <option value="completed" style={{ color: '#1a202c' }}>Completed</option>
                                    </select>
                                </div>

                                {loadingAppts ? (
                                    <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
                                        <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>⏳</div>
                                        <div style={{ marginTop: '1rem', fontWeight: '600' }}>Fetching appointments records...</div>
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
                                        <div style={{ fontWeight: '600' }}>No appointments booked.</div>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', minWidth: '600px' }}>
                                            <thead>
                                                <tr style={{ background: '#f7fafc', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>
                                                    {['Patient info', 'Doctor Assigned', 'Scheduled Time', 'Status Badge', 'Actions Panel'].map((h) => (
                                                        <th key={h} style={{ padding: '1rem 1.5rem', color: '#4a5568', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.map((a) => {
                                                    const badge = STATUS_BADGE[a.status] || STATUS_BADGE.pending;
                                                    const busy = actionLoading[a.id];
                                                    return (
                                                        <tr key={a.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.15s' }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = '#fcfdfe'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <div style={{ fontWeight: '700', color: '#2d3748' }}>{a.patient_name}</div>
                                                                <div style={{ color: '#718096', fontSize: '.8rem', marginTop: '0.15rem' }}>📞 {a.patient_phone}</div>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <div style={{ fontWeight: '700', color: '#2d3748' }}>Dr. {a.doctor_name}</div>
                                                                <span style={{ fontSize: '.75rem', color: accentColor, background: '#ebf8ff', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.2rem', fontWeight: '600' }}>
                                                                    {a.specialty}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                                <div style={{ fontWeight: '600' }}>📅 {a.date}</div>
                                                                <div style={{ color: '#718096', fontSize: '.8rem', marginTop: '0.15rem' }}>⏰ {a.time.substring(0,5)}</div>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '.25rem .75rem',
                                                                    borderRadius: '20px',
                                                                    fontSize: '.75rem',
                                                                    fontWeight: '700',
                                                                    background: badge.bg,
                                                                    color: badge.color,
                                                                    border: `1px solid ${badge.border}`,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                }}>
                                                                    {a.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                {a.status === 'pending' ? (
                                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                        <button
                                                                            onClick={() => handleApprove(a.id)}
                                                                            disabled={!!busy}
                                                                            style={{
                                                                                padding: '.4rem .85rem', borderRadius: '6px', border: 'none',
                                                                                background: '#38a169', color: '#fff', fontWeight: '700', fontSize: '.8rem',
                                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 4px rgba(56,161,105,0.1)'
                                                                            }}
                                                                        >
                                                                            {busy === 'approve' ? '⏳' : '✓'} Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleReject(a.id)}
                                                                            disabled={!!busy}
                                                                            style={{
                                                                                padding: '.4rem .85rem', borderRadius: '6px', border: 'none',
                                                                                background: '#e53e3e', color: '#fff', fontWeight: '700', fontSize: '.8rem',
                                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 4px rgba(229,62,62,0.1)'
                                                                            }}
                                                                        >
                                                                            {busy === 'reject' ? '⏳' : '✕'} Reject
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span style={{ color: '#a0aec0', fontSize: '.8rem', fontWeight: '600', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                        {a.status === 'confirmed' ? '🟢 Confirmed' :
                                                                         a.status === 'cancelled' ? '🔴 Cancelled' : '🔵 Completed'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            {activity.length > 0 && (
                                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', marginTop: '2.5rem', overflow: 'hidden' }}>
                                    <div style={{ padding: '1.25rem 2rem', background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)' }}>
                                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>🔔</span> System Activity Log
                                        </h3>
                                    </div>
                                    <div style={{ padding: '0.5rem 0' }}>
                                        {activity.map((a, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 2rem', borderBottom: i === activity.length - 1 ? 'none' : '1px solid #f7fafc' }}>
                                                <span style={{ fontSize: '1.5rem', background: '#f7fafc', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.icon}</span>
                                                <div>
                                                    <div style={{ fontSize: '.9rem', color: '#2d3748', fontWeight: '600' }}>{a.text}</div>
                                                    <div style={{ fontSize: '.75rem', color: '#a0aec0', marginTop: '0.2rem' }}>🕒 {new Date(a.time).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* ─────────────────────────────────────────────────────────────────
                        VIEW 2: DOCTOR MANAGEMENT
                        ───────────────────────────────────────────────────────────────── */}
                    {activeTab === 'doctors' && (
                        <div>
                            {/* Actions & Filters */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexGrow: 1, maxWidth: '600px' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Search doctor by name..."
                                        value={searchDoc}
                                        onChange={(e) => setSearchDoc(e.target.value)}
                                        style={{
                                            padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e0',
                                            fontSize: '0.9rem', outline: 'none', flexGrow: 1, minWidth: '200px'
                                        }}
                                    />
                                    <select
                                        value={filterDept}
                                        onChange={(e) => setFilterDept(e.target.value)}
                                        style={{
                                            padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e0',
                                            fontSize: '0.9rem', outline: 'none', cursor: 'pointer', background: '#fff'
                                        }}
                                    >
                                        <option value="">All Departments</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleOpenAddDoc}
                                    style={{
                                        background: accentColor, color: '#fff', border: 'none',
                                        borderRadius: '8px', padding: '0.65rem 1.5rem', cursor: 'pointer',
                                        fontSize: '0.9rem', fontWeight: '700', boxShadow: '0 4px 6px rgba(43,108,176,0.15)',
                                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                                    }}
                                >
                                    ➕ Add New Doctor
                                </button>
                            </div>

                            {/* Doctor Listing */}
                            {loadingDocs ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
                                    <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>⏳</div>
                                    <div style={{ marginTop: '1rem', fontWeight: '600' }}>Loading doctors roster...</div>
                                </div>
                            ) : filteredDoctors.length === 0 ? (
                                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '4rem', textAlign: 'center', color: '#718096' }}>
                                    <span style={{ fontSize: '3rem' }}>📭</span>
                                    <h4 style={{ margin: '1rem 0 0.5rem', color: '#2d3748', fontSize: '1.1rem' }}>No doctors found</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Try clearing filters or search parameters, or create a new doctor listing above.</p>
                                </div>
                            ) : (
                                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', overflow: 'hidden' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', minWidth: '850px' }}>
                                            <thead>
                                                <tr style={{ background: '#f7fafc', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>
                                                    {['Doctor Profile', 'Contact Information', 'Clinic Location', 'Designation / Specialization', 'Status', 'Actions'].map((h) => (
                                                        <th key={h} style={{ padding: '1rem 1.5rem', color: '#4a5568', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredDoctors.map((doc) => {
                                                    const initials = doc.initials || doc.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('').toUpperCase();
                                                    return (
                                                        <tr key={doc.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.15s' }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = '#fcfdfe'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            {/* Doctor Profile info */}
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                    {doc.photo_url ? (
                                                                        <img src={doc.photo_url} alt={doc.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accentColor}` }} />
                                                                    ) : (
                                                                        <div style={{
                                                                            width: '48px', height: '48px', borderRadius: '50%',
                                                                            background: 'linear-gradient(135deg, #667eea 0%, #2b6cb0 100%)',
                                                                            color: '#fff', fontWeight: '700', fontSize: '0.95rem',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                        }}>
                                                                            {initials}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div style={{ fontWeight: '700', color: '#2d3748', fontSize: '0.95rem' }}>{doc.name}</div>
                                                                        <span style={{ color: accentColor, fontWeight: '700', fontSize: '0.75rem', background: '#ebf8ff', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.15rem' }}>
                                                                            💼 {doc.specialty}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Contact details */}
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <div style={{ fontWeight: '600' }}>✉️ {doc.email || '—'}</div>
                                                                <div style={{ color: '#718096', fontSize: '.8rem', marginTop: '0.15rem' }}>📞 {doc.phone || '—'}</div>
                                                            </td>

                                                            {/* Location */}
                                                            <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4a5568' }}>
                                                                📍 {doc.location}
                                                            </td>

                                                            {/* Specialization Designation */}
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <div style={{ fontWeight: '600', color: '#2d3748' }}>{doc.designation || 'Specialist'}</div>
                                                                <div style={{ color: '#a0aec0', fontSize: '.8rem', marginTop: '0.15rem' }}>⭐ rating: {doc.rating || '4.5'}</div>
                                                            </td>

                                                            {/* Availability Status */}
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '.25rem .65rem',
                                                                    borderRadius: '20px',
                                                                    fontSize: '.75rem',
                                                                    fontWeight: '700',
                                                                    textTransform: 'uppercase',
                                                                    background: doc.availability_status === 'Available' ? '#f0fff4' : 
                                                                                doc.availability_status === 'On Leave' ? '#fffaf0' : '#fff5f5',
                                                                    color: doc.availability_status === 'Available' ? '#276749' : 
                                                                           doc.availability_status === 'On Leave' ? '#c05621' : '#c53030',
                                                                    border: `1px solid ${doc.availability_status === 'Available' ? '#9ae6b4' : 
                                                                                        doc.availability_status === 'On Leave' ? '#fbd38d' : '#feb2b2'}`
                                                                }}>
                                                                    ● {doc.availability_status || 'Available'}
                                                                </span>
                                                            </td>

                                                            {/* Doctor actions panel */}
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                    <button
                                                                        onClick={() => handleOpenEditDoc(doc)}
                                                                        style={{
                                                                            padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0',
                                                                            background: '#fff', color: '#4a5568', fontWeight: '700', fontSize: '0.78rem',
                                                                            cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.15rem'
                                                                        }}
                                                                        onMouseOver={(e) => { e.currentTarget.style.background = '#edf2f7'; }}
                                                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                                                                        style={{
                                                                            padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none',
                                                                            background: '#fff5f5', color: '#e53e3e', fontWeight: '700', fontSize: '0.78rem',
                                                                            cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.15rem'
                                                                        }}
                                                                        onMouseOver={(e) => { e.currentTarget.style.background = '#fed7d7'; }}
                                                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff5f5'; }}
                                                                    >
                                                                        🗑️ Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* ─────────────────────────────────────────────────────────────────
                        VIEW 3: PATIENT MANAGEMENT
                        ───────────────────────────────────────────────────────────────── */}
                    {activeTab === 'patients' && (
                        <div>
                            {/* Search Filters */}
                            <div style={{ marginBottom: '2rem', display: 'flex', maxWidth: '500px' }}>
                                <input
                                    type="text"
                                    placeholder="🔍 Search patient by name, email, or phone number..."
                                    value={searchPat}
                                    onChange={(e) => setSearchPat(e.target.value)}
                                    style={{
                                        padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e0',
                                        fontSize: '0.9rem', outline: 'none', width: '100%'
                                    }}
                                />
                            </div>

                            {/* Patient Listing */}
                            {loadingPats ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
                                    <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>⏳</div>
                                    <div style={{ marginTop: '1rem', fontWeight: '600' }}>Loading patient database...</div>
                                </div>
                            ) : filteredPatients.length === 0 ? (
                                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '4rem', textAlign: 'center', color: '#718096' }}>
                                    <span style={{ fontSize: '3rem' }}>📭</span>
                                    <h4 style={{ margin: '1rem 0 0.5rem', color: '#2d3748', fontSize: '1.1rem' }}>No patients found</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Try refining your search query.</p>
                                </div>
                            ) : (
                                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', overflow: 'hidden' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', minWidth: '700px' }}>
                                            <thead>
                                                <tr style={{ background: '#f7fafc', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>
                                                    {['Patient Name', 'Email Address', 'Phone Number', 'Date Registered', 'Actions'].map((h) => (
                                                        <th key={h} style={{ padding: '1rem 1.5rem', color: '#4a5568', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPatients.map((pat) => (
                                                    <tr key={pat.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.15s' }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#fcfdfe'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: '#2d3748' }}>
                                                            👤 {pat.name}
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>
                                                            {pat.email}
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem', color: '#4a5568' }}>
                                                            {pat.phone || '—'}
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem', color: '#718096', whiteSpace: 'nowrap' }}>
                                                            📅 {new Date(pat.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '1rem 1.5rem' }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button
                                                                    onClick={() => handleViewPatientDetails(pat.id)}
                                                                    disabled={loadingPatDetails}
                                                                    style={{
                                                                        padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0',
                                                                        background: '#fff', color: accentColor, fontWeight: '700', fontSize: '0.78rem',
                                                                        cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.15rem'
                                                                    }}
                                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#ebf8ff'; }}
                                                                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                                                                >
                                                                    👁️ Details
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePatient(pat.id, pat.name)}
                                                                    style={{
                                                                        padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none',
                                                                        background: '#fff5f5', color: '#e53e3e', fontWeight: '700', fontSize: '0.78rem',
                                                                        cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.15rem'
                                                                    }}
                                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#fed7d7'; }}
                                                                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff5f5'; }}
                                                                >
                                                                    🗑️ Wipe Account
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </main>
            </div>


            {/* ─────────────────────────────────────────────────────────────────
                MODAL 1: ADD OR EDIT DOCTOR
                ───────────────────────────────────────────────────────────────── */}
            {showDocModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div 
                        onClick={() => setShowDocModal(false)}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
                    />
                    
                    <div style={{
                        position: 'relative', background: '#fff', borderRadius: '16px',
                        width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.25)', border: '1px solid #edf2f7',
                        animation: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={{
                            padding: '1.25rem 1.75rem', background: 'linear-gradient(135deg,#1a365d 0%,#2d3748 100%)',
                            color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                                {docModalMode === 'add' ? '👨‍⚕️ Add New Doctor Profile' : `✏️ Edit Dr. ${currentDoc?.name} details`}
                            </h3>
                            <button 
                                onClick={() => setShowDocModal(false)}
                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer', outline: 'none' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveDoctor} style={{ padding: '1.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Doctor Name *</label>
                                    <input type="text" name="name" required placeholder="e.g. Dr. Sarah Sharma" value={docForm.name} onChange={handleDocFormChange} style={{ padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Department *</label>
                                    <select name="specialty" required value={docForm.specialty} onChange={handleDocFormChange} style={{ padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem', outline: 'none', background: '#fff' }}>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Specialization *</label>
                                    <input type="text" name="designation" required placeholder="e.g. Cardiologist" value={docForm.designation} onChange={handleDocFormChange} style={{ padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Location (City) *</label>
                                    <input type="text" name="location" required placeholder="e.g. Mumbai" value={docForm.location} onChange={handleDocFormChange} style={{ padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Availability Status</label>
                                    <select name="availability_status" value={docForm.availability_status} onChange={handleDocFormChange} style={{ padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem', outline: 'none', background: '#fff' }}>
                                        <option value="Available">Available</option>
                                        <option value="Unavailable">Unavailable</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Email Address</label>
                                    <input type="email" name="email" placeholder="doctor@hospital.com" value={docForm.email} onChange={handleDocFormChange} style={{ padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem', outline: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input type="text" name="phone" placeholder="+91 99999 99999" value={docForm.phone} onChange={handleDocFormChange} style={{ padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem', outline: 'none' }} />
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4a5568', textTransform: 'uppercase' }}>Profile Photo Upload</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px dashed #cbd5e0', padding: '1rem', borderRadius: '8px' }}>
                                        {docForm.photo_url ? (
                                            <div style={{ position: 'relative' }}>
                                                <img src={docForm.photo_url} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accentColor}` }} />
                                                <button 
                                                    type="button"
                                                    onClick={() => setDocForm(prev => ({ ...prev, photo_url: '' }))}
                                                    style={{ position: 'absolute', top: -5, right: -5, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#edf2f7', color: '#a0aec0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                📷
                                            </div>
                                        )}
                                        <div style={{ flexGrow: 1 }}>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '0.8rem', cursor: 'pointer' }} />
                                            <div style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '0.25rem' }}>PNG, JPG or JPEG. Max size 2MB.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #edf2f7', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowDocModal(false)}
                                    style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e0', background: '#fff', color: '#4a5568', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    style={{ padding: '0.55rem 1.5rem', borderRadius: '8px', border: 'none', background: accentColor, color: '#fff', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(43,108,176,0.2)' }}
                                >
                                    {docModalMode === 'add' ? 'Add Doctor' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ─────────────────────────────────────────────────────────────────
                MODAL 2: VIEW PATIENT DETAILS & APPOINTMENT HISTORY
                ───────────────────────────────────────────────────────────────── */}
            {showPatModal && selectedPatient && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div 
                        onClick={() => setShowPatModal(false)}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
                    />
                    
                    <div style={{
                        position: 'relative', background: '#fff', borderRadius: '16px',
                        width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.25)', border: '1px solid #edf2f7',
                        animation: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={{
                            padding: '1.25rem 1.75rem', background: 'linear-gradient(135deg,#1a365d 0%,#2d3748 100%)',
                            color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>👥</span> Patient Account Profile
                            </h3>
                            <button 
                                onClick={() => setShowPatModal(false)}
                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer', outline: 'none' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            {/* Personal Info Card */}
                            <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '700', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Personal Information
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                    <div>
                                        <span style={{ color: '#718096', fontWeight: '500' }}>Patient Name:</span>
                                        <div style={{ fontWeight: '700', color: '#2d3748', marginTop: '0.15rem' }}>{selectedPatient.name}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#718096', fontWeight: '500' }}>Email Address:</span>
                                        <div style={{ fontWeight: '700', color: '#2d3748', marginTop: '0.15rem' }}>{selectedPatient.email}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#718096', fontWeight: '500' }}>Phone Number:</span>
                                        <div style={{ fontWeight: '700', color: '#2d3748', marginTop: '0.15rem' }}>{selectedPatient.phone || 'Not provided'}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#718096', fontWeight: '500' }}>Registration Date:</span>
                                        <div style={{ fontWeight: '700', color: '#2d3748', marginTop: '0.15rem' }}>{new Date(selectedPatient.created_at).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment History */}
                            <div>
                                <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '700', color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    📜 Appointment Booking History
                                </h4>
                                
                                {patientAppointments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', border: '1px dashed #cbd5e0', borderRadius: '8px', color: '#a0aec0' }}>
                                        No appointments scheduled by this patient yet.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                        {patientAppointments.map((appt) => {
                                            const badge = STATUS_BADGE[appt.status] || STATUS_BADGE.pending;
                                            return (
                                                <div key={appt.id} style={{
                                                    background: '#fff', border: '1px solid #edf2f7', borderRadius: '8px',
                                                    padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#2d3748', fontSize: '0.9rem' }}>Dr. {appt.doctor_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: accentColor, fontWeight: '600', marginTop: '0.15rem' }}>{appt.specialty}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
                                                            📅 {appt.date} | ⏰ {appt.time.substring(0,5)}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem',
                                                        fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                                                    }}>
                                                        {appt.status}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #edf2f7', paddingTop: '1.25rem', marginTop: '2rem' }}>
                                <button 
                                    onClick={() => setShowPatModal(false)}
                                    style={{ padding: '0.55rem 1.5rem', borderRadius: '8px', border: 'none', background: primaryColor, color: '#fff', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    Close Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
