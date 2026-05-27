import { useState } from 'react';
import Navbar from '../components/Navbar';

const faqs = [
    {
        q: 'How do I book an appointment online?',
        a: 'You can book an appointment directly through our website. Log in to your account, navigate to the "Doctors" page, find your preferred specialist, and click "Book Appointment". Select your preferred date and time, fill in the required details, and confirm your booking. You will receive a confirmation notification instantly.',
    },
    {
        q: 'What should I bring to my first appointment?',
        a: 'For your first visit, please bring a valid government-issued photo ID, your health insurance card (if applicable), any relevant medical records or test reports, a list of current medications and dosages, and any referral letters from your primary physician. Arriving 15 minutes early helps with registration.',
    },
    {
        q: 'Can I cancel or reschedule my appointment?',
        a: 'Yes, you can cancel or reschedule appointments through the "My Appointments" section of your account. We request that cancellations be made at least 24 hours in advance to allow other patients to use that slot. For urgent rescheduling, please contact our helpdesk directly at our hospital phone number.',
    },
    {
        q: 'What are your hospital visiting hours?',
        a: 'General visiting hours are from 10:00 AM to 12:00 PM and 4:00 PM to 7:00 PM daily. ICU and special wards have restricted visiting hours. Visitors are limited to two per patient at a time. Please check with the nursing station for ward-specific policies. Emergency visits are permitted 24/7.',
    },
    {
        q: 'Do you accept health insurance?',
        a: 'Yes, we accept a wide range of health insurance plans including government schemes and most major private insurers. Please contact our billing department or visit the insurance desk in our main lobby to verify coverage before your appointment. Our team will help you navigate the claims process seamlessly.',
    },
    {
        q: 'How do I access my medical records?',
        a: 'Patients can request copies of their medical records through the Patient Services desk or by submitting a written request to our Medical Records department. Records are typically processed within 3–5 business days. For ongoing care, your treating physician can share records electronically with other providers with your consent.',
    },
    {
        q: 'Is emergency care available 24/7?',
        a: 'Yes, our Emergency Department operates 24 hours a day, 7 days a week, 365 days a year. We have a dedicated trauma team and fully equipped emergency facilities. For life-threatening emergencies, please call emergency services (112/911) immediately or use our Emergency Call button on the website.',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

    return (
        <>
            <Navbar />
            <main id="faq">

                {/* Hero */}
                <section className="faq-hero">
                    <div className="container faq-hero-inner">
                        <span className="about-badge">❓ Frequently Asked Questions</span>
                        <h1>Got <span className="accent">Questions?</span></h1>
                        <p>
                            Find quick answers to the most common questions about our services,
                            appointments, insurance, and more. Still need help? Reach out to us anytime.
                        </p>
                    </div>
                </section>

                {/* FAQ Accordion */}
                <section className="faq-section container">
                    <div className="faq-list">
                        {faqs.map((item, i) => (
                            <div
                                key={i}
                                className={`faq-item${openIndex === i ? ' open' : ''}`}
                                id={`faq-item-${i}`}
                            >
                                <button
                                    className="faq-question"
                                    onClick={() => toggle(i)}
                                    aria-expanded={openIndex === i}
                                    aria-controls={`faq-answer-${i}`}
                                    id={`faq-btn-${i}`}
                                >
                                    <span className="faq-q-text">{item.q}</span>
                                    <span className="faq-chevron" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                </button>
                                <div
                                    className="faq-answer"
                                    id={`faq-answer-${i}`}
                                    role="region"
                                    aria-labelledby={`faq-btn-${i}`}
                                >
                                    <div className="faq-answer-inner">
                                        <p>{item.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Still have questions CTA */}
                    <div className="faq-cta card">
                        <div className="faq-cta-icon">💬</div>
                        <h3>Still have questions?</h3>
                        <p>Our support team is available Monday–Saturday, 8 AM to 8 PM. We're happy to help!</p>
                        <div className="faq-cta-actions">
                            <a href="/contact" className="btn primary">Contact Us</a>
                            <a href="tel:+11234567890" className="btn ghost">📞 Call Now</a>
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
