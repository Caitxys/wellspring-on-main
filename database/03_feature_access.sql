-- =====================================================================
-- 03_feature_access.sql — who can read and change the feature's tables
-- Run AFTER 01_auth_setup.sql and 02_link_test_accounts.sql.
-- Safe to run more than once.
-- =====================================================================

-- 1. Let signed-in users reach the tables the feature uses -------------
GRANT SELECT ON web_page, audience, content_audience, content_item TO authenticated;
GRANT SELECT, INSERT ON update_request TO authenticated;
GRANT UPDATE (request_status, reviewed_by_staff_id, reviewed_at) ON update_request TO authenticated;
GRANT UPDATE (body, status, last_reviewed_date, is_published) ON content_item TO authenticated;
GRANT USAGE ON SEQUENCE update_request_request_id_seq TO authenticated;

-- 2. Turn on Row Level Security ----------------------------------------
ALTER TABLE web_page         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience         ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item     ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_request   ENABLE ROW LEVEL SECURITY;

-- 3. Any signed-in staff member can read pages, audiences and content --
DROP POLICY IF EXISTS web_page_read_staff ON web_page;
CREATE POLICY web_page_read_staff ON web_page
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

DROP POLICY IF EXISTS audience_read_staff ON audience;
CREATE POLICY audience_read_staff ON audience
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

DROP POLICY IF EXISTS content_audience_read_staff ON content_audience;
CREATE POLICY content_audience_read_staff ON content_audience
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

DROP POLICY IF EXISTS content_item_read_staff ON content_item;
CREATE POLICY content_item_read_staff ON content_item
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

-- 4. Only an item's owner can change its text (Business Rule 6) --------
DROP POLICY IF EXISTS content_item_update_owner ON content_item;
CREATE POLICY content_item_update_owner ON content_item
  FOR UPDATE TO authenticated
  USING      (owner_staff_id = public.current_staff_id())
  WITH CHECK (owner_staff_id = public.current_staff_id());

-- 5. Who can read a request: the submitter, the item's owner, or the director
DROP POLICY IF EXISTS update_request_read ON update_request;
CREATE POLICY update_request_read ON update_request
  FOR SELECT TO authenticated
  USING (
    submitted_by_staff_id = public.current_staff_id()
    OR public.current_staff_role() = 'Executive Director'
    OR EXISTS (SELECT 1 FROM content_item c
               WHERE c.content_id = update_request.content_id
                 AND c.owner_staff_id = public.current_staff_id())
  );

-- 6. Who can submit: leads only, only as themselves, only as 'pending'
DROP POLICY IF EXISTS update_request_insert ON update_request;
CREATE POLICY update_request_insert ON update_request
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_staff_role() IN ('Programs Lead', 'Events Lead')
    AND submitted_by_staff_id = public.current_staff_id()
    AND request_status = 'pending'
  );

-- 7. Who can review: the item's owner, only pending requests, as themselves
DROP POLICY IF EXISTS update_request_review ON update_request;
CREATE POLICY update_request_review ON update_request
  FOR UPDATE TO authenticated
  USING (
    request_status = 'pending'
    AND EXISTS (SELECT 1 FROM content_item c
                WHERE c.content_id = update_request.content_id
                  AND c.owner_staff_id = public.current_staff_id())
  )
  WITH CHECK (
    reviewed_by_staff_id = public.current_staff_id()
    AND EXISTS (SELECT 1 FROM content_item c
                WHERE c.content_id = update_request.content_id
                  AND c.owner_staff_id = public.current_staff_id())
  );