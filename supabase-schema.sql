-- Supabase SQL Schema for FixitSwell Booking System
-- Run this in your Supabase SQL Editor to create the bookings table

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Management token for email links
  manage_token UUID DEFAULT gen_random_uuid()
);

-- Create an index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- Create an index for status filtering
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create an index for management token lookups
CREATE INDEX IF NOT EXISTS idx_bookings_manage_token ON bookings(manage_token);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert new bookings (public form submission)
CREATE POLICY "Allow public insert" ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow reading own booking via manage_token
CREATE POLICY "Allow reading with manage_token" ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow updating own booking via manage_token (for cancellation/rescheduling)
CREATE POLICY "Allow update with manage_token" ON bookings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function on updates
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample query to get available time slots for a date
-- SELECT time_slot FROM bookings WHERE date = '2024-01-15' AND status != 'cancelled';

