import Navbar from '../components/Navbar';

export default function TermsConditions() {
    return (
        <>
            <Navbar />
            <main id="terms-page" className="legal-page">
                {/* Hero section */}
                <section className="legal-hero">
                    <div className="container legal-hero-inner">
                        <span className="legal-badge">📄 Legal Agreements</span>
                        <h1>Terms & <span className="accent">Conditions</span></h1>
                        <p className="legal-subtitle">
                            Please read these Terms & Conditions carefully before using the Hospital Appointment Booking System. 
                            By accessing or using our services, you agree to be bound by these terms.
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
                                    Welcome to the Hospital Appointment Booking System. These terms and conditions govern your use of our 
                                    online platform, including booking, cancelling, or managing medical appointments with our specialists. 
                                    Our goal is to provide a seamless, efficient, and secure healthcare management experience.
                                </p>
                            </div>

                            <hr className="legal-divider" />

                            <div className="legal-section" id="acceptance">
                                <div className="section-title-wrap">
                                    <span className="section-num">1</span>
                                    <h2>Acceptance of Terms</h2>
                                </div>
                                <p>
                                    By registering an account, booking an appointment, or interacting with any feature of our website, 
                                    you represent that you have read, understood, and agreed to be legally bound by these Terms & Conditions 
                                    and our Privacy Policy. If you do not agree to these terms, you must refrain from using the platform immediately.
                                </p>
                            </div>

                            <div className="legal-section" id="responsibilities">
                                <div className="section-title-wrap">
                                    <span className="section-num">2</span>
                                    <h2>User Responsibilities & Accounts</h2>
                                </div>
                                <p>
                                    To access appointment scheduling features, you are required to create a personalized patient account. 
                                    As an account holder, you agree to:
                                </p>
                                <ul>
                                    <li>Provide complete, accurate, and up-to-date personal details, contact information, and medical histories.</li>
                                    <li>Maintain the absolute confidentiality of your account login credentials (email and password).</li>
                                    <li>Be entirely responsible for all activities and bookings occurring under your account.</li>
                                    <li>Promptly notify our administration of any suspicious or unauthorized access to your account.</li>
                                    <li>Treat all hospital staff, nurses, and medical professionals with respect, dignity, and courtesy.</li>
                                </ul>
                            </div>

                            <div className="legal-section" id="booking-rules">
                                <div className="section-title-wrap">
                                    <span className="section-num">3</span>
                                    <h2>Appointment Booking Rules</h2>
                                </div>
                                <p>
                                    Our digital platform facilitates connections between patients and qualified healthcare specialists. 
                                    By booking an appointment, you acknowledge the following regulations:
                                </p>
                                <ul>
                                    <li>Appointments are subject to real-time doctor availability and department scheduling constraints.</li>
                                    <li>Patients should select the medical department corresponding to their primary symptoms.</li>
                                    <li>To ensure fair access to care for all patients, accounts are restricted from holding multiple active bookings with the same specialist at the same time.</li>
                                    <li>The hospital reserves the right to reschedule or reassign appointments due to unforeseen medical emergencies or clinical schedule shifts.</li>
                                </ul>
                            </div>

                            <div className="legal-section" id="cancellations">
                                <div className="section-title-wrap">
                                    <span className="section-num">4</span>
                                    <h2>Cancellation & Rescheduling Policy</h2>
                                </div>
                                <p>
                                    We value the time of both our patients and medical practitioners. In order to optimize appointment availability:
                                </p>
                                <ul>
                                    <li>If you need to cancel or reschedule your slot, you must do so at least <strong>24 hours prior</strong> to the scheduled appointment time.</li>
                                    <li>Cancellations can be performed easily through the "My Appointments" panel in your dashboard.</li>
                                    <li>Failure to attend a booked appointment without prior cancellation (a "No-Show") three consecutive times may result in temporary suspension of online booking privileges.</li>
                                </ul>
                            </div>

                            <div className="legal-section highlight-danger" id="emergency">
                                <div className="section-title-wrap">
                                    <span className="section-num">🚨</span>
                                    <h2>CRITICAL: Emergency Medical Disclaimer</h2>
                                </div>
                                <p className="danger-text">
                                    <strong>THIS WEBSITE AND ONLINE BOOKING SYSTEM IS NOT TO BE USED FOR EMERGENCY MEDICAL CONDITIONS.</strong> 
                                </p>
                                <p>
                                    If you are experiencing a life-threatening medical emergency (such as severe chest pain, sudden breathing difficulties, 
                                    uncontrolled bleeding, severe trauma, or stroke symptoms), please:
                                </p>
                                <ol>
                                    <li>Dial your local emergency medical services (e.g., 112, 108, or 911) immediately.</li>
                                    <li>Go directly to the nearest hospital Emergency Room (ER) or Casualty department.</li>
                                    <li>Click our website's floating <strong>Emergency Call</strong> button to directly contact our trauma desk.</li>
                                </ol>
                                <p>
                                    Online bookings are strictly reserved for routine checkups, elective consultations, and non-emergency appointments.
                                </p>
                            </div>
                        </div>

                        {/* Quick links Sidebar */}
                        <div className="legal-sidebar">
                            <div className="card sticky-sidebar">
                                <h3>Quick Navigation</h3>
                                <ul className="sidebar-links">
                                    <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                                    <li><a href="#responsibilities">2. User Responsibilities</a></li>
                                    <li><a href="#booking-rules">3. Appointment Rules</a></li>
                                    <li><a href="#cancellations">4. Cancellation Policy</a></li>
                                    <li><a href="#emergency" className="text-danger">🚨 Emergency Disclaimer</a></li>
                                </ul>
                                <div className="sidebar-cta">
                                    <h4>Need Clarification?</h4>
                                    <p>Our administration desk is here to assist you with any legal or platform questions.</p>
                                    <a href="/contact" className="btn primary small-btn">Contact Helpdesk</a>
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
