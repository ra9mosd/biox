-- Сначала убедись, что Vercel API настроен и отвечает. Затем выполни этот SQL.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations on links" ON public.links;
DROP POLICY IF EXISTS "Allow all operations on badges" ON public.badges;

DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read links" ON public.links;
DROP POLICY IF EXISTS "Public read badges" ON public.badges;

CREATE POLICY "Public read users" ON public.users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read links" ON public.links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read badges" ON public.badges FOR SELECT TO anon, authenticated USING (true);

-- Writes happen only in Vercel API after Telegram signature validation.
-- Never create public INSERT/UPDATE/DELETE policies for these tables.
