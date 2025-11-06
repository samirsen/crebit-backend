import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getApiUrl, API_CONFIG } from "@/config/api"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"
import { Eye, EyeOff } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import frogJumpAnim from "@/assets/frogJumpAnim.gif"
import frogOnCoin from "@/assets/frogOnCoin.png"
import Coin1 from "@/assets/Coin1.png"
import Coin2 from "@/assets/Coin2.png"
import Coin3 from "@/assets/Coin3.png"
import Coin4 from "@/assets/Coin4.png"

// Single falling coin that maintains trajectory until offscreen, then respawns.
// Hoisted to top-level so React does NOT remount it on parent re-renders.
const FallingCoin: React.FC<{ src: string; containerRef: React.RefObject<HTMLDivElement>; index: number; total: number }> = ({ src, containerRef, index, total }) => {
  // Stratified horizontal lanes to avoid clumping
  const laneWidth = 80 / total
  const laneCenter = 10 + laneWidth * index + laneWidth / 2

  const imgRef = useRef<HTMLImageElement | null>(null)
  // Balance initial spawn heights to ensure some coins are visible immediately and others are queued above
  const initialY = Math.random() < 0.7
    ? (-80 - Math.random() * 300)    // ~70% start closer to viewport entry
    : (-400 - Math.random() * 1200)  // ~30% much higher above
  const yRef = useRef<number>(initialY)
  const xRef = useRef<number>(laneCenter + (Math.random() * laneWidth - laneWidth / 2) * 0.6)
  // Narrow speed variance to keep flow density more uniform
  const speedRef = useRef<number>(90 + Math.random() * 30) // 90-120 px/sec
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const fixedHeightRef = useRef<number | null>(null)

  const resetAtTop = () => {
    // Bias respawn so some coins re-enter sooner and others take longer, avoiding empty periods
    yRef.current = Math.random() < 0.6
      ? (-120 - Math.random() * 500)
      : (-500 - Math.random() * 900)
    xRef.current = laneCenter + (Math.random() * laneWidth - laneWidth / 2) * 0.6
    speedRef.current = 90 + Math.random() * 30 // keep within 90-120 px/sec for consistent flow
    if (imgRef.current) {
      imgRef.current.style.left = `${xRef.current}%`
      imgRef.current.style.transform = `translateY(${yRef.current}px)`
    }
  }

  const tick = (ts: number) => {
    const container = containerRef.current
    if (!container || !imgRef.current) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    // Measure once to avoid mid-flight changes
    if (fixedHeightRef.current == null) {
      fixedHeightRef.current = container.clientHeight || container.getBoundingClientRect().height || 600
    }
    const height = (fixedHeightRef.current || 600) + 1000 // larger safety margin below

    if (lastTsRef.current == null) lastTsRef.current = ts
    const dt = (ts - lastTsRef.current) / 1000 // seconds
    lastTsRef.current = ts

    // Update Y based on speed
    yRef.current += speedRef.current * dt

    // Apply transform for smooth 60fps updates
    imgRef.current.style.transform = `translateY(${yRef.current}px)`

    // If fully off-screen (well below), respawn at random top
    if (yRef.current > height + 200) {
      resetAtTop()
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    // Stagger start so coins are desynchronized
    const startDelay = (index % 6) * 120 + Math.random() * 120 // small stagger (0-720ms)
    const t = window.setTimeout(() => {
      lastTsRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    }, startDelay)
    return () => {
      window.clearTimeout(t)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <img
      ref={imgRef}
      src={src}
      alt="Falling coin"
      className="absolute w-12 h-12 opacity-50 pointer-events-none"
      style={{ left: `${xRef.current}%`, top: 0, transform: `translateY(${yRef.current}px)`, willChange: 'transform' }}
    />
  )
}

const libraries: ("places")[] = ["places"]

interface FormData {
  // Step 1: Basic Info
  firstName: string
  lastName: string
  country: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  
  // Step 2: Identity
  nationalId: string
  birthDay: string
  birthMonth: string
  birthYear: string
  dateOfBirth: string
  
  // Step 3: Address
  streetAddress: string
  city: string
  state: string
  zipCode: string
}

const SignupNew = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  // Container for step 3 left panel (frog + coins)
  const coinContainerRef = useRef<HTMLDivElement | null>(null)

  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries
  })

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    country: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationalId: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    dateOfBirth: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: ""
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null)
    }
  }

  // Helper functions
  const trimmed = (str: string) => str.trim()
  const digitsOnly = (str: string) => str.replace(/\D/g, '')

  // Validation functions
  const validateStep1 = (): string | null => {
    if (trimmed(formData.firstName).length === 0) return "Please enter your first name."
    if (trimmed(formData.lastName).length === 0) return "Please enter your last name."
    if (!formData.country) return "Please choose your country."
    if (trimmed(formData.email).length === 0) return "Please enter your email."
    if (!formData.email.includes("@") || !formData.email.includes(".")) return "Please enter a valid email address."
    if (trimmed(formData.password).length === 0) return "Please enter a password."
    if (formData.password.length < 6) return "Password must be at least 6 characters."
    if (formData.password !== formData.confirmPassword) return "Passwords do not match."
    return null
  }

  const validateStep2 = (): string | null => {
    if (digitsOnly(formData.phone).length === 0) return "Please enter your phone number."
    if (digitsOnly(formData.phone).length < 10) return "Please enter a valid phone number."
    if (!formData.nationalId) return "Please enter your national ID number."
    if (formData.country === 'BR' && digitsOnly(formData.nationalId).length !== 11) return "CPF must be exactly 11 digits."
    
    // Birthdate validation
    const d = parseInt(formData.birthDay)
    const m = parseInt(formData.birthMonth)
    const y = parseInt(formData.birthYear)
    
    if (!d || !m || !y) return "Please enter a valid birth date."
    if (d < 1 || d > 31) return "Please enter a valid birth day."
    if (m < 1 || m > 12) return "Please enter a valid birth month."
    if (formData.birthYear.length !== 4) return "Birth year must be 4 digits."
    if (y < 1900 || y > 2025) return "Please enter a valid birth year."
    
    return null
  }

  const validateStep3 = (): string | null => {
    if (trimmed(formData.streetAddress).length === 0) return "Please enter your address."
    if (trimmed(formData.city).length === 0) return "Please enter your city."
    if (trimmed(formData.state).length === 0) return "Please enter your state/province."
    if (digitsOnly(formData.zipCode).length === 0) return "Please enter your ZIP/postal code."
    return null
  }

  const [validationError, setValidationError] = useState<string | null>(null)

  const createCustomer = async () => {
    try {
      const sanitizedPhone = formData.phone.replace(/\D/g, '')
      
      const customerData = {
        first_name: formData.firstName.substring(0, 32),
        last_name: formData.lastName.substring(0, 32),
        email: formData.email,
        phone_number: sanitizedPhone,
        type: 'individual',
        date_of_birth: formData.dateOfBirth,
        identity_documents: [
          {
            type: 'national_id',
            value: formData.nationalId,
            country: formData.country
          }
        ],
        address: {
          street_line_1: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create customer')
      }

      const result = await response.json()
      return {
        customer_id: result.customer_id,
        wallet_id: result.wallet_id,
        wallet_address: result.wallet_address
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // 2. Create UnblockPay customer and wallet
      const customerData = await createCustomer()
      
      if (!customerData || !customerData.customer_id) {
        throw new Error('Failed to create customer profile')
      }

      // 3. Save user profile to Supabase with wallet information
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          national_id: formData.nationalId,
          country: formData.country,
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          unblockpay_customer_id: customerData.customer_id,
          wallet_id: customerData.wallet_id,
          wallet_address: customerData.wallet_address
        })

      if (profileError) throw profileError

      toast({
        title: 'Success',
        description: 'Account created successfully! Please log in.',
      })

      setTimeout(() => {
        navigate('/login')
      }, 1500)
      
    } catch (error) {
      console.error('Sign up error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    // Validate current step before proceeding
    let error: string | null = null
    
    if (currentStep === 1) {
      error = validateStep1()
    } else if (currentStep === 2) {
      error = validateStep2()
    } else if (currentStep === 3) {
      error = validateStep3()
    }
    
    if (error) {
      setValidationError(error)
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.country && 
               formData.email && formData.password && 
               formData.confirmPassword && formData.password === formData.confirmPassword
      case 2:
        return formData.phone && formData.nationalId.length === 11 && formData.birthDay && 
               formData.birthMonth && formData.birthYear
      case 3:
        return formData.streetAddress && formData.city && formData.state && formData.zipCode
      default:
        return false
    }
  }

  // Update dateOfBirth when day/month/year change
  const updateDateOfBirth = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }))
    }
  }

  const fullText = "Without The Markups"

  // Typing animation effect
  useEffect(() => {
    // Wait for slide-in animation to complete (1.2s) before starting typing
    const animationDelay = setTimeout(() => {
      let currentIndex = 0
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypedText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          // Keep cursor blinking for a bit after typing is done
          setTimeout(() => setShowCursor(false), 2000)
        }
      }, 100)

      return () => clearInterval(typingInterval)
    }, 1200)

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => {
      clearTimeout(animationDelay)
      clearInterval(cursorInterval)
    }
  }, [])

  return (
    <>
      <Header />
      
      {/* Validation Error Popup */}
      {validationError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{validationError}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setValidationError(null)}
                  className="inline-flex text-red-400 hover:text-red-500 focus:outline-none"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row px-4 py-12 lg:py-6 lg:px-12 lg:gap-12">
        {/* Left Side - Frog Image (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center animate-slide-in-left">
          <div ref={coinContainerRef} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl h-full flex items-center justify-center relative overflow-hidden">
            {currentStep === 3 ? (
              <>
                {/* JS-driven Falling Coins */}
                <div className="absolute inset-0 pointer-events-none">
                  {(() => {
                    const total = 40
                    const coins = [Coin1, Coin2, Coin3, Coin4]
                    return Array.from({ length: total }).map((_, i) => (
                      <FallingCoin
                        key={i}
                        src={coins[i % 4]}
                        containerRef={coinContainerRef}
                        index={i}
                        total={total}
                      />
                    ))
                  })()}
                </div>
                {/* Frog on Coin */}
                <img 
                  src={frogOnCoin} 
                  alt="Frog on coin" 
                  className="w-full max-w-lg object-contain relative z-10"
                />
              </>
            ) : (
              <img 
                src={frogJumpAnim} 
                alt="Frog animation" 
                className="w-full max-w-lg object-contain"
              />
            )}
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="flex-1 flex items-center justify-center lg:animate-slide-in-right overflow-visible">
        <Card className="w-full max-w-2xl lg:max-w-xl lg:h-full lg:flex lg:flex-col overflow-visible shadow-2xl rounded-3xl" style={{overflow: 'visible'}}>
        <CardHeader className="overflow-visible lg:px-8 lg:pt-8" style={{overflow: 'visible'}}>
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4 overflow-visible" style={{overflow: 'visible'}}>
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                  currentStep >= stepNum 
                    ? "bg-[#0C3E3F] text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                    currentStep > stepNum ? "bg-[#0C3E3F]" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <CardTitle className="text-2xl font-bold text-center" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
            {currentStep === 1 && "Create Your Account"}
            {currentStep === 2 && "Identity Verification"}
            {currentStep === 3 && "Address Information"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="lg:flex-1 lg:flex lg:flex-col lg:relative overflow-visible lg:px-8" style={{overflow: 'visible'}}>
          <div className="lg:flex-1 lg:overflow-y-auto lg:pb-24 overflow-visible" style={{overflow: 'visible'}}>
          <form className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BR">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-sm">Passwords do not match</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Identity */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">CPF (National ID) *</Label>
                  <Input
                    id="nationalId"
                    placeholder="Enter your 11-digit CPF"
                    maxLength={11}
                    value={formData.nationalId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      if (value.length <= 11) {
                        handleInputChange("nationalId", value)
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">Enter 11 digits only</p>
                </div>

                <div className="space-y-2 relative z-10">
                  <Label>Date of Birth *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        placeholder="Day"
                        maxLength={2}
                        value={formData.birthDay}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 2 && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31))) {
                            handleInputChange("birthDay", value)
                            updateDateOfBirth(value, formData.birthMonth, formData.birthYear)
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Month"
                        maxLength={2}
                        value={formData.birthMonth}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 2 && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
                            handleInputChange("birthMonth", value)
                            updateDateOfBirth(formData.birthDay, value, formData.birthYear)
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Year"
                        maxLength={4}
                        value={formData.birthYear}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 4) {
                            handleInputChange("birthYear", value)
                            updateDateOfBirth(formData.birthDay, formData.birthMonth, value)
                          }
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Format: DD MM YYYY</p>
                </div>
              </>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        autocompleteRef.current = autocomplete
                      }}
                      onPlaceChanged={() => {
                        if (autocompleteRef.current) {
                          const place = autocompleteRef.current.getPlace()
                          if (place.address_components) {
                            let streetNumber = ''
                            let route = ''
                            let city = ''
                            let state = ''
                            let zipCode = ''
                            
                            place.address_components.forEach((component) => {
                              const types = component.types
                              if (types.includes('street_number')) {
                                streetNumber = component.long_name
                              }
                              if (types.includes('route')) {
                                route = component.long_name
                              }
                              if (types.includes('locality')) {
                                city = component.long_name
                              }
                              if (types.includes('administrative_area_level_1')) {
                                state = component.short_name
                              }
                              if (types.includes('postal_code')) {
                                zipCode = component.long_name
                              }
                            })
                            
                            const fullAddress = `${streetNumber} ${route}`.trim()
                            
                            setFormData(prev => ({
                              ...prev,
                              streetAddress: fullAddress,
                              city: city,
                              state: state,
                              zipCode: zipCode
                            }))
                          }
                        }
                      }}
                      options={{
                        componentRestrictions: { country: ['us', 'br'] },
                        fields: ['address_components'],
                        types: ['address']
                      }}
                    >
                      <Input
                        id="streetAddress"
                        placeholder="Start typing your address..."
                        value={formData.streetAddress}
                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                      />
                    </Autocomplete>
                  ) : (
                    <Input
                      id="streetAddress"
                      placeholder="Street address"
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    placeholder="ZIP code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  />
                </div>
              </>
            )}
          </form>
          </div>

          {/* Fixed Bottom Buttons - Desktop */}
          <div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:bg-white lg:px-6 lg:py-4 mt-6 lg:mt-0">
            <div className="flex justify-between mb-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                className={currentStep === 3 
                  ? "ml-auto border-0 hover:opacity-90" 
                  : "ml-auto bg-[#0C3E3F] hover:bg-[#0C3E3F]/90"
                }
                style={currentStep === 3 ? { backgroundColor: '#FFEC7D', color: '#0C3E3F', fontWeight: 'bold' } : undefined}
              >
                {currentStep === 3 ? (isLoading ? "Creating Account..." : "Finish") : "Next"}
              </Button>
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-[#0C3E3F] hover:underline font-semibold">
                Log in
              </a>
            </div>
          </div>
        </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SignupNew
