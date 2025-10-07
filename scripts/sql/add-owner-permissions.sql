-- Script để thêm permissions cho OWNER role

-- 1. Lấy roleId của OWNER
SELECT id FROM "Role" WHERE name = 'OWNER';
-- Giả sử OWNER có id = 3

-- 2. Tạo permissions cần thiết cho OWNER
INSERT INTO "Permission" (name, path, method, module, description, "createdAt", "updatedAt")
VALUES 
  ('Get My Venue Owner', '/venue-owner/me', 'GET', 'venue-owner', 'Get current user venue owner info', NOW(), NOW()),
  ('Create Venue Owner', '/venue-owner', 'POST', 'venue-owner', 'Create venue owner', NOW(), NOW()),
  ('Update Venue Owner', '/venue-owner/:id', 'PUT', 'venue-owner', 'Update venue owner', NOW(), NOW()),
  ('Delete Venue Owner', '/venue-owner/:id', 'DELETE', 'venue-owner', 'Delete venue owner', NOW(), NOW()),
  
  ('List Courts', '/court', 'GET', 'court', 'List all courts', NOW(), NOW()),
  ('Get Court', '/court/:id', 'GET', 'court', 'Get court details', NOW(), NOW()),
  ('Create Court', '/court', 'POST', 'court', 'Create new court', NOW(), NOW()),
  ('Update Court', '/court/:id', 'PUT', 'court', 'Update court', NOW(), NOW()),
  ('Delete Court', '/court/:id', 'DELETE', 'court', 'Delete court', NOW(), NOW()),
  
  ('Get Sports', '/sport', 'GET', 'sport', 'Get all sports', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3. Gắn permissions vào OWNER role (id = 3)
-- Lấy permission IDs
WITH perm_ids AS (
  SELECT id FROM "Permission" 
  WHERE path IN ('/venue-owner/me', '/venue-owner', '/venue-owner/:id', '/court', '/court/:id', '/sport')
  AND "deletedAt" IS NULL
)
INSERT INTO "_PermissionToRole" ("A", "B")
SELECT p.id, 3 FROM perm_ids p
ON CONFLICT DO NOTHING;

-- 4. Verify
SELECT p.name, p.path, p.method 
FROM "Permission" p
JOIN "_PermissionToRole" pr ON p.id = pr."A"
WHERE pr."B" = 3 AND p."deletedAt" IS NULL;
