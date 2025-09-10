-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES public.document_types(id),
  
  -- Reference to entity (vehicle, personnel, or company)
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  
  -- Document details
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  
  -- Document metadata
  issue_date DATE,
  expiration_date DATE,
  document_number TEXT,
  issuer TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired', 'invalid')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure document belongs to either vehicle, personnel, or company (not multiple)
  CONSTRAINT check_single_entity CHECK (
    (vehicle_id IS NOT NULL AND personnel_id IS NULL) OR
    (vehicle_id IS NULL AND personnel_id IS NOT NULL) OR
    (vehicle_id IS NULL AND personnel_id IS NULL)
  )
);

-- Create alerts table for expiration notifications
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('30_days', '15_days', '7_days', 'expired')),
  alert_date DATE NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client document requirements table
CREATE TABLE IF NOT EXISTS public.client_document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES public.document_types(id),
  required BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, document_type_id)
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_document_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view documents in their company" ON public.documents
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage documents in their company" ON public.documents
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for alerts
CREATE POLICY "Users can view alerts in their company" ON public.alerts
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage alerts in their company" ON public.alerts
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for client document requirements
CREATE POLICY "Users can view client requirements in their company" ON public.client_document_requirements
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage client requirements in their company" ON public.client_document_requirements
  FOR ALL USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );
