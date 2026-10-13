-- Create table for client funding allocations
CREATE TABLE public.client_funding_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  support_item_number TEXT NOT NULL,
  support_item_name TEXT NOT NULL,
  budget_category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  allocated_hours NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  calculated_total NUMERIC NOT NULL,
  funding_period TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_funding_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for funding allocations
CREATE POLICY "Users can view all funding allocations" 
ON public.client_funding_allocations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create funding allocations" 
ON public.client_funding_allocations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update funding allocations" 
ON public.client_funding_allocations 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete funding allocations" 
ON public.client_funding_allocations 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_client_funding_allocations_updated_at
BEFORE UPDATE ON public.client_funding_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_client_funding_allocations_client_id ON public.client_funding_allocations(client_id);
CREATE INDEX idx_client_funding_allocations_funding_period ON public.client_funding_allocations(client_id, funding_period);