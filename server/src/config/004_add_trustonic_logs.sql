-- Migration to add trustonic_logs table
USE bantosprompt502301_db;

CREATE TABLE IF NOT EXISTS trustonic_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imei1 VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(100),
    operation_date DATETIME,
    operation_type VARCHAR(255),
    status VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (imei1, tenant_id)
);
