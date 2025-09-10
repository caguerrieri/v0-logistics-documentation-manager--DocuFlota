-- Function to update document status based on expiration date
CREATE OR REPLACE FUNCTION update_document_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on expiration date
  IF NEW.expiration_date IS NOT NULL THEN
    IF NEW.expiration_date < CURRENT_DATE THEN
      NEW.status = 'expired';
    ELSIF NEW.expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      NEW.status = 'expiring';
    ELSE
      NEW.status = 'valid';
    END IF;
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update document status
CREATE TRIGGER update_document_status_trigger
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_status();

-- Function to create alerts for expiring documents
CREATE OR REPLACE FUNCTION create_expiration_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create alerts for documents with expiration dates
  IF NEW.expiration_date IS NOT NULL THEN
    -- Create 30-day alert
    INSERT INTO public.alerts (company_id, document_id, alert_type, alert_date)
    VALUES (NEW.company_id, NEW.id, '30_days', NEW.expiration_date - INTERVAL '30 days')
    ON CONFLICT DO NOTHING;
    
    -- Create 15-day alert
    INSERT INTO public.alerts (company_id, document_id, alert_type, alert_date)
    VALUES (NEW.company_id, NEW.id, '15_days', NEW.expiration_date - INTERVAL '15 days')
    ON CONFLICT DO NOTHING;
    
    -- Create 7-day alert
    INSERT INTO public.alerts (company_id, document_id, alert_type, alert_date)
    VALUES (NEW.company_id, NEW.id, '7_days', NEW.expiration_date - INTERVAL '7 days')
    ON CONFLICT DO NOTHING;
    
    -- Create expired alert
    INSERT INTO public.alerts (company_id, document_id, alert_type, alert_date)
    VALUES (NEW.company_id, NEW.id, 'expired', NEW.expiration_date)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create alerts when documents are inserted or updated
CREATE TRIGGER create_expiration_alerts_trigger
  AFTER INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION create_expiration_alerts();

-- Function to handle new user signup and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
