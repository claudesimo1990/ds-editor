-- =====================================================
-- Create Admin User Script
-- =====================================================
-- Run this script after the main installation to create your first admin user
-- Replace the UUID with your actual user ID from auth.users

-- First, you need to sign up a user through the normal Supabase Auth flow
-- Then get the user ID from auth.users table and replace it below

-- Example: Get your user ID after signing up
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users
INSERT INTO dde_admin_users (user_id, role, is_active, created_by)
VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- Replace with actual user ID
  'admin',
  true,
  'YOUR_USER_ID_HERE'::uuid   -- Same user ID as creator
);

-- Verify the admin user was created
SELECT 
  au.id,
  au.user_id,
  au.role,
  au.is_active,
  u.email
FROM dde_admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE au.user_id = 'YOUR_USER_ID_HERE'::uuid;

-- Test the admin function
SELECT is_dde_admin('YOUR_USER_ID_HERE'::uuid) as is_admin;