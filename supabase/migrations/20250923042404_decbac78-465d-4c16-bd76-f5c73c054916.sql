-- Create custom_fields table to store field definitions
CREATE TABLE public.custom_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'textarea', 'email', 'phone')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  default_value TEXT,
  placeholder_text TEXT,
  help_text TEXT,
  validation_rules JSONB DEFAULT '{}',
  options JSONB DEFAULT '[]', -- For select type fields
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_fields (admin only access)
CREATE POLICY "Admin can manage custom fields" 
ON public.custom_fields 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create field_screen_mappings table to map fields to screens
CREATE TABLE public.field_screen_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  screen_name TEXT NOT NULL,
  screen_section TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(field_id, screen_name)
);

-- Enable Row Level Security
ALTER TABLE public.field_screen_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for field_screen_mappings (admin only access)
CREATE POLICY "Admin can manage field screen mappings" 
ON public.field_screen_mappings 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_custom_fields_updated_at
BEFORE UPDATE ON public.custom_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_field_screen_mappings_updated_at
BEFORE UPDATE ON public.field_screen_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_custom_fields_active ON public.custom_fields(is_active);
CREATE INDEX idx_field_screen_mappings_screen ON public.field_screen_mappings(screen_name);
CREATE INDEX idx_field_screen_mappings_active ON public.field_screen_mappings(is_active);