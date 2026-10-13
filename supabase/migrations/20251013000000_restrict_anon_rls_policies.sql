-- Tighten the RLS policies that were written as `USING (true)` with no `TO`
-- clause. A policy without a role list applies to PUBLIC, which includes the
-- `anon` role, so the publishable anon key on its own granted full read/write/
-- delete on every table below.
--
-- Scope note: neither frontend ever calls `supabase.auth`, so there is no
-- Supabase identity to check against. Locking every table to `authenticated`
-- would therefore break every screen. This migration only closes the tables
-- and buckets that the frontends never touch, plus read access to `documents`,
-- so no existing screen changes behaviour.
--
-- Still reachable with the anon key, and NOT fixable here: staff_shifts,
-- staff_appointments, staff_checkins, staff_locations, custom_fields and
-- field_screen_mappings. Appointments / LiveStaffDashboard / StaffTracking /
-- ManageFields read and write those with the anon key. They can only be closed
-- once those calls carry a real identity -- either by signing into Supabase
-- Auth, or by having the existing backend mint a Supabase JWT, or by moving the
-- calls behind that backend with the service_role key.
--
-- PERMISSIVE policies are OR'd together, so the old ones have to be dropped
-- rather than just superseded.

-- ---------------------------------------------------------------------------
-- client_funding_allocations -- client NDIS budgets. Never queried by either
-- frontend.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view all funding allocations" ON public.client_funding_allocations;
DROP POLICY IF EXISTS "Users can create funding allocations"   ON public.client_funding_allocations;
DROP POLICY IF EXISTS "Users can update funding allocations"   ON public.client_funding_allocations;
DROP POLICY IF EXISTS "Users can delete funding allocations"   ON public.client_funding_allocations;

CREATE POLICY "Authenticated users can manage funding allocations"
ON public.client_funding_allocations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- pricing_schedules / pricing_items -- reference price list. No supabase call
-- in either frontend references these tables.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin can manage pricing schedules" ON public.pricing_schedules;
DROP POLICY IF EXISTS "Admin can manage pricing items"     ON public.pricing_items;

CREATE POLICY "Authenticated users can manage pricing schedules"
ON public.pricing_schedules
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage pricing items"
ON public.pricing_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- documents -- client document metadata. The frontend only ever INSERTs here
-- (the cost-entry rows in Appointments.tsx), so INSERT stays open to anon
-- while reads, updates and deletes move behind authentication.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view client documents"   ON public.documents;
DROP POLICY IF EXISTS "Users can insert client documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update client documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete client documents" ON public.documents;

-- Deliberately still open to anon: Appointments.tsx writes cost entries with
-- the anon key. Narrow this once that call carries an identity.
CREATE POLICY "Clients app can insert documents"
ON public.documents
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can read documents"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (true);

-- ---------------------------------------------------------------------------
-- storage: client-documents bucket. The bucket is private and nothing in
-- either frontend calls supabase.storage, so close it to anon entirely.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view client documents in storage"   ON storage.objects;
DROP POLICY IF EXISTS "Users can upload client documents"            ON storage.objects;
DROP POLICY IF EXISTS "Users can update client documents in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete client documents in storage" ON storage.objects;

CREATE POLICY "Authenticated users can read client documents in storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'client-documents');

CREATE POLICY "Authenticated users can upload client documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Authenticated users can update client documents in storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-documents')
WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Authenticated users can delete client documents in storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-documents');
