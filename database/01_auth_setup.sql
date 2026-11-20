-- =====================================================================
-- 01_auth_setup.sql — connect Supabase Auth logins to the staff table
-- =====================================================================
-- Run in the Supabase SQL Editor AFTER your Assignment 4 tables exist.
-- Safe to run more than once. It does not change your other tables.
--
-- What it does:
--   1. Adds staff.auth_user_id so each staff row can have one login.
--   2. Adds current_staff_id() and current_staff_role() so SQL (and RLS
--      policies) can ask "who is signed in, and what is their role?"
--   3. Turns on Row Level Security for staff so only signed-in staff can
--      read the staff list.
--
-- Roles come from the existing staff.role column, for example:
--   'Programs Lead', 'Events Lead', 'Content Owner', 'Executive Director'
-- =====================================================================


-- 1. One login per staff member -----------------------------------------
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE
  REFERENCES auth.users (id) ON DELETE SET NULL;


-- 2. Who is signed in? ---------------------------------------------------
-- auth.uid() is the signed-in user's ID inside Supabase.
-- SECURITY DEFINER lets these read staff even though staff has RLS on.
CREATE OR REPLACE FUNCTION public.current_staff_id()
RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT staff_id FROM staff WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_staff_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM staff WHERE auth_user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_staff_id()   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_staff_role() TO anon, authenticated;


-- 3. Protect the staff table --------------------------------------------
-- With RLS on, a table returns no rows unless a policy allows it.
-- Visitors (anon) and logins that are not linked to staff see nothing.
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_read_by_staff ON staff;
CREATE POLICY staff_read_by_staff ON staff
  FOR SELECT TO authenticated
  USING (public.current_staff_id() IS NOT NULL);


-- =====================================================================
-- NEXT STEPS FOR YOUR TEAM (not run by this file)
-- =====================================================================
-- Your other tables still allow anyone with the public key to read and
-- write them through the Supabase API. Decide who may do what, then add
-- RLS for each table. Patterns to adapt:
--
--   ALTER TABLE update_request ENABLE ROW LEVEL SECURITY;
--
--   -- Read: the submitter, or the owner of the related content item.
--   CREATE POLICY ... ON update_request FOR SELECT TO authenticated
--     USING (
--       submitted_by_staff_id = public.current_staff_id()
--       OR EXISTS (SELECT 1 FROM content_item c
--                  WHERE c.content_id = update_request.content_id
--                    AND c.owner_staff_id = public.current_staff_id())
--     );
--
--   -- Insert: only leads, and only as themselves.
--   CREATE POLICY ... ON update_request FOR INSERT TO authenticated
--     WITH CHECK (
--       public.current_staff_role() IN ('Programs Lead', 'Events Lead')
--       AND submitted_by_staff_id = public.current_staff_id()
--     );
--
--   -- Public content for visitors (Operation 7):
--   CREATE POLICY ... ON content_item FOR SELECT TO anon, authenticated
--     USING (is_published AND status <> 'archived');
--
-- Check each policy by signing in as different test accounts.
-- =====================================================================
