-- Migración 03: Agregar columna apply_financing a la tabla invoices
-- Esta migración es necesaria si ya tenías la tabla invoices sin esta columna

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS apply_financing BOOLEAN DEFAULT false;

-- Crear tabla financing_payments si no existe
CREATE TABLE IF NOT EXISTS financing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_invoices_apply_financing ON invoices(apply_financing);
CREATE INDEX IF NOT EXISTS idx_financing_payments_customer_id ON financing_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_financing_payments_date ON financing_payments(date);

-- Enable RLS para financing_payments
ALTER TABLE financing_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies para financing_payments
DROP POLICY IF EXISTS "Users can view financing payments for their customers" ON financing_payments;
CREATE POLICY "Users can view financing payments for their customers"
  ON financing_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = financing_payments.customer_id 
    AND customers.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert financing payments for their customers" ON financing_payments;
CREATE POLICY "Users can insert financing payments for their customers"
  ON financing_payments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = financing_payments.customer_id 
    AND customers.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update financing payments for their customers" ON financing_payments;
CREATE POLICY "Users can update financing payments for their customers"
  ON financing_payments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = financing_payments.customer_id 
    AND customers.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete financing payments for their customers" ON financing_payments;
CREATE POLICY "Users can delete financing payments for their customers"
  ON financing_payments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = financing_payments.customer_id 
    AND customers.user_id = auth.uid()
  ));
