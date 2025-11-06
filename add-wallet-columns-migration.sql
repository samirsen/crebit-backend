-- Migration: Add wallet_id and wallet_address columns to user_profiles table
-- Run this in your Supabase SQL Editor to update existing database

-- Add wallet_id column (nullable since existing users don't have wallets yet)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS wallet_id TEXT;

-- Add wallet_address column (nullable since existing users don't have wallets yet)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS user_profiles_wallet_id_idx ON public.user_profiles(wallet_id);
CREATE INDEX IF NOT EXISTS user_profiles_wallet_address_idx ON public.user_profiles(wallet_address);

-- Verify the migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('wallet_id', 'wallet_address');
