-- =====================================================
-- CREATING YOUR FIRST ADMIN USER
-- =====================================================
--
-- This SQL script helps you grant admin privileges to a user.
--
-- INSTRUCTIONS:
-- 1. First, create a regular user account through the signup page
-- 2. Find the user's ID from auth.users table
-- 3. Replace 'YOUR_USER_ID_HERE' below with the actual user ID
-- 4. Run this query in your Supabase SQL Editor
--
-- =====================================================

-- Step 1: View all users to find the user ID
-- Uncomment the line below to see all users:
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Step 2: Grant admin role to a specific user
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from the query above
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify the admin role was granted
-- Uncomment the line below to verify:
-- SELECT u.email, ur.role
-- FROM auth.users u
-- JOIN public.user_roles ur ON u.id = ur.user_id
-- WHERE ur.role = 'admin';

-- =====================================================
-- EXAMPLE USAGE:
-- =====================================================
-- If your user ID is: 123e4567-e89b-12d3-a456-426614174000
-- Then run:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
-- =====================================================

-- =====================================================
-- REMOVING ADMIN ACCESS (if needed)
-- =====================================================
-- To remove admin privileges from a user:
--
-- DELETE FROM public.user_roles
-- WHERE user_id = 'YOUR_USER_ID_HERE' AND role = 'admin';
-- =====================================================
