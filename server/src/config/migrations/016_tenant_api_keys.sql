-- Migration 016: Create tenant_api_keys table for third-party API integration
CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(100) NOT NULL UNIQUE,
    api_secret_hash VARCHAR(255) NOT NULL,
    scopes TEXT DEFAULT NULL,
    status ENUM('active', 'revoked') DEFAULT 'active',
    created_by_user_id INT NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
