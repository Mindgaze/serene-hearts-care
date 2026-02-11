-- ============================================
-- MIGRATION 2: Policies, Storage, and RBAC
-- ============================================

-- 1. Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Editor can manage all obituaries" ON public.obituaries;
DROP POLICY IF EXISTS "Admin can manage all obituaries" ON public.obituaries;
DROP POLICY IF EXISTS "Admin can manage all partners" ON public.partners;
DROP POLICY IF EXISTS "Editor can manage all partners" ON public.partners;
DROP POLICY IF EXISTS "Admin can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public can view obituary photos" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can upload obituary photos" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can update obituary photos" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can delete obituary photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can upload partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can update partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can delete partner logos" ON storage.objects;

-- 2. Fix has_role function with proper null handling
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END
$$;

COMMENT ON FUNCTION public.has_role IS 'Checks if a user has a specific role. Returns false for null user_id.';

-- 3. Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('obituary-photos', 'obituary-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies for obituary photos
CREATE POLICY "Public can view obituary photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'obituary-photos');

CREATE POLICY "Authenticated editors and admins can upload obituary photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'obituary-photos'
  AND auth.uid() IS NOT NULL
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

CREATE POLICY "Authenticated editors and admins can update obituary photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'obituary-photos'
  AND auth.uid() IS NOT NULL
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

CREATE POLICY "Authenticated editors and admins can delete obituary photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'obituary-photos'
  AND auth.uid() IS NOT NULL
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

-- 5. Storage policies for partner logos
CREATE POLICY "Public can view partner logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-logos');

CREATE POLICY "Authenticated editors and admins can upload partner logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'partner-logos'
  AND auth.uid() IS NOT NULL
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

CREATE POLICY "Authenticated editors and admins can update partner logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'partner-logos'
  AND auth.uid() IS NOT NULL
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

CREATE POLICY "Authenticated editors and admins can delete partner logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'partner-logos'
  AND auth.uid() IS NOT NULL
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

-- 6. Obituaries RLS
CREATE POLICY "Authenticated editor can manage all obituaries"
ON public.obituaries FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'editor')
);

CREATE POLICY "Authenticated admin can manage all obituaries"
ON public.obituaries FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

-- 7. Partners RLS
CREATE POLICY "Authenticated admin can manage all partners"
ON public.partners FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated editor can manage all partners"
ON public.partners FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'editor')
);

-- 8. Admin can manage user_roles
CREATE POLICY "Authenticated admin can view all roles"
ON public.user_roles FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated admin can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated admin can update roles"
ON public.user_roles FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated admin can delete roles"
ON public.user_roles FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin')
);

-- 9. Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());