-- Add token expiration column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

-- Add token expiration column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

-- Create index for faster expiration checks
CREATE INDEX IF NOT EXISTS idx_bookings_token_expires_at ON bookings(token_expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_token_expires_at ON subscriptions(token_expires_at);

-- Function to set token expiration when booking is created
CREATE OR REPLACE FUNCTION set_token_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Set token to expire 30 days from now
  NEW.token_expires_at = NOW() + INTERVAL '30 days';
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function on booking insert
DROP TRIGGER IF EXISTS set_booking_token_expiration ON bookings;
CREATE TRIGGER set_booking_token_expiration
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_token_expiration();

-- Trigger to call the function on subscription insert
DROP TRIGGER IF EXISTS set_subscription_token_expiration ON subscriptions;
CREATE TRIGGER set_subscription_token_expiration
  BEFORE INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_token_expiration();
