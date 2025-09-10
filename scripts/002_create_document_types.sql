-- Create document types/categories
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vehicle', 'personnel', 'company')),
  requires_expiration BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default document types
INSERT INTO public.document_types (name, category, requires_expiration, description) VALUES
-- Vehicle documents
('Seguro Vehicular', 'vehicle', true, 'Póliza de seguro del vehículo'),
('VTV', 'vehicle', true, 'Verificación Técnica Vehicular'),
('Patente', 'vehicle', true, 'Registro de patente del vehículo'),
('Habilitación Municipal', 'vehicle', true, 'Habilitación municipal para transporte'),
('RUTA', 'vehicle', true, 'Registro Único de Transporte Automotor'),

-- Personnel documents
('Licencia de Conducir', 'personnel', true, 'Licencia de conducir vigente'),
('Carnet Psicofísico', 'personnel', true, 'Examen psicofísico para conductores'),
('Curso de Manejo Defensivo', 'personnel', true, 'Certificado de manejo defensivo'),
('Seguro de Vida', 'personnel', true, 'Póliza de seguro de vida'),
('Examen Médico', 'personnel', true, 'Examen médico ocupacional'),

-- Company documents
('Habilitación Comercial', 'company', true, 'Habilitación para actividad comercial'),
('AFIP Constancia', 'company', true, 'Constancia de inscripción AFIP'),
('Seguro Responsabilidad Civil', 'company', true, 'Seguro de responsabilidad civil');

-- Enable RLS
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

-- RLS Policy - document types are readable by all authenticated users
CREATE POLICY "Authenticated users can view document types" ON public.document_types
  FOR SELECT USING (auth.role() = 'authenticated');
