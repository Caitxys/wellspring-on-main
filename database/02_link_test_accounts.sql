-- =====================================================================
-- 02_link_test_accounts.sql — connect Supabase logins to staff rows
-- =====================================================================
-- Run this AFTER creating the test accounts in
-- Supabase -> Authentication -> Users -> Add user.
--
-- Create each account with the SAME email as the staff row
-- (passwords are your choice and are never stored in this repo):
--   maya.okafor@wellspring-example.org     Programs Lead
--   jordan.ellis@wellspring-example.org    Content Owner
--   priya.shah@wellspring-example.org      Content Owner
--   dana.whitfield@wellspring-example.org  Executive Director
--
-- Tick "Auto Confirm User" so the accounts can sign in right away.
-- Matching is by email, so there are no user IDs to copy and paste.
-- Safe to run again after adding more accounts.
-- =====================================================================

UPDATE staff s
SET auth_user_id = u.id
FROM auth.users u
WHERE lower(u.email) = lower(s.email)
  AND s.auth_user_id IS DISTINCT FROM u.id;

-- Check: every staff member and whether they can sign in.
SELECT s.staff_id, s.full_name, s.role, s.email,
       (s.auth_user_id IS NOT NULL) AS can_sign_in
FROM staff s
ORDER BY s.staff_id;
