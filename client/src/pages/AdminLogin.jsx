import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuth } from '../services/adminApi';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await AdminAuth.login(form.email, form.password);
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.admin));
            navigate('/admin', { replace: true });
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-bg">
            <div className="admin-login-card">
                {/* Header */}
                <div className="admin-login-header">
                    <div className="admin-login-icon">🛡️</div>
                    <h1>Admin Portal</h1>
                    <p>Hospital Management System</p>
                </div>

                {/* Credentials hint */}
                <div className="admin-credentials-hint">
                    <span className="hint-label">🔑 Default Credentials</span>
                    <div className="hint-row">
                        <span>Email:</span>
                        <code>admin@hospital.com</code>
                    </div>
                    <div className="hint-row">
                        <span>Password:</span>
                        <code>Admin@123</code>
                    </div>
                </div>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="al-form-group">
                        <label htmlFor="al-email">Admin Email</label>
                        <input
                            id="al-email"
                            type="email"
                            name="email"
                            required
                            placeholder="admin@hospital.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>

                    <div className="al-form-group">
                        <label htmlFor="al-password">Password</label>
                        <input
                            id="al-password"
                            type="password"
                            name="password"
                            required
                            placeholder="Enter admin password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>

                    {error && (
                        <div className="al-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" className="al-submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="al-spinner">⏳ Verifying...</span>
                        ) : (
                            <>🔐 Admin Sign In</>
                        )}
                    </button>
                </form>

                <div className="al-back-link">
                    <a href="/login">← Back to User Login</a>
                </div>
            </div>
        </div>
    );
}
