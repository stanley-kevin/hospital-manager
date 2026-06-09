import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const doctors = [
    { name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', exp: '15+ Years', emoji: '👩‍⚕️', bio: 'Board-certified in cardiovascular diseases with expertise in interventional cardiology.' },
    { name: 'Dr. James Patel', specialty: 'Neurologist', exp: '12+ Years', emoji: '👨‍⚕️', bio: 'Specializes in neurological disorders including epilepsy, stroke, and Parkinson\'s disease.' },
    { name: 'Dr. Aisha Nkosi', specialty: 'Pediatrician', exp: '10+ Years', emoji: '👩‍⚕️', bio: 'Dedicated to providing comprehensive care for infants, children, and adolescents.' },
    { name: 'Dr. Robert Chen', specialty: 'Orthopedic Surgeon', exp: '18+ Years', emoji: '👨‍⚕️', bio: 'Expert in joint replacement, sports injuries, and minimally invasive orthopedic procedures.' },
];

const services = [
    { icon: '❤️', title: 'Cardiology', desc: 'Advanced heart care with state-of-the-art diagnostics and treatment plans tailored to each patient.' },
    { icon: '🧠', title: 'Neurology', desc: 'Comprehensive neurological evaluations and treatments for brain and nervous system conditions.' },
    { icon: '🦷', title: 'Dental Care', desc: 'Full-service dental care including preventive, restorative, and cosmetic dentistry.' },
    { icon: '🩻', title: 'Radiology', desc: 'High-resolution imaging services including MRI, CT scans, X-rays, and ultrasound.' },
    { icon: '👶', title: 'Pediatrics', desc: 'Specialized care for children from birth through adolescence with a gentle, compassionate approach.' },
    { icon: '🏥', title: 'Emergency Care', desc: '24/7 emergency services with rapid response teams and fully equipped trauma facilities.' },
];

export default function AboutUs() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll('.scroll-reveal');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        cards.forEach(card => {
            observer.observe(card);
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <>
            <Navbar />
            <main id="about-us">

                {/* Hero Banner */}
                <section className="about-hero">
                    <div className="container about-hero-inner">
                        <span className="about-badge">🏥 About Our Hospital</span>
                        <h1>Caring for You Since <span className="accent">1995</span></h1>
                        <p>
                            We are a leading multi-specialty hospital committed to delivering world-class healthcare
                            with compassion, innovation, and excellence. Our patient-first philosophy drives
                            everything we do.
                        </p>
                        <div className="about-stats">
                            <div className="about-stat">
                                <span className="about-stat-number">30+</span>
                                <span className="about-stat-label">Years of Service</span>
                            </div>
                            <div className="about-stat">
                                <span className="about-stat-number">500+</span>
                                <span className="about-stat-label">Expert Doctors</span>
                            </div>
                            <div className="about-stat">
                                <span className="about-stat-number">1M+</span>
                                <span className="about-stat-label">Patients Treated</span>
                            </div>
                            <div className="about-stat">
                                <span className="about-stat-number">50+</span>
                                <span className="about-stat-label">Specialties</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Introduction */}
                <section className="about-intro container">
                    <div className="about-intro-grid">
                        <div className="about-intro-text">
                            <h2>Who We Are</h2>
                            <p>
                                Founded in 1995, our hospital has grown from a small community clinic into a
                                comprehensive medical center serving over a million patients annually. We provide
                                a full spectrum of medical services — from preventive care and diagnostics to
                                complex surgeries and rehabilitation.
                            </p>
                            <p style={{ marginTop: '1rem' }}>
                                Our team of more than 500 board-certified physicians, nurses, and allied health
                                professionals works collaboratively to ensure every patient receives personalized,
                                evidence-based treatment in a safe and supportive environment.
                            </p>
                        </div>
                        <div className="about-intro-image">
                            <div className="about-image-card">
                                <div className="about-image-icon">🏥</div>
                                <h3>State-of-the-Art Facility</h3>
                                <p>Our 200,000 sq ft campus houses 300+ beds, 20 operation theatres, and cutting-edge diagnostic labs.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="mission-vision">
                    <div className="container">
                        <div className="section-header">
                            <h2>Our Mission &amp; Vision</h2>
                            <p>Guided by core values that put patients at the center of everything we do.</p>
                        </div>
                        <div className="mv-grid">
                            <div className="mv-card mission">
                                <div className="mv-icon">🎯</div>
                                <h3>Our Mission</h3>
                                <p>
                                    To provide exceptional, compassionate, and affordable healthcare services to every
                                    individual, regardless of background. We strive to improve lives through innovative
                                    medical practices, continuous education, and community outreach.
                                </p>
                                <ul className="mv-list">
                                    <li>✅ Patient-centred care always</li>
                                    <li>✅ Evidence-based medicine</li>
                                    <li>✅ Continuous quality improvement</li>
                                    <li>✅ Community health empowerment</li>
                                </ul>
                            </div>
                            <div className="mv-card vision">
                                <div className="mv-icon">🔭</div>
                                <h3>Our Vision</h3>
                                <p>
                                    To be the most trusted and respected healthcare provider in the region — a beacon
                                    of excellence where patients receive world-class treatment, families find hope, and
                                    healthcare professionals grow their expertise.
                                </p>
                                <ul className="mv-list">
                                    <li>🌟 Regional leader in medical innovation</li>
                                    <li>🌟 Pioneer in digital health solutions</li>
                                    <li>🌟 Globally recognized standards of care</li>
                                    <li>🌟 Healthier communities through prevention</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experienced Doctors */}
                <section className="about-doctors container">
                    <div className="section-header">
                        <h2>Meet Our Expert Doctors</h2>
                        <p>Our world-class medical team brings decades of combined experience and a passion for healing.</p>
                    </div>
                    <div className="about-doctors-grid">
                        {doctors.map((doc) => (
                            <div key={doc.name} className="about-doc-card card">
                                <div className="about-doc-avatar">{doc.emoji}</div>
                                <div className="about-doc-badge">{doc.exp}</div>
                                <h3 className="about-doc-name">{doc.name}</h3>
                                <span className="about-doc-specialty">{doc.specialty}</span>
                                <p className="about-doc-bio">{doc.bio}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Healthcare Services */}
                <section className="about-services">
                    <div className="container">
                        <div className="section-header">
                            <h2>Our Healthcare Services</h2>
                            <p>Comprehensive medical services under one roof, delivered by specialists you can trust.</p>
                        </div>
                        <div className="services-grid">
                            {services.map((svc) => (
                                <div key={svc.title} className="service-card card">
                                    <div className="service-icon">{svc.icon}</div>
                                    <h3>{svc.title}</h3>
                                    <p>{svc.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="about-values container">
                    <div className="section-header">
                        <h2>Our Core Values</h2>
                        <p>The principles that guide every decision we make.</p>
                    </div>
                    <div className="values-grid" ref={containerRef}>
                        {[
                            { icon: '💙', title: 'Compassion', desc: 'We treat every patient with empathy, dignity, and respect.' },
                            { icon: '🔬', title: 'Innovation', desc: 'We embrace the latest technology and research to improve outcomes.' },
                            { icon: '🤝', title: 'Integrity', desc: 'We act with honesty and transparency in all patient interactions.' },
                            { icon: '🏆', title: 'Excellence', desc: 'We set the highest standards and continuously exceed expectations.' },
                            { icon: '🛡️', title: 'Trust', desc: 'We build long-term relationships by providing reliable, safe, and patient-focused healthcare services.' },
                        ].map((v) => (
                            <div key={v.title} className="value-card scroll-reveal">
                                <div className="value-icon">{v.icon}</div>
                                <h3>{v.title}</h3>
                                <p>{v.desc}</p>
                            </div>
                        ))}
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
