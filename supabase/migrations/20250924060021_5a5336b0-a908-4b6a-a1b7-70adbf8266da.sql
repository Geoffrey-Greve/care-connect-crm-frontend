-- Update pricing_schedules to support all funding periods
ALTER TABLE pricing_schedules 
ADD COLUMN applies_to_all_periods boolean DEFAULT false,
ADD COLUMN funding_period_type text DEFAULT 'year_based';

-- Update the existing schedules to be available for all periods
UPDATE pricing_schedules 
SET applies_to_all_periods = true, 
    funding_period_type = 'universal'
WHERE is_active = true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pricing_schedules_funding_period ON pricing_schedules(applies_to_all_periods, funding_period_type);

-- Add comment to clarify the new fields
COMMENT ON COLUMN pricing_schedules.applies_to_all_periods IS 'When true, this pricing schedule applies to all funding periods';
COMMENT ON COLUMN pricing_schedules.funding_period_type IS 'Type of funding period: year_based, universal, or custom';