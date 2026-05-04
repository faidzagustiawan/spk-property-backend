CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decision_case (
    case_id SERIAL PRIMARY KEY,
    user_id INT,
    case_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_step INT DEFAULT 1, -- Kolom baru untuk tracking progress UI
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE criteria (
    criteria_id SERIAL PRIMARY KEY,
    case_id INT,
    criteria_name VARCHAR(100),
    criteria_type VARCHAR(20),
    weight FLOAT,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id)
);

CREATE TABLE alternatives (
    alternative_id SERIAL PRIMARY KEY,
    case_id INT,
    alternative_name VARCHAR(100),
    description TEXT,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id)
);

CREATE TABLE alternative_values (
    value_id SERIAL PRIMARY KEY,
    alternative_id INT,
    criteria_id INT,
    value FLOAT,
    FOREIGN KEY (alternative_id) REFERENCES alternatives(alternative_id),
    FOREIGN KEY (criteria_id) REFERENCES criteria(criteria_id)
);



CREATE TABLE criteria_comparisons (
    comparison_id SERIAL PRIMARY KEY,
    case_id INT,
    criteria_1 INT,
    criteria_2 INT,
    comparison_value FLOAT,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id),
    FOREIGN KEY (criteria_1) REFERENCES criteria(criteria_id),
    FOREIGN KEY (criteria_2) REFERENCES criteria(criteria_id)
);

CREATE TABLE results (
    result_id SERIAL PRIMARY KEY,
    case_id INT,
    alternative_id INT,
    method VARCHAR(20),
    score FLOAT,
    ranking INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id),
    FOREIGN KEY (alternative_id) REFERENCES alternatives(alternative_id)
);

-- =========================
-- MACHINE LEARNING TABLES
-- =========================

CREATE TABLE ml_models (
    model_id SERIAL PRIMARY KEY,
    case_id INT,
    model_name VARCHAR(100),
    algorithm VARCHAR(50),
    accuracy FLOAT,
    model_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id)
);

CREATE TABLE ml_training_data (
    training_id SERIAL PRIMARY KEY,
    case_id INT,
    alternative_id INT,
    features JSONB,
    label FLOAT,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id),
    FOREIGN KEY (alternative_id) REFERENCES alternatives(alternative_id)
);

CREATE TABLE ml_predictions (
    prediction_id SERIAL PRIMARY KEY,
    case_id INT,
    alternative_id INT,
    model_id INT,
    predicted_score FLOAT,
    predicted_rank INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id),
    FOREIGN KEY (alternative_id) REFERENCES alternatives(alternative_id),
    FOREIGN KEY (model_id) REFERENCES ml_models(model_id)
);

CREATE TABLE alternative_comparisons (
    alt_comparison_id SERIAL PRIMARY KEY,
    case_id INT,
    criteria_id INT,
    alternative_1 INT,
    alternative_2 INT,
    comparison_value FLOAT,
    FOREIGN KEY (case_id) REFERENCES decision_case(case_id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES criteria(criteria_id) ON DELETE CASCADE,
    FOREIGN KEY (alternative_1) REFERENCES alternatives(alternative_id) ON DELETE CASCADE,
    FOREIGN KEY (alternative_2) REFERENCES alternatives(alternative_id) ON DELETE CASCADE
);