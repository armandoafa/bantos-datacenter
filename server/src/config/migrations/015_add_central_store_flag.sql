-- Migration 015: Add is_central_store flag to org_structure
ALTER TABLE org_structure ADD COLUMN is_central_store TINYINT(1) DEFAULT 0;

-- Mark Tienda Central as central store for c-romel
UPDATE org_structure 
SET is_central_store = 1 
WHERE tenant_id = 'c-romel' 
  AND type = 'Manager' 
  AND (name LIKE '%Tienda Central%' OR name LIKE '%Central%');
