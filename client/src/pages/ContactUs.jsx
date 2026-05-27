import { useState } from 'react';
import Navbar from '../components/Navbar';

const initialForm = { name: '', email: '', phone: '', message: '' };

function validate(form) {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full name is required.';
    if (!form.email.trim()) {
        errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address.';
    }
    if (!form.phone.trim()) {
        errors.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s\-().]{7,15}$/.test(form.phone)) {
        errors.phone = 'Please enter a valid phone number.';
    }
    if (!form.message.trim()) {
        errors.message = 'Message is required.';
    } else if (form.message.trim().length < 20) {
        errors.message = 'Message must be at least 20 characters.';
    }
    return errors;
}

export default function ContactUs() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSubmitting(true);
        // Open mailto to send message to hospital email
        const subject = encodeURIComponent(`Hospital Contact Form – ${form.name}`);
        const body = encodeURIComponent(
            `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
        );
        window.location.href = `mailto:astanleykevin@gmail.com?subject=${subject}&body=${body}`;
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 1200);
    };

    const handleReset = () => {
        setForm(initialForm);
        setErrors({});
        setSubmitted(false);
    };

    return (
        <>
            <Navbar />
            <main id="contact-us">

                {/* Hero */}
                <section className="contact-hero">
                    <div className="container contact-hero-inner">
                        <span className="about-badge">📬 Contact Us</span>
                        <h1>We'd Love to <span className="accent">Hear From You</span></h1>
                        <p>
                            Have a question, need assistance, or want to book an appointment? Reach out to
                            our team and we'll get back to you as soon as possible.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="contact-section container">
                    <div className="contact-grid">

                        {/* Contact Form */}
                        <div className="contact-form-wrapper card">
                            <h2 className="contact-form-title">Send Us a Message</h2>

                            {submitted ? (
                                <div className="contact-success">
                                    <div className="contact-success-icon">✅</div>
                                    <h3>Message Sent Successfully!</h3>
                                    <p>
                                        Thank you for reaching out. Our team will review your message and
                                        respond within 24 hours during business days.
                                    </p>
                                    <button className="btn primary" onClick={handleReset} id="send-another-btn">
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form className="contact-form" onSubmit={handleSubmit} noValidate id="contact-form">
                                    <div className="form-group">
                                        <label htmlFor="contact-name">Full Name <span className="req">*</span></label>
                                        <input
                                            type="text"
                                            id="contact-name"
                                            name="name"
                                            placeholder="John Doe"
                                            value={form.name}
                                            onChange={handleChange}
                                            className={errors.name ? 'input-error' : ''}
                                            autoComplete="name"
                                        />
                                        {errors.name && <span className="field-error">{errors.name}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="contact-email">Email Address <span className="req">*</span></label>
                                        <input
                                            type="email"
                                            id="contact-email"
                                            name="email"
                                            placeholder="john@example.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'input-error' : ''}
                                            autoComplete="email"
                                        />
                                        {errors.email && <span className="field-error">{errors.email}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="contact-phone">Phone Number <span className="req">*</span></label>
                                        <input
                                            type="tel"
                                            id="contact-phone"
                                            name="phone"
                                            placeholder="+1 (234) 567-8900"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className={errors.phone ? 'input-error' : ''}
                                            autoComplete="tel"
                                        />
                                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="contact-message">Message <span className="req">*</span></label>
                                        <textarea
                                            id="contact-message"
                                            name="message"
                                            rows={5}
                                            placeholder="Tell us how we can help you..."
                                            value={form.message}
                                            onChange={handleChange}
                                            className={errors.message ? 'input-error' : ''}
                                        />
                                        {errors.message && <span className="field-error">{errors.message}</span>}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn primary contact-submit-btn"
                                        disabled={submitting}
                                        id="contact-submit-btn"
                                    >
                                        {submitting ? (
                                            <><span className="spinner" /> Sending…</>
                                        ) : (
                                            <>📨 Send Message</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Contact Details */}
                        <div className="contact-info">
                            <div className="contact-info-card card">
                                <h2>Hospital Information</h2>

                                <div className="contact-detail-item">
                                    <div className="contact-detail-icon">📍</div>
                                    <div>
                                        <strong>Address</strong>
                                        <p>
                                            No. 121, Mudaliar Street, Loganathapuram,<br />
                                            Sundarapuram, Coimbatore,<br />
                                            Tamil Nadu – 641024<br />
                                            <span style={{ color: 'var(--muted)', fontSize: '.82rem' }}>(Near Saradha Mill)</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="contact-detail-item">
                                    <div className="contact-detail-icon">📞</div>
                                    <div>
                                        <strong>Phone Numbers</strong>
                                        <p>
                                            <a href="tel:+919500444478">+91 95004 44478</a> — General<br />
                                            <a href="tel:+919994404779">+91 99944 04779</a> — Emergency
                                        </p>
                                    </div>
                                </div>

                                <div className="contact-detail-item">
                                    <div className="contact-detail-icon">✉️</div>
                                    <div>
                                        <strong>Email</strong>
                                        <p>
                                            <a href="mailto:astanleykevin@gmail.com">astanleykevin@gmail.com</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="contact-detail-item">
                                    <div className="contact-detail-icon">🕐</div>
                                    <div>
                                        <strong>Working Hours</strong>
                                        <p>
                                            Mon – Fri: 8:00 AM – 8:00 PM<br />
                                            Saturday: 9:00 AM – 5:00 PM<br />
                                            <strong style={{ color: 'var(--success)' }}>Emergency: 24 / 7</strong>
                                        </p>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="map-section">
                        <h2 className="map-title">📍 Find Us on the Map</h2>
                        <div className="map-wrapper">
                            <iframe
                                id="hospital-map"
                                title="Hospital Location Map"
                                src="https://maps.google.com/maps?q=Sundarapuram+Coimbatore+Tamil+Nadu+641024&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="400"
                                style={{ border: 0, borderRadius: '12px' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
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
