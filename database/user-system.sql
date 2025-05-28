-- Migration for user system and analytics
-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS study_app;

-- Create tables for user management and analytics

-- Create users table
CREATE TABLE IF NOT EXISTS study_app.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'student',
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS study_app.user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES study_app.users(id),
    pregunta_id INTEGER REFERENCES study_app.preguntas(id),
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time FLOAT NOT NULL, -- Time taken to answer in seconds
    metadata JSONB, -- Additional data about the answer attempt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user analytics table
CREATE TABLE IF NOT EXISTS study_app.user_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES study_app.users(id),
    performance_metrics JSONB NOT NULL,
    learning_insights JSONB NOT NULL,
    engagement_metrics JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON study_app.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_pregunta_id ON study_app.user_progress(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_created_at ON study_app.user_progress(created_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON study_app.user_analytics(user_id);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON study_app.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON study_app.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at
    BEFORE UPDATE ON study_app.user_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
