/**
 * adminApi.js — Admin-only API calls using the admin JWT (not Firebase).
 * Token stored in localStorage under 'adminToken'.
 */

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

function getAdminToken() {
    return localStorage.getItem('adminToken');
}

async function adminFetch(path, options = {}) {
    const token = getAdminToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

export const AdminAuth = {
    login: (email, password) =>
        adminFetch('/auth/admin-login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },

    isLoggedIn: () => !!localStorage.getItem('adminToken'),
    getUser: () => {
        try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; }
    },
};

export const AdminAppointments = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return adminFetch(`/appointments/all${qs ? '?' + qs : ''}`);
    },
    approve: (id) =>
        adminFetch(`/appointments/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'confirmed' }),
        }),
    reject: (id) =>
        adminFetch(`/appointments/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'cancelled' }),
        }),
};

export const AdminStats = {
    stats: () => adminFetch('/admin/stats'),
    activity: () => adminFetch('/admin/activity'),
};

export const AdminDoctors = {
    getAll: () => adminFetch('/admin/doctors'),
    create: (data) =>
        adminFetch('/admin/doctors', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id, data) =>
        adminFetch(`/admin/doctors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    delete: (id) =>
        adminFetch(`/admin/doctors/${id}`, {
            method: 'DELETE',
        }),
};

export const AdminPatients = {
    getAll: () => adminFetch('/admin/patients'),
    getById: (id) => adminFetch(`/admin/patients/${id}`),
    delete: (id) =>
        adminFetch(`/admin/patients/${id}`, {
            method: 'DELETE',
        }),
};
