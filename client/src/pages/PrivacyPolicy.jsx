import Navbar from '../components/Navbar';

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar />
            <main id="privacy-page" className="legal-page">
                {/* Hero section */}
                <section className="legal-hero">
                    <div className="container legal-hero-inner">
                        <span className="legal-badge">🔒 Privacy & Security</span>
                        <h1>Privacy <span className="accent">Policy</span></h1>
                        <p className="legal-subtitle">
                            Your health information privacy is our highest priority. Learn how we securely collect, use, 
                            and protect your personal and medical data in full compliance with healthcare privacy regulations.
                        </p>
                    </div>
                </section>

                {/* Content section */}
                <section className="legal-content container">
                    <div className="legal-grid">
                        <div className="legal-main card">
                            <div className="legal-intro">
                                <h3>Last Updated: May 30, 2026</h3>
                                <p>
                                    At the Hospital Appointment Booking System, we are dedicated to maintaining the confidentiality 
                                    and integrity of our patients' personal and medical data. This Privacy Policy details our 
                                    data protection practices and outlines your rights regarding your information.
                                </p>
                            </div>

                            <hr className="legal-divider" />

                            <div className="legal-section" id="collected">
                                <div className="section-title-wrap">
                                    <span className="section-num">1</span>
                                    <h2>Information We Collect</h2>
                                </div>
                                <p>
                                    To provide top-tier clinical appointment scheduling services, we collect various types of data. 
                                    This data collection occurs when you register, fill in medical forms, or interact with the platform:
                                </p>
                                <ul>
                                    <li><strong>Personal Identification Details:</strong> Full name, date of birth, gender, and government-issued ID identifiers (where legally required).</li>
                                    <li><strong>Contact Data:</strong> Residential address, active email address, and mobile phone numbers (essential for SMS and email reminders).</li>
                                    <li><strong>Clinical Booking Records:</strong> Appointed department, reasons for consulting, medical specialty requests, date/time logs, and designated primary physicians.</li>
                                    <li><strong>Technical System Info:</strong> IP address, browser type, operating system version, and session cookies for maintaining secure login states.</li>
                                </ul>
                            </div>

                            <div className="legal-section" id="data-usage">
                                <div className="section-title-wrap">
                                    <span className="section-num">2</span>
                                    <h2>How We Use Your Data</h2>
                                </div>
                                <p>
                                    Any information collected is strictly utilized to streamline your health journey. Specifically, your data helps us:
                                </p>
                                <ul>
                                    <li>Create, authorize, and securely manage your patient dashboard and booking history.</li>
                                    <li>Facilitate real-time appointment matching, confirmations, and scheduling updates.</li>
                                    <li>Transmit critical platform notifications (booking changes, doctor availability shifts, and clinic closures) via SMS or email.</li>
                                    <li>Maintain system security, prevent bot registrations, and audit administrative role actions.</li>
                                    <li>Comply with strict local healthcare guidelines, clinical auditing, and legal regulatory frameworks.</li>
                                </ul>
                            </div>

                            <div className="legal-section" id="security">
                                <div className="section-title-wrap">
                                    <span className="section-num">3</span>
                                    <h2>Data Security & Encryption</h2>
                                </div>
                                <p>
                                    We enforce advanced, state-of-the-art security measures to shield your records from unauthorized access, 
                                    alteration, disclosure, or accidental destruction. Our protocols include:
                                </p>
                                <ul>
                                    <li><strong>Secure Transmission (SSL/TLS):</strong> All data sent between your browser and our servers is fully encrypted using Secure Socket Layer protocols.</li>
                                    <li><strong>Data Encryption at Rest:</strong> Sensitive medical indicators and personal identifier hashes are fully encrypted within our primary databases.</li>
                                    <li><strong>Firewalls & Isolation:</strong> Our hosting environments employ strong network firewalls and isolated database subnets to prevent unauthorized external intrusion.</li>
                                    <li><strong>Strict Access Control:</strong> Access to patient data is highly restricted and granted exclusively to authorized medical administrators and verified staff members on a need-to-know basis.</li>
                                </ul>
                            </div>

                            <div className="legal-section" id="user-rights">
                                <div className="section-title-wrap">
                                    <span className="section-num">4</span>
                                    <h2>Your Rights & Choices</h2>
                                </div>
                                <p>
                                    We fully respect your data sovereignty. As a patient registered on our platform, you have the right to:
                                </p>
                                <ul>
                                    <li><strong>Access:</strong> Review and retrieve the comprehensive personal and booking records associated with your account.</li>
                                    <li><strong>Rectification:</strong> Request corrections to any outdated or inaccurate contact details or personal profiles.</li>
                                    <li><strong>Data Erasure:</strong> Request the complete deletion or deactivation of your account and personal history, subject to statutory healthcare record retention laws.</li>
                                    <li><strong>Consent Withdrawal:</strong> Revoke consents for automated SMS alerts or promotional hospital circular emails.</li>
                                </ul>
                            </div>

                            <div className="legal-section" id="cookies">
                                <div className="section-title-wrap">
                                    <span className="section-num">5</span>
                                    <h2>Cookies & Tracking Technologies</h2>
                                </div>
                                <p>
                                    Cookies are tiny data files saved to your browser that help optimize platform performance. 
                                    We utilize cookies solely for functional purposes:
                                </p>
                                <ul>
                                    <li><strong>Session Identification:</strong> Keeping you logged in securely while you navigate different tabs.</li>
                                    <li><strong>Preference Caching:</strong> Storing user layout preferences and selected hospital departments for faster form pre-fills.</li>
                                    <li>You can disable cookies inside your browser's security settings; however, doing so will block secure login flows and prevent online appointment bookings.</li>
                                </ul>
                            </div>

                            <div className="legal-section" id="contact">
                                <div className="section-title-wrap">
                                    <span className="section-num">✉️</span>
                                    <h2>Privacy Contact & Support</h2>
                                </div>
                                <p>
                                    For any questions regarding this Privacy Policy, your patient rights, or our security protocols, 
                                    please contact our dedicated Data Protection Officer:
                                </p>
                                <div className="contact-card">
                                    <p><strong>🏥 Hospital Privacy Compliance Desk</strong></p>
                                    <p>📧 Email: <a href="mailto:astanleykevin@gmail.com">astanleykevin@gmail.com</a></p>
                                    <p>📞 Phone: +91 99944 04779 (Ext. 400)</p>
                                    <p>📍 Location: Ground Floor, Block A, Main Campus Office</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick links Sidebar */}
                        <div className="legal-sidebar">
                            <div className="card sticky-sidebar">
                                <h3>Quick Navigation</h3>
                                <ul className="sidebar-links">
                                    <li><a href="#collected">1. Data We Collect</a></li>
                                    <li><a href="#data-usage">2. How We Use Data</a></li>
                                    <li><a href="#security">3. Data Security</a></li>
                                    <li><a href="#user-rights">4. Your Rights</a></li>
                                    <li><a href="#cookies">5. Cookies Policy</a></li>
                                    <li><a href="#contact">✉️ Contact Support</a></li>
                                </ul>
                                <div className="sidebar-cta">
                                    <h4>Your Data is Safe</h4>
                                    <p>Our HIPAA-aligned platform secures all client interactions with military-grade SSL.</p>
                                    <a href="/login" className="btn secondary small-btn">Access Account</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="site-footer">
                <div className="container">
                    © {new Date().getFullYear()} Hospital Management System
                </div>
            </footer>
        </>
    );
}
