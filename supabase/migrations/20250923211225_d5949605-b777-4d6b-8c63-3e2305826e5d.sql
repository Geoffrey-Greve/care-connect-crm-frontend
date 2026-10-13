-- Create pricing_schedules table to store different years/periods
CREATE TABLE public.pricing_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_name TEXT NOT NULL,
  year_period TEXT NOT NULL, -- e.g., "2024-2025", "2025-2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing_items table to store NDIS support items with pricing by schedule
CREATE TABLE public.pricing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_schedule_id UUID NOT NULL REFERENCES pricing_schedules(id) ON DELETE CASCADE,
  support_item_number TEXT NOT NULL,
  support_item_name TEXT NOT NULL,
  registration_group_number TEXT,
  registration_group_name TEXT,
  support_category_number TEXT,
  support_category_name TEXT,
  unit TEXT NOT NULL,
  price_act DECIMAL(10,2),
  price_nsw DECIMAL(10,2),
  price_nt DECIMAL(10,2),
  price_qld DECIMAL(10,2),
  price_sa DECIMAL(10,2),
  price_tas DECIMAL(10,2),
  price_vic DECIMAL(10,2),
  price_wa DECIMAL(10,2),
  price_remote DECIMAL(10,2),
  price_very_remote DECIMAL(10,2),
  quote_required BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pricing_schedule_id, support_item_number)
);

-- Enable Row Level Security
ALTER TABLE public.pricing_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage pricing schedules" 
ON public.pricing_schedules 
FOR ALL 
USING (true);

CREATE POLICY "Admin can manage pricing items" 
ON public.pricing_items 
FOR ALL 
USING (true);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_pricing_schedules_updated_at
BEFORE UPDATE ON public.pricing_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_items_updated_at
BEFORE UPDATE ON public.pricing_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for 2024-2025 and 2025-2026 pricing schedules
INSERT INTO public.pricing_schedules (schedule_name, year_period, start_date, end_date, is_active) VALUES
('NDIS Support Catalogue 2024-25', '2024-2025', '2024-07-01', '2025-06-30', false),
('NDIS Support Catalogue 2025-26', '2025-2026', '2025-07-01', '2026-06-30', true);

-- Insert sample pricing items for both years
WITH schedule_2024 AS (
  SELECT id FROM pricing_schedules WHERE year_period = '2024-2025'
),
schedule_2025 AS (
  SELECT id FROM pricing_schedules WHERE year_period = '2025-2026'
)
INSERT INTO public.pricing_items (
  pricing_schedule_id, support_item_number, support_item_name, 
  registration_group_name, support_category_name, unit,
  price_act, price_nsw, price_qld, price_vic, price_remote, price_very_remote
) VALUES
-- 2024-2025 pricing (slightly lower)
((SELECT id FROM schedule_2024), '01_011_0107_1_1', 'Assistance With Self-Care Activities - Standard - Weekday Daytime', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 68.50, 68.50, 68.50, 68.50, 95.90, 102.75),
((SELECT id FROM schedule_2024), '01_004_0107_1_1', 'Assistance with Personal Domestic Activities', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 57.60, 57.60, 57.60, 57.60, 80.64, 86.38),
((SELECT id FROM schedule_2024), '01_019_0120_1_1', 'House or Yard Maintenance', 'Household Tasks', 'Assistance with Daily Life', 'H', 55.50, 55.50, 55.50, 55.50, 77.70, 83.25),
((SELECT id FROM schedule_2024), '02_001_0103_2_2', 'Support Coordination', 'Support Coordination', 'Capacity Building', 'H', 189.00, 189.00, 189.00, 189.00, 264.60, 283.50),

-- 2025-2026 pricing (current)
((SELECT id FROM schedule_2025), '01_011_0107_1_1', 'Assistance With Self-Care Activities - Standard - Weekday Daytime', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 70.23, 70.23, 70.23, 70.23, 98.32, 105.35),
((SELECT id FROM schedule_2025), '01_004_0107_1_1', 'Assistance with Personal Domestic Activities', 'Daily Personal Activities', 'Assistance with Daily Life', 'H', 59.06, 59.06, 59.06, 59.06, 82.68, 88.59),
((SELECT id FROM schedule_2025), '01_019_0120_1_1', 'House or Yard Maintenance', 'Household Tasks', 'Assistance with Daily Life', 'H', 56.98, 56.98, 56.98, 56.98, 79.77, 85.47),
((SELECT id FROM schedule_2025), '01_020_0120_1_1', 'House Cleaning And Other Household Activities', 'Household Tasks', 'Assistance with Daily Life', 'H', 58.03, 58.03, 58.03, 58.03, 81.24, 87.05),
((SELECT id FROM schedule_2025), '02_001_0103_2_2', 'Support Coordination', 'Support Coordination', 'Capacity Building', 'H', 193.99, 193.99, 193.99, 193.99, 271.59, 291.99),
((SELECT id FROM schedule_2025), '02_002_0115_2_2', 'Group Activities', 'Community Participation', 'Capacity Building', 'H', 8.39, 8.39, 8.39, 8.39, 11.75, 12.59),
((SELECT id FROM schedule_2025), '03_015_0136_6_3', 'Assistive Technology', 'Assistive Technology', 'Capital', 'EA', 1.00, 1.00, 1.00, 1.00, 1.00, 1.00);