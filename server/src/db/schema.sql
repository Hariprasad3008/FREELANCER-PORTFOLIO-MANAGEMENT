-- 1. USERS Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('CLIENT', 'FREELANCER', 'ADMIN')),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. FREELANCER_PROFILES Table
CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150),
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    experience_years INT DEFAULT 0,
    experience_level VARCHAR(20) DEFAULT 'MID' CHECK (experience_level IN ('JUNIOR', 'MID', 'SENIOR', 'EXPERT')),
    location VARCHAR(150),
    availability_status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'NOT_LOOKING')),
    response_time_minutes INT DEFAULT 60,
    projects_completed INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 100.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLIENT_PROFILES Table
CREATE TABLE IF NOT EXISTS client_profiles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150),
    company_location VARCHAR(150),
    company_description TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SKILLS Table
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 5. FREELANCER_SKILLS Table
CREATE TABLE IF NOT EXISTS freelancer_skills (
    freelancer_id BIGINT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (freelancer_id, skill_id)
);

-- 6. PORTFOLIO_PROJECTS Table
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    freelancer_id BIGINT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_url VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PROJECTS Table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Web Development',
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    budget_type VARCHAR(20) DEFAULT 'FIXED' CHECK (budget_type IN ('FIXED', 'HOURLY')),
    deadline DATE,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PROJECT_SKILLS Table
CREATE TABLE IF NOT EXISTS project_skills (
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

-- 9. PROPOSALS Table
CREATE TABLE IF NOT EXISTS proposals (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id BIGINT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    bid_amount DECIMAL(12,2) NOT NULL,
    estimated_days INT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_freelancer_proposal UNIQUE(project_id, freelancer_id)
);

-- 10. CONTRACTS Table
CREATE TABLE IF NOT EXISTS contracts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    proposal_id BIGINT UNIQUE REFERENCES proposals(id) ON DELETE SET NULL,
    client_id BIGINT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    freelancer_id BIGINT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    agreed_amount DECIMAL(12,2) NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. REVIEWS Table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_id BIGINT UNIQUE REFERENCES contracts(id) ON DELETE SET NULL,
    client_id BIGINT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    freelancer_id BIGINT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SAVED_PROJECTS Table
CREATE TABLE IF NOT EXISTS saved_projects (
    freelancer_id BIGINT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (freelancer_id, project_id)
);

-- 13. SAVED_FREELANCERS Table
CREATE TABLE IF NOT EXISTS saved_freelancers (
    client_id BIGINT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    freelancer_id BIGINT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (client_id, freelancer_id)
);

-- 14. CONVERSATIONS Table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. CONVERSATION_PARTICIPANTS Table
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

-- 16. MESSAGES Table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Optimal Query Performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_freelancers_user ON freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_proposals_project ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer ON contracts(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
