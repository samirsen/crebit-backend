import { supabase } from '@/lib/supabase'
import { getApiUrl, API_CONFIG } from '@/config/api'

export interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: string
  nationalId: string
  country: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
}

export const authService = {
  // Sign up new user
  async signup(data: SignupData) {
    try {
      // 1. Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // 2. Create customer in UnblockPay
      const customerData = {
        first_name: data.firstName.substring(0, 32),
        last_name: data.lastName.substring(0, 32),
        email: data.email,
        phone_number: data.phone.replace(/\D/g, ''),
        type: 'individual',
        date_of_birth: data.dateOfBirth,
        identity_documents: [
          {
            type: 'national_id',
            value: data.nationalId,
            country: data.country
          }
        ],
        address: {
          street_line_1: data.streetAddress,
          city: data.city,
          state: data.state,
          postal_code: data.zipCode,
          country: data.country
        }
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_CUSTOMER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        throw new Error('Failed to create UnblockPay customer')
      }

      const customerResult = await response.json()
      const unblockpayCustomerId = customerResult.customer_id

      // 3. Save user profile in Supabase
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          national_id: data.nationalId,
          country: data.country,
          street_address: data.streetAddress,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          unblockpay_customer_id: unblockpayCustomerId
        })

      if (profileError) throw profileError

      return { user: authData.user, customerId: unblockpayCustomerId }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  },

  // Login user
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Logout user
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser()
    return !!user
  }
}
