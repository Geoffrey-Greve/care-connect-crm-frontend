-- Add actual start and end time columns to staff_appointments table
ALTER TABLE public.staff_appointments 
ADD COLUMN actual_start_time time without time zone,
ADD COLUMN actual_end_time time without time zone;