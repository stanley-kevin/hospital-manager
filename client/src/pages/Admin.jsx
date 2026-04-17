import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuth, AdminAppointments, AdminStats } from '../services/adminApi';

const STATUS_BADGE = {
    pending:   { bg: '#fff7ed', color: '#c05621', border: '#fed7aa' },
    confirmed: { bg: '#f0fff4', color: '#276749', border: '#9ae6b4' },
    cancelled: { bg: '#fff5f5', color: '#c53030', border: '#fed7d7' },
    completed: { bg: '#ebf8ff', color: '#2b6cb0', border: '#bee3f8' },
};

export default function AdminPage() {
    const navigate = useNavigate();
    const adminUser = AdminAuth.getUser();

    const [stats, setStats]               = useState(null);
    const [activity, setActivity]         = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [loadingAppts, setLoadingAppts] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

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

    useEffect(() => {
        loadStats();
        loadActivity();
        loadAllAppointments();
    }, [loadStats, loadActivity, loadAllAppointments]);

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

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc', fontFamily: 'Inter, sans-serif' }}>
            {/* Top Nav */}
            <nav style={{
                background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                padding: '1rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                    <div>
                        <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>
                            Admin Dashboard
                        </div>
                        <div style={{ color: '#90cdf4', fontSize: '0.8rem' }}>
                            {adminUser?.email}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(255,255,255,0.1)', color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px', padding: '0.5rem 1.25rem',
                        cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
                        transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    🚪 Logout
                </button>
            </nav>

            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { icon: '👨‍⚕️', label: 'Total Doctors',        value: stats?.totalDoctors },
                        { icon: '👥', label: 'Registered Users',       value: stats?.totalUsers },
                        { icon: '📅', label: "Today's Appointments",   value: stats?.todayAppointments },
                        { icon: '⏳', label: 'Pending Approvals',      value: stats?.pendingAppointments },
                        { icon: '✅', label: 'Confirmed',               value: stats?.confirmedAppointments },
                        { icon: '📋', label: 'Total Appointments',     value: stats?.totalAppointments },
                    ].map(({ icon, label, value }) => (
                        <div key={label} style={{
                            background: '#fff', borderRadius: '12px', padding: '1.25rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                        }}>
                            <div style={{ fontSize: '1.75rem' }}>{icon}</div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a365d' }}>
                                    {value ?? '—'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#718096' }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* All Appointments */}
                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {/* Table header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                            📋 All Appointments
                        </h2>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); loadAllAppointments(e.target.value); }}
                            style={{
                                padding: '.4rem .8rem', borderRadius: '8px',
                                border: 'none', fontSize: '.875rem', cursor: 'pointer',
                                background: 'rgba(255,255,255,0.15)', color: '#fff',
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
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                            Loading appointments...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                            No appointments found
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
                                <thead>
                                    <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
                                        {['Patient', 'Doctor', 'Date & Time', 'Reason', 'Status', 'Actions'].map((h) => (
                                            <th key={h} style={{ padding: '.85rem 1rem', color: '#4a5568', fontWeight: '600', whiteSpace: 'nowrap' }}>
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
                                            <tr key={a.id} style={{ borderTop: '1px solid #e2e8f0', transition: 'background 0.15s' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#f7fafc'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {/* Patient */}
                                                <td style={{ padding: '.85rem 1rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{a.patient_name}</div>
                                                    <div style={{ color: '#718096', fontSize: '.8rem' }}>{a.patient_phone}</div>
                                                </td>
                                                {/* Doctor */}
                                                <td style={{ padding: '.85rem 1rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#2d3748' }}>Dr. {a.doctor_name}</div>
                                                    <div style={{ color: '#718096', fontSize: '.8rem' }}>{a.specialty}</div>
                                                </td>
                                                {/* Date & Time */}
                                                <td style={{ padding: '.85rem 1rem', whiteSpace: 'nowrap' }}>
                                                    <div>{a.date}</div>
                                                    <div style={{ color: '#718096', fontSize: '.8rem' }}>{a.time}</div>
                                                </td>
                                                {/* Reason */}
                                                <td style={{ padding: '.85rem 1rem', color: '#718096', maxWidth: '160px' }}>
                                                    {a.reason || '—'}
                                                </td>
                                                {/* Status Badge */}
                                                <td style={{ padding: '.85rem 1rem' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '.25rem .75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '.78rem',
                                                        fontWeight: '700',
                                                        background: badge.bg,
                                                        color: badge.color,
                                                        border: `1px solid ${badge.border}`,
                                                        textTransform: 'capitalize',
                                                        letterSpacing: '0.02em',
                                                    }}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                                {/* Actions */}
                                                <td style={{ padding: '.85rem 1rem' }}>
                                                    {a.status === 'pending' ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            <button
                                                                onClick={() => handleApprove(a.id)}
                                                                disabled={!!busy}
                                                                style={{
                                                                    padding: '.35rem .9rem',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    background: busy === 'approve' ? '#c6f6d5' : '#38a169',
                                                                    color: busy === 'approve' ? '#276749' : '#fff',
                                                                    fontWeight: '700',
                                                                    fontSize: '.8rem',
                                                                    cursor: busy ? 'not-allowed' : 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {busy === 'approve' ? '⏳' : '✅'} Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(a.id)}
                                                                disabled={!!busy}
                                                                style={{
                                                                    padding: '.35rem .9rem',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    background: busy === 'reject' ? '#fed7d7' : '#e53e3e',
                                                                    color: busy === 'reject' ? '#c53030' : '#fff',
                                                                    fontWeight: '700',
                                                                    fontSize: '.8rem',
                                                                    cursor: busy ? 'not-allowed' : 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {busy === 'reject' ? '⏳' : '❌'} Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#a0aec0', fontSize: '.8rem', fontStyle: 'italic' }}>
                                                            {a.status === 'confirmed' ? '✅ Approved' :
                                                             a.status === 'cancelled' ? '❌ Rejected' : '🏁 Completed'}
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
                    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginTop: '2rem', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)' }}>
                            <h2 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: '700' }}>🔔 Recent Activity</h2>
                        </div>
                        <div style={{ padding: '0.5rem 0' }}>
                            {activity.map((a, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem 1.5rem', borderBottom: '1px solid #f7fafc' }}>
                                    <span style={{ fontSize: '1.25rem' }}>{a.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '.875rem', color: '#2d3748' }}>{a.text}</div>
                                        <div style={{ fontSize: '.75rem', color: '#a0aec0' }}>{new Date(a.time).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
