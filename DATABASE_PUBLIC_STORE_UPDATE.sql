-- =========================================================
-- PARTE 1: AGREGAR CAMPO DE VISIBILIDAD A PRODUCTOS
-- =========================================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- =========================================================
-- PARTE 2: ABRIR LA LECTURA AL PÚBLICO EN GENERAL (STOREFRONT)
-- =========================================================
-- Esta política permite que CUALQUIER USUARIO DEL MUNDO (anónimo o no) pueda VER productos
-- ÚNICA y exclusivamente si han sido marcados con is_public = true por el dueño.

CREATE POLICY "Los visitantes pueden ver productos públicos" 
    ON public.products 
    FOR SELECT 
    USING (is_public = true);

-- Si la tabla auth.users tiene políticas estrictas ligadas a productos, tal vez sea necesario evitar que
-- la consulta public pida ver información de dueños, pero con la política anterior,
-- solo podrán consultar lo básico de products y nada de perfiles cruzados a menos que se les dé acceso.

-- Asegurémonos de refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
