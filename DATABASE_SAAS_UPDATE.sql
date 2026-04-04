-- Actualización del Módulo Multi-Empresa (SaaS Profile)

-- Añadiendo campos comerciales obligatorios a la tabla de perfiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Establecer RLS si no estaba activado (por si acaso)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Solución a la Violación de RLS durante el registro (Sign Up)
-- Debemos asegurarnos de que el trigger que crea el perfil tenga SECURITY DEFINER
-- para que pueda ejecutarse con permisos de administrador en el fondo, burlando la limitación de Auth ("anon").
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'businessName', new.raw_user_meta_data->>'business_name', 'Nuevo Negocio'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aseguramos que el trigger esté en su lugar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Políticas RLS forzadas limpiamente
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
