-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-documents', 'client-documents', false);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cost_entry_id UUID,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view client documents"
ON public.documents
FOR SELECT
USING (true);

CREATE POLICY "Users can insert client documents"
ON public.documents
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update client documents"
ON public.documents
FOR UPDATE
USING (true);

CREATE POLICY "Users can delete client documents"
ON public.documents
FOR DELETE
USING (true);

-- Create storage policies for client documents
CREATE POLICY "Users can view client documents in storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-documents');

CREATE POLICY "Users can upload client documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Users can update client documents in storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'client-documents');

CREATE POLICY "Users can delete client documents in storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'client-documents');

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();