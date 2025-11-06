-- Create webhook_events table to store all UnblockPay webhook events
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_resource JSONB NOT NULL,
  event_resource_status TEXT,
  transaction_id TEXT,
  customer_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_usd DECIMAL(10, 2),
  amount_local DECIMAL(10, 2),
  local_currency TEXT,
  status TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create transactions table for user transaction history
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unblockpay_transaction_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'payin', 'payout', 'transfer'
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  amount_usd DECIMAL(10, 2) NOT NULL,
  amount_local DECIMAL(10, 2),
  local_currency TEXT,
  recipient TEXT,
  reference TEXT,
  quote_id TEXT,
  payin_id TEXT,
  payout_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for webhook_events (admin only for now)
CREATE POLICY "Service role can manage webhook_events"
  ON public.webhook_events
  FOR ALL
  USING (true);

-- Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions"
  ON public.transactions
  FOR ALL
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS webhook_events_transaction_id_idx ON public.webhook_events(transaction_id);
CREATE INDEX IF NOT EXISTS webhook_events_customer_id_idx ON public.webhook_events(customer_id);
CREATE INDEX IF NOT EXISTS webhook_events_user_id_idx ON public.webhook_events(user_id);
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON public.webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_unblockpay_transaction_id_idx ON public.transactions(unblockpay_transaction_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(status);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_transaction_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_updated_at();
