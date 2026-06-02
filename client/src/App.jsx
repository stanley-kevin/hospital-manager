import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import EmergencyCall from './components/EmergencyCall';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Admin from './pages/Admin';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

export default function App() {
    return (
        <AuthProvider>
            <EmergencyCall />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login initialTab="login" />} />
                    <Route path="/register" element={<Login initialTab="register" />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/admin-login" element={<AdminLogin />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/doctors"
                        element={
                            <ProtectedRoute>
                                <Doctors />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/appointments"
                        element={
                            <ProtectedRoute>
                                <Appointments />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/about"
                        element={
                            <ProtectedRoute>
                                <AboutUs />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/faq"
                        element={
                            <ProtectedRoute>
                                <FAQ />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/contact"
                        element={
                            <ProtectedRoute>
                                <ContactUs />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <AdminProtectedRoute>
                                <Admin />
                            </AdminProtectedRoute>
                        }
                    />

                    {/* Catch-all → redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
