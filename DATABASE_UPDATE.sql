-- Crear tabla de Cotizaciones
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    quote_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    valid_until DATE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    itbis NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de Items de Cotizaciones
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seguridad (RLS) - Activar
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas para quotes
CREATE POLICY "Users can manage their own quotes"
    ON public.quotes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para quote_items
-- Permite acceder a los items si la cotización pertenece al usuario
CREATE POLICY "Users can manage their own quote items"
    ON public.quote_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_items.quote_id
            AND quotes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_items.quote_id
            AND quotes.user_id = auth.uid()
        )
    );
