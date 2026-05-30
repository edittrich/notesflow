-- Drop existing public users select policy
DROP POLICY IF EXISTS "Allow read access to public users" ON public.users;

-- Create restricted select policy
CREATE POLICY "Allow read access to public users" ON public.users
  FOR SELECT USING (auth.uid() = id);
