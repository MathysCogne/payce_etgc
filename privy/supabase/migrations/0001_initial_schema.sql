-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_did TEXT NOT NULL UNIQUE,
  phone_number TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transactions Table
CREATE TYPE transaction_status AS ENUM ('pending', 'claimed', 'expired');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT UNIQUE NOT NULL,
  sender_did TEXT NOT NULL REFERENCES users(privy_did),
  recipient_phone_number TEXT NOT NULL,
  recipient_did TEXT REFERENCES users(privy_did), -- Will be null until claimed
  amount NUMERIC(20, 6) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_transactions_recipient_phone_number ON transactions(recipient_phone_number);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow users to view their own data
CREATE POLICY "Allow individual user access" ON users FOR SELECT USING (auth.jwt()->>'sub' = privy_did);
-- Allow users to insert their own data
CREATE POLICY "Allow individual user insert" ON users FOR INSERT WITH CHECK (auth.jwt()->>'sub' = privy_did);

-- Allow users to view transactions they sent or received
CREATE POLICY "Allow user to view their transactions" ON transactions FOR SELECT USING (auth.jwt()->>'sub' = sender_did OR auth.jwt()->>'sub' = recipient_did);
-- Allow users to insert transactions they are sending
CREATE POLICY "Allow user to insert their transactions" ON transactions FOR INSERT WITH CHECK (auth.jwt()->>'sub' = sender_did);
-- Allow users to update transactions to claimed
CREATE POLICY "Allow user to claim their transactions" ON transactions FOR UPDATE USING (auth.jwt()->>'sub' = recipient_did) WITH CHECK (status = 'claimed'); 