import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  date_of_birth: string
  national_id: string
  country: string
  street_address: string
  city: string
  state: string
  zip_code: string
  unblockpay_customer_id: string
  created_at: string
  updated_at: string
}
