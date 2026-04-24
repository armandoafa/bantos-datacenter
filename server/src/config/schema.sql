-- Bantos Cloud UI Services - Schema

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    upya_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'agent',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    process_type VARCHAR(100) NOT NULL, -- e.g., 'CLIENT_CREATE', 'CONTRACT_ACTIVATE'
    process_id VARCHAR(255), -- ID from Upya
    detail JSON, -- Full payload or response detail
    status VARCHAR(50), -- 'SUCCESS', 'FAILED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS client_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(50),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contract_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255) UNIQUE,
    client_id VARCHAR(255),
    product_name VARCHAR(255),
    total_value DECIMAL(15, 2),
    paid_value DECIMAL(15, 2),
    status VARCHAR(50),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255) UNIQUE,
    serial_number VARCHAR(255),
    model VARCHAR(255),
    status VARCHAR(50),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    reference VARCHAR(100),
    is_lockable BOOLEAN DEFAULT FALSE,
    manufacturer VARCHAR(255),
    is_serialized BOOLEAN DEFAULT TRUE,
    tac VARCHAR(100),
    build VARCHAR(100),
    default_managed_by VARCHAR(255),
    description TEXT,
    picture_url VARCHAR(500),
    base_value DECIMAL(15, 2),
    entity_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
