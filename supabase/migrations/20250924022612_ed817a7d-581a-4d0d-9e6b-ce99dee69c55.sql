-- Create enum for shift status
CREATE TYPE public.shift_status AS ENUM ('scheduled', 'checked_in', 'checked_out', 'missed', 'cancelled');

-- Create enum for appointment status  
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Create enum for check-in type
CREATE TYPE public.checkin_type AS ENUM ('shift', 'appointment');

-- Create staff_shifts table
CREATE TABLE public.staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    outlet_id TEXT,
    status shift_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staff_appointments table
CREATE TABLE public.staff_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    service_type TEXT,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staff_checkins table for tracking all check-ins/outs
CREATE TABLE public.staff_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL,
    checkin_type checkin_type NOT NULL,
    reference_id UUID NOT NULL, -- shift_id or appointment_id
    action TEXT NOT NULL, -- 'check_in' or 'check_out'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_accuracy DECIMAL(8, 2),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staff_locations table for real-time tracking
CREATE TABLE public.staff_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2),
    address TEXT,
    speed DECIMAL(8, 2),
    heading DECIMAL(6, 2),
    altitude DECIMAL(8, 2),
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Staff can view and manage their own shifts
CREATE POLICY "Staff can view their own shifts"
ON public.staff_shifts FOR SELECT
USING (true);

CREATE POLICY "Staff can update their own shifts"
ON public.staff_shifts FOR UPDATE
USING (true);

CREATE POLICY "Staff can create shifts"
ON public.staff_shifts FOR INSERT
WITH CHECK (true);

-- Staff can view and manage their own appointments
CREATE POLICY "Staff can view their own appointments"
ON public.staff_appointments FOR SELECT
USING (true);

CREATE POLICY "Staff can update their own appointments"
ON public.staff_appointments FOR UPDATE
USING (true);

CREATE POLICY "Staff can create appointments"
ON public.staff_appointments FOR INSERT
WITH CHECK (true);

-- Staff can create and view check-ins
CREATE POLICY "Staff can create check-ins"
ON public.staff_checkins FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can view check-ins"
ON public.staff_checkins FOR SELECT
USING (true);

-- Staff can update their own location
CREATE POLICY "Staff can update their own location"
ON public.staff_locations FOR ALL
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_staff_shifts_updated_at
    BEFORE UPDATE ON public.staff_shifts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_appointments_updated_at
    BEFORE UPDATE ON public.staff_appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_staff_shifts_staff_id ON public.staff_shifts(staff_id);
CREATE INDEX idx_staff_shifts_date ON public.staff_shifts(shift_date);
CREATE INDEX idx_staff_shifts_status ON public.staff_shifts(status);

CREATE INDEX idx_staff_appointments_staff_id ON public.staff_appointments(staff_id);
CREATE INDEX idx_staff_appointments_client_id ON public.staff_appointments(client_id);
CREATE INDEX idx_staff_appointments_date ON public.staff_appointments(appointment_date);
CREATE INDEX idx_staff_appointments_status ON public.staff_appointments(status);

CREATE INDEX idx_staff_checkins_staff_id ON public.staff_checkins(staff_id);
CREATE INDEX idx_staff_checkins_reference_id ON public.staff_checkins(reference_id);
CREATE INDEX idx_staff_checkins_timestamp ON public.staff_checkins(timestamp);

CREATE INDEX idx_staff_locations_staff_id ON public.staff_locations(staff_id);
CREATE INDEX idx_staff_locations_updated ON public.staff_locations(last_updated);

-- Enable real-time for location tracking
ALTER TABLE public.staff_locations REPLICA IDENTITY FULL;
ALTER TABLE public.staff_checkins REPLICA IDENTITY FULL;
ALTER TABLE public.staff_shifts REPLICA IDENTITY FULL;
ALTER TABLE public.staff_appointments REPLICA IDENTITY FULL;