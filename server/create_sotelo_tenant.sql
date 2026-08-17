USE bantosprompt502301_db;

-- ========================================================
-- Script para crear y habilitar el tenant 'sotelo'
-- Gestionado por el usuario: armando.afa
-- ========================================================

-- 1. Registrar el tenant 'sotelo' en la tabla de tenants con credenciales de Upya
INSERT INTO tenants (tenant_id, upya_user, upya_pass) 
VALUES ('sotelo', 'armando.afa', '123456!')
ON DUPLICATE KEY UPDATE upya_user = 'armando.afa', upya_pass = '123456!';

-- 2. Crear o actualizar el usuario 'armando.afa' asignado al tenant 'sotelo'
INSERT INTO users (upya_id, tenant_id, username, password, contact_name, email, role)
VALUES (
    'upya-armando-afa', 
    'sotelo', 
    'armando.afa', 
    '$2b$10$QOjognW9MUB7tbBOdTDawOzk8TASR3o.7K0NlYvNh9AW0/jmb7.Gq', -- password por defecto hash
    'Armando AFA', 
    'armando.afa@bantos.cloud', 
    'admin'
)
ON DUPLICATE KEY UPDATE tenant_id = 'sotelo', role = 'admin';

-- 3. Asociar permisos y scopes de administración para 'sotelo'
INSERT IGNORE INTO user_scopes (user_id, org_id, role, tenant_id)
SELECT id, 1, 'ADMIN', 'sotelo' 
FROM users 
WHERE username = 'armando.afa';

SELECT 'Tenant sotelo registrado y habilitado para armando.afa con éxito' AS resultado;
