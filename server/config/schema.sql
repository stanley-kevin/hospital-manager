-- Hospital Appointment System – PostgreSQL Schema
-- Run via: psql -U postgres -d hospitalappoint -f config/schema.sql
-- Or automatically by seed.js

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    firebase_uid    VARCHAR(255) UNIQUE,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    role            VARCHAR(50)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    phone           VARCHAR(50),
    password        VARCHAR(255) DEFAULT 'firebase-managed',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    specialty       VARCHAR(100) NOT NULL CHECK (specialty IN (
                        'Cardiology','Orthopedics','Dermatology','Neurology',
                        'Pediatrics','General Medicine','Gynecology','ENT'
                    )),
    designation     VARCHAR(255),
    location        VARCHAR(255) NOT NULL,
    experience      VARCHAR(100) DEFAULT '5+ years',
    availability    VARCHAR(100) DEFAULT 'Mon–Fri',
    rating          NUMERIC(3,1) DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    bio             TEXT,
    photo_url       TEXT,
    initials        VARCHAR(10),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty     ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_is_available  ON doctors(is_available);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id                  SERIAL PRIMARY KEY,
    patient_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_firebase_uid VARCHAR(255),
    patient_name        VARCHAR(255) NOT NULL,
    patient_phone       VARCHAR(50)  NOT NULL,
    doctor_id           INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    doctor_name         VARCHAR(255) NOT NULL,
    specialty           VARCHAR(100),
    date                DATE NOT NULL,
    time                TIME NOT NULL,
    reason              TEXT,
    notes               TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','cancelled','completed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appt_patient_id          ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appt_patient_firebase_uid ON appointments(patient_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_appt_doctor_id           ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appt_date_status         ON appointments(date, status);
