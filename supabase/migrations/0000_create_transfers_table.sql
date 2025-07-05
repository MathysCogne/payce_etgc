-- Create a table to store transfer information
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sender_address TEXT NOT NULL,
  recipient_phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  
  -- The unique hash sent to the recipient to claim the funds
  claim_hash TEXT NOT NULL UNIQUE,
  
  -- The transaction hash from the sender to the sponsor wallet
  initial_tx_hash TEXT,
  
  -- The transaction hash from the sponsor wallet to the recipient
  claim_tx_hash TEXT,

  -- OTP for withdrawal security
  otp_hash TEXT,
  otp_expires_at TIMESTAMPTZ,

  -- 'pending' -> 'funded' -> 'claimed'
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Add an index for faster lookups on the claim_hash
CREATE INDEX ON transfers (claim_hash); 