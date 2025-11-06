import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, QrCode, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"

import QRCode from 'qrcode'

import { API_CONFIG, getApiUrl } from "@/config/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useNavigate } from "react-router-dom"
import { paymentService } from "@/services/paymentService"
import { transactionService, TransactionStatus } from "@/services/transactionService"
import { webhookService, WebhookEvent } from "@/services/webhookService"
import brazilFlag from "@/assets/Brazil.png"
import usFlag from "@/assets/UnitedStates.png"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

const libraries: ("places")[] = ["places"]

// Bank information database for autocomplete
const BANK_DATABASE: Record<string, { address: string; city: string; state: string; zipCode: string; routingNumber: string }> = {
  "bank of america": {
    address: "100 North Tryon Street",
    city: "Charlotte",
    state: "NC",
    zipCode: "28255",
    routingNumber: "026009593"
  },
  "chase": {
    address: "383 Madison Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10179",
    routingNumber: "021000021"
  },
  "university federal credit union": {
    address: "11940 E US 290",
    city: "Manor",
    state: "TX",
    zipCode: "78653",
    routingNumber: "314977405"
  },
  "community federal savings bank": {
    address: "8916 Jamaica Ave",
    city: "Woodhaven",
    state: "NY",
    zipCode: "11421",
    routingNumber: "026073150"
  },
  "huntington bank": {
    address: "17 S High Street",
    city: "Columbus",
    state: "OH",
    zipCode: "43215",
    routingNumber: "044000024"
  },
  "wells fargo": {
    address: "420 Montgomery Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94104",
    routingNumber: "121000248"
  },
  "citibank": {
    address: "388 Greenwich Street",
    city: "New York",
    state: "NY",
    zipCode: "10013",
    routingNumber: "091409571"
  },
  "us bank": {
    address: "800 Nicollet Mall",
    city: "Minneapolis",
    state: "MN",
    zipCode: "55402",
    routingNumber: "091000022"
  }
}

// Icon components
const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  nationalId: string
  email: string
  dateOfBirth: string
  birthMonth: string
  birthDay: string
  birthYear: string
  phone: string
  country: string
  // Address Information
  streetAddress: string
  city: string
  state: string
  zipCode: string
  // Delivery Method
  deliveryMethod: string
  routingNumber: string
  accountNumber: string
  accountHolderName: string
  bankName: string
  bankStreetAddress: string
  bankCity: string
  bankState: string
  bankZipCode: string
  bankAddressAutopopulated?: boolean
  schoolName: string
  payeeName: string
  deliveryInstructions: string
  studentFullName: string
  studentId: string
  termReference: string
  studentEmail: string
  amountUSD: string
  paymentMethod: string
}

interface SingleQuote {
  id: string
  quotation: string | number
  flat_fee: number
  expires_at: number
  symbol: string
  type: string
}

interface QuoteResult {
  on_ramp: SingleQuote
  off_ramp: SingleQuote
  amount_usd: number
  total_local_amount: number
  total_fees_usd: number
  effective_rate: number
  expires_at: number
  expires_at_readable: string
}

const GetStarted = () => {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [error, setError] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries
  });
  const [bankSuggestions, setBankSuggestions] = useState<string[]>([]);
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);

  // Handle bank name input and show suggestions
  const handleBankNameChange = (value: string) => {
    handleInputChange("bankName", value);
    
    if (value.length > 0) {
      const matches = Object.keys(BANK_DATABASE).filter(bank => 
        bank.toLowerCase().includes(value.toLowerCase())
      );
      setBankSuggestions(matches);
      setShowBankSuggestions(matches.length > 0);
    } else {
      setShowBankSuggestions(false);
    }
  };

  // Auto-fill bank details when a bank is selected
  const selectBank = (bankKey: string) => {
    const bankInfo = BANK_DATABASE[bankKey];
    if (bankInfo) {
      // Special handling for "US Bank" to capitalize both letters
      let formattedBankName = bankKey.split(' ').map(word => {
        if (word.toLowerCase() === 'us') {
          return 'US';
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
      
      setFormData(prev => ({
        ...prev,
        bankName: formattedBankName,
        bankStreetAddress: bankInfo.address,
        bankCity: bankInfo.city,
        bankState: bankInfo.state,
        bankZipCode: bankInfo.zipCode,
        routingNumber: bankInfo.routingNumber,
        bankAddressAutopopulated: true
      }));
      setShowBankSuggestions(false);
    }
  };
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    firstName: "",
    lastName: "",
    nationalId: "",
    email: "",
    dateOfBirth: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    phone: "",
    // Address Information
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    // Delivery Method
    deliveryMethod: "usd-bank-transfer",
    routingNumber: "",
    accountNumber: "",
    accountHolderName: "",
    bankName: "",
    bankStreetAddress: "",
    bankCity: "",
    bankState: "",
    bankZipCode: "",
    schoolName: "",
    payeeName: "",
    deliveryInstructions: "",
    studentFullName: "",
    studentId: "",
    termReference: "",
    studentEmail: "",
    country: "brazil",
    paymentMethod: "pix",
    amountUSD: "",
  })

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [authorizationAgreed, setAuthorizationAgreed] = useState(false)
  const [authorizationTimestamp, setAuthorizationTimestamp] = useState<string | null>(null)
  const [referralEmails, setReferralEmails] = useState<string[]>([''])
  const [isSubmittingReferrals, setIsSubmittingReferrals] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(300); // 5 minutes
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'BRL'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null) // Start with null to show loading state
  const [amountBRL, setAmountBRL] = useState('');

  // Restore payment session on mount (runs once) - only if navigating directly to /get-started
  useEffect(() => {
    console.log('Checking for saved payment session...');
    
    // Check if user came from home page or if timer expired - don't restore session
    const referrer = document.referrer;
    const isFromHomePage = referrer.includes('/') && !referrer.includes('/get-started');
    
    if (isFromHomePage) {
      console.log('❌ User came from home page, clearing any saved session');
      localStorage.removeItem('activePaymentSession');
      return;
    }
    
    const savedPaymentSession = localStorage.getItem('activePaymentSession');
    console.log('Saved session:', savedPaymentSession);
    
    if (savedPaymentSession) {
      try {
        const session = JSON.parse(savedPaymentSession);
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        
        console.log('Session age (seconds):', sessionAge / 1000);
        
        // Calculate remaining time
        const elapsed = Math.floor(sessionAge / 1000);
        const remaining = Math.max(0, 300 - elapsed);
        
        // Only restore if session is less than 10 minutes old AND timer hasn't expired
        if (sessionAge < 10 * 60 * 1000 && remaining > 0) {
          console.log('✅ Restoring active payment session to step', session.step);
          
          // Restore all session state
          setStep(session.step);
          setQuote(session.quote);
          setPixPayment(session.pixPayment);
          setAuthorizationTimestamp(session.authorizationTimestamp);
          setAuthorizationAgreed(session.authorizationAgreed);
          
          // Restore form data if available
          if (session.formData) {
            setFormData(session.formData);
            console.log('✅ Restored form data from session');
          }
          
          // Restore payment processing state
          if (session.payinProcessing) {
            setPayinProcessing(true);
            setPaymentReceived(true);
            setOffRampProcessing(true);
            setTimerStoppedForProcessing(true);
            console.log('✅ Restored payment processing state - showing popup');
          }
          
          // Regenerate QR code if PIX payment exists
          if (session.pixPayment) {
            const pixPaymentResult = session.pixPayment;
            const depositAddress = (pixPaymentResult as any).deposit_address || 
                          pixPaymentResult.transaction?.sender_deposit_instructions?.deposit_address ||
                          pixPaymentResult.transaction?.sender?.deposit_address ||
                          pixPaymentResult.transaction?.payment_instructions?.pix_code || 
                          pixPaymentResult.transaction?.payment_instructions?.deposit_address || 
                          pixPaymentResult.transaction?.pix_code || 
                          pixPaymentResult.transaction?.deposit_address || 
                          pixPaymentResult.transaction?.id || 
                          pixPaymentResult.transaction_id;
            
            if (depositAddress) {
              QRCode.toDataURL(depositAddress, { width: 300, margin: 2 })
                .then(url => {
                  setQrCodeDataUrl(url);
                  console.log('✅ QR code regenerated from restored session');
                })
                .catch(err => {
                  console.error('Failed to regenerate QR code:', err);
                });
            }
          }
          
          setCountdownSeconds(remaining);
          console.log('Timer remaining:', remaining, 'seconds');
        } else {
          console.log('❌ Session expired or timer ran out, clearing...');
          localStorage.removeItem('activePaymentSession');
        }
      } catch (error) {
        console.error('Failed to restore payment session:', error);
        localStorage.removeItem('activePaymentSession');
      }
    } else {
      console.log('No saved payment session found');
    }
  }, []); // Empty dependency array - only run once on mount

  // Skip to step 2 if user is logged in (separate effect)
  useEffect(() => {
    // Only run if we're still on step 1 (no active payment session was restored)
    if (step === 1 && user && userProfile) {
      console.log('User logged in, skipping to step 2. Customer ID:', userProfile.unblockpay_customer_id);
      
      // Pre-fill form data from user profile
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        email: userProfile.email,
        phone: userProfile.phone,
        nationalId: userProfile.national_id,
        country: userProfile.country === 'BR' ? 'brazil' : userProfile.country.toLowerCase(),
        dateOfBirth: userProfile.date_of_birth,
        streetAddress: userProfile.street_address,
        city: userProfile.city,
        state: userProfile.state,
        zipCode: userProfile.zip_code
      }));
      
      setStep(2);
    }
  }, [user, userProfile, step]);
  const [pixPayment, setPixPayment] = useState<{
    success: boolean;
    transaction: any;
    transaction_id: string;
    status: string;
    amount_brl: number;
    wallet_address: string;
    deposit_address?: string;
  } | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [pixError, setPixError] = useState<string | null>(null);
  const [offRampTransaction, setOffRampTransaction] = useState<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
  } | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<string>('waiting');
  const [payinProcessing, setPayinProcessing] = useState(false);
  const [timerStoppedForProcessing, setTimerStoppedForProcessing] = useState(false);
  const [showMinimumAmountModal, setShowMinimumAmountModal] = useState(false);
  const [mobileDateDisplay, setMobileDateDisplay] = useState('');
  const [lastMobileDateLength, setLastMobileDateLength] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch live exchange rate from backend API
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ symbol: "USDC/BRL", amount_usd: 1 })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Exchange rate API response:', data);
          
          // Use effective_rate like in Header component
          if (data.effective_rate) {
            const rate = parseFloat(data.effective_rate);
            console.log('Setting exchange rate from effective_rate to:', rate);
            setExchangeRate(rate);
          } else if (data.on_ramp_quote && data.on_ramp_quote.quotation) {
            const rate = parseFloat(data.on_ramp_quote.quotation);
            console.log('Setting exchange rate from on_ramp_quote to:', rate);
            setExchangeRate(rate);
          } else if (data.quotation && data.symbol === 'USDC/BRL') {
            const rate = parseFloat(data.quotation);
            console.log('Setting exchange rate from quotation to:', rate);
            setExchangeRate(rate);
          } else {
            console.log('No valid USDC/BRL exchange rate found in response:', data);
            setExchangeRate(5.42); // Fallback rate
          }
        } else {
          console.error('API response not ok:', response.status, response.statusText);
          setExchangeRate(5.42); // Fallback rate
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Set fallback rate of 5.42 if API fails
        setExchangeRate(5.42);
      }
    };
    
    fetchExchangeRate();
  }, []);

  // Sync mobile date display when dateOfBirth changes from date picker
  useEffect(() => {
    if (formData.dateOfBirth && formData.dateOfBirth.includes('-')) {
      // Keep YYYY-MM-DD format for mobile display
      setMobileDateDisplay(formData.dateOfBirth);
    }
  }, [formData.dateOfBirth]);

  // Sanitization functions
  const trimmed = (str: string): string => str.trim();
  const digitsOnly = (str: string): string => str.replace(/\D/g, '');

  // Sanitize functions for each step
  const sanitizeStep1 = () => {
    setFormData(prev => ({
      ...prev,
      firstName: trimmed(prev.firstName),
      lastName: trimmed(prev.lastName),
      email: trimmed(prev.email),
      phone: digitsOnly(prev.phone),
      nationalId: digitsOnly(prev.nationalId),
      streetAddress: trimmed(prev.streetAddress),
      city: trimmed(prev.city),
      state: trimmed(prev.state),
      zipCode: digitsOnly(prev.zipCode)
    }));
  };

  const sanitizeStep2 = () => {
    setFormData(prev => ({
      ...prev,
      routingNumber: digitsOnly(prev.routingNumber),
      accountNumber: digitsOnly(prev.accountNumber),
      accountHolderName: trimmed(prev.accountHolderName)
    }));
  };

  // Validation functions
  const validateStep1 = (): string | null => {
    if (trimmed(formData.firstName).length === 0) return "Please enter your first name.";
    if (trimmed(formData.lastName).length === 0) return "Please enter your last name.";
    if (!formData.country) return "Please choose your country.";
    if (digitsOnly(formData.phone).length === 0) return "Please enter your phone number.";
    if (digitsOnly(formData.phone).length < 10) return "Please enter a valid phone number.";
    if (trimmed(formData.email).length === 0) return "Please enter your email.";
    if (!formData.email.includes("@") || !formData.email.includes(".")) return "Please enter a valid email address.";
    if (!formData.nationalId) return "Please enter your national ID number.";
    if (formData.country === 'BR' && digitsOnly(formData.nationalId).length !== 11) return "CPF must be exactly 11 digits.";
    
    // Birthdate validation
    const d = parseInt(formData.birthDay);
    const m = parseInt(formData.birthMonth);
    const y = parseInt(formData.birthYear);
    
    if (!d || !m || !y) return "Please enter a valid birth date.";
    if (d < 1 || d > 31) return "Please enter a valid birth day.";
    if (m < 1 || m > 12) return "Please enter a valid birth month.";
    if (y < 1900 || y > 2025) return "Please enter a valid birth year.";
    
    if (trimmed(formData.streetAddress).length === 0) return "Please enter your address.";
    if (trimmed(formData.city).length === 0) return "Please enter your city.";
    if (trimmed(formData.state).length === 0) return "Please enter your state/province.";
    if (digitsOnly(formData.zipCode).length === 0) return "Please enter your ZIP/postal code.";
    
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!formData.deliveryMethod) return "Please select a delivery method.";
    if (formData.deliveryMethod === 'usd-bank-transfer') {
      if (digitsOnly(formData.routingNumber).length === 0) return "Please enter your routing number.";
      if (digitsOnly(formData.accountNumber).length === 0) return "Please enter your account number.";
      if (trimmed(formData.accountHolderName).length === 0) return "Please enter the account holder name.";
    }
    return null;
  };

  const validateStep3 = (): string | null => {
    if (!formData.amountUSD || parseFloat(formData.amountUSD) < 16) return "Minimum transfer amount is $16 USD.";
    return null;
  };

  // Function to update dateOfBirth from separate fields
  const updateDateOfBirth = (month: string, day: string, year: string) => {
    if (month && day && year && year.length === 4) {
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      handleInputChange("dateOfBirth", dateString);
    } else {
      handleInputChange("dateOfBirth", "");
    }
  };

  // Function to poll webhook status and check for off-ramp transaction creation
  const startWebhookStatusPolling = (transactionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.WEBHOOK_STATUS}/${transactionId}`));
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Webhook status endpoint returned non-JSON response:', contentType);
            console.error('Response text:', await response.text());
            return;
          }
          const data = await response.json();
          
          // Handle payin.processing event
          if (data.payin_processing && !payinProcessing) {
            console.log('🎉 PAYIN PROCESSING DETECTED!');
            setWebhookStatus('processing');
            setPayinProcessing(true);
            setPaymentReceived(true);
            
            // Stop the countdown timer when processing starts
            setTimerStoppedForProcessing(true);
            setCountdownSeconds(0);
            
            // Update the session to mark payment as processing
            const savedSession = localStorage.getItem('activePaymentSession');
            if (savedSession) {
              const session = JSON.parse(savedSession);
              localStorage.setItem('activePaymentSession', JSON.stringify({
                ...session,
                payinProcessing: true,
                paymentReceived: true
              }));
              console.log('💾 Updated session: payment is now processing (from polling)');
            }
            
            toast({
              title: "Payment Received!",
              description: "Your PIX payment has been detected and is now being processed.",
            });
          }
          
          if (data.payin_completed) {
            setWebhookStatus('payment_received');
            setPaymentReceived(true);
            setPayinProcessing(false);
            
            // Stop the countdown timer when payment is received
            setCountdownSeconds(0);
            
            
            
            
          }
          
          if (data.offramp_transaction) {
            setOffRampTransaction(data.offramp_transaction);
            setWebhookStatus('offramp_created');
            setOffRampProcessing(true);
            
            toast({
              title: "Off-ramp Created",
              description: `Off-ramp transaction ${data.offramp_transaction.id} initiated`,
            });
          }
          
          if (data.offramp_completed) {
            setWebhookStatus('completed');
            setOffRampProcessing(false);
            clearInterval(pollInterval);
            
            toast({
              title: "Transfer Complete!",
              description: "Funds have been sent to the receiving bank account",
            });
          }
        }
      } catch (error) {
        console.error('Error polling webhook status:', error);
        // If we get HTML instead of JSON, the backend endpoint might not be working
        if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
          console.error('Backend webhook status endpoint may be returning HTML instead of JSON');
          console.error('Check if the Flask server is running and the endpoint is accessible');
        }
      }
    }, 3000); // Poll every 3 seconds
    
    // Clear interval after 10 minutes to avoid infinite polling
    setTimeout(() => clearInterval(pollInterval), 600000);
  };
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [offRampProcessing, setOffRampProcessing] = useState(false);

  // Function to generate QR code from PIX data
  const generateQRCode = async (pixData: string) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(pixData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrCodeUrl);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };
  const navigate = useNavigate();

  // Webhook event handler
  const handleWebhookEvent = (event: WebhookEvent) => {
    console.log('Webhook event received:', event);
    
    // Update transaction status from webhook event
    const status: TransactionStatus = {
      id: event.event_resource.id,
      status: event.event_resource.status as TransactionStatus['status'],
      amount: event.event_resource.amount,
      currency: event.event_resource.currency,
      created_at: event.event_resource.created_at,
      updated_at: event.event_resource.updated_at
    };
    
    setTransactionStatus(status);
    
    // Handle payment completion - only show popup for payin.processing
    if (event.event_type === 'payin.processing' && !paymentReceived) {
      setPaymentReceived(true);
      setOffRampProcessing(true);
      setPayinProcessing(true);
      // Stop the countdown timer when processing starts
      setTimerStoppedForProcessing(true);
      setCountdownSeconds(0);
      
      // Update the session to mark payment as processing (don't clear it yet)
      const savedSession = localStorage.getItem('activePaymentSession');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        localStorage.setItem('activePaymentSession', JSON.stringify({
          ...session,
          payinProcessing: true,
          paymentReceived: true
        }));
        console.log('💾 Updated session: payment is now processing');
      }
      
      // DO NOT change step - stay on current payment screen
    }
    // For all other transaction states, just update the status without changing the screen
    // This includes payin.completed, payin.failed, etc.
  };


  // Referral functions
  const addReferralEmail = () => {
    setReferralEmails([...referralEmails, '']);
  };

  const removeReferralEmail = (index: number) => {
    if (referralEmails.length > 1) {
      setReferralEmails(referralEmails.filter((_, i) => i !== index));
    }
  };

  const updateReferralEmail = (index: number, email: string) => {
    const newEmails = [...referralEmails];
    newEmails[index] = email;
    setReferralEmails(newEmails);
  };

  const submitReferrals = async () => {
    setIsSubmittingReferrals(true);
    try {
      const validEmails = referralEmails.filter(email => email.trim() && email.includes('@'));
      
      if (validEmails.length > 0) {
        // Here you would typically send to your backend
        console.log('Submitting referrals:', validEmails);
        
        toast({
          title: "Referrals Submitted!",
          description: `${validEmails.length} referral${validEmails.length > 1 ? 's' : ''} sent successfully. You'll earn $100 for each successful signup!`,
        });
      }
      
      // Move to final step
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to submit referrals. Please try again.",
      });
    } finally {
      setIsSubmittingReferrals(false);
    }
  };

  const generatePixPayment = async () => {
    setIsGeneratingPix(true);
    setPixError(null);
    
    try {
      // Get customer ID from localStorage or create a new one
      let customerId = localStorage.getItem('customerId');
      if (!customerId) {
        console.log('No saved customer ID found, creating new customer...');
        customerId = await createCustomer();
        if (customerId) {
          localStorage.setItem('customerId', customerId);
        }
      } else {
        console.log('Using saved customer ID:', customerId);
      }
      
      // Get wallet address from localStorage
      let walletAddress = localStorage.getItem('walletAddress');
      
      // If no wallet address in localStorage, try to get it from the backend
      if (!walletAddress) {
        console.log('No wallet address in localStorage, fetching from backend...');
        try {
          const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_CUSTOMER), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              use_existing_customer: true,
              existing_customer_id: customerId
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Backend response for wallet:', data);
            
            if (data.wallet_address) {
              walletAddress = data.wallet_address;
              localStorage.setItem('walletAddress', walletAddress);
              console.log('✅ Fetched and saved wallet address:', walletAddress);
            } else {
              console.error('❌ No wallet_address in backend response:', data);
            }
          } else {
            const errorData = await response.json();
            console.error('❌ Backend error response:', errorData);
          }
        } catch (error) {
          console.error('❌ Error fetching wallet address:', error);
        }
      }
      
      // If still no wallet address, create a new customer which will create a wallet
      if (!walletAddress) {
        console.log('⚠️ Still no wallet address, creating new customer to generate wallet...');
        try {
          const newCustomerId = await createCustomer();
          if (newCustomerId) {
            localStorage.setItem('customerId', newCustomerId);
            walletAddress = localStorage.getItem('walletAddress');
            console.log('✅ Created new customer and got wallet address:', walletAddress);
          }
        } catch (error) {
          console.error('❌ Error creating new customer:', error);
        }
      }
      
      if (!walletAddress) {
        throw new Error('Unable to create wallet. Please refresh and try again.');
      }
      
      if (!quote) {
        throw new Error('No quote available. Please generate a quote first.');
      }
      
      // Get sender information from form data
      const senderName = `${formData.firstName} ${formData.lastName}`;
      let senderDocument = formData.nationalId; // CPF/National ID
      
      if (!senderName || !senderDocument) {
        throw new Error('Sender information (name and tax ID) is required for PIX payment.');
      }
      
      // Clean and validate CPF format for UnblockPay API (requires 11-18 digits)
      senderDocument = senderDocument.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
      
      if (senderDocument.length < 11 || senderDocument.length > 18) {
        throw new Error(`Invalid CPF format. CPF must have 11-18 digits, but got ${senderDocument.length} digits: ${senderDocument}`);
      }
      
      console.log(`CPF validation: Original: "${formData.nationalId}" -> Cleaned: "${senderDocument}" (${senderDocument.length} digits)`);
      
      // Ensure it's a string (UnblockPay API requirement)
      senderDocument = String(senderDocument);
      
      console.log('Generating PIX payment with:', {
        amount: quote.total_local_amount,
        customerId,
        walletAddress,
        onRampQuoteId: quote.on_ramp.id,
        senderName,
        senderDocument
      });
      
      // Call the backend to create PIX payment using the saved on-ramp quote ID
      const pixPaymentResult = await paymentService.createPixPayment(
        quote.total_local_amount,
        customerId,
        walletAddress,
        quote.on_ramp.id,
        senderName,
        senderDocument
      );
      
      console.log('PIX payment generated successfully:', pixPaymentResult);
      setPixPayment(pixPaymentResult);
      
      // Update payment session with PIX payment details
      const savedSession = localStorage.getItem('activePaymentSession');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const updatedSession = {
          ...session,
          pixPayment: pixPaymentResult
        };
        localStorage.setItem('activePaymentSession', JSON.stringify(updatedSession));
        console.log('💾 Updated payment session with PIX details:', updatedSession);
      }
      
      // Generate QR code from deposit address in PIX payment response
      let qrCodeData = '';
      let depositAddress = '';
      
      // Extract the same deposit address that's shown in the copyable text
      // Use the exact same logic as the display text to ensure consistency
      console.log('Full transaction response:', pixPaymentResult.transaction);
      
      // Use the deposit address from sender_deposit_instructions (correct API structure)
      depositAddress = (pixPaymentResult as any).deposit_address || 
                      pixPaymentResult.transaction?.sender_deposit_instructions?.deposit_address ||
                      pixPaymentResult.transaction?.sender?.deposit_address ||
                      pixPaymentResult.transaction?.payment_instructions?.pix_code || 
                      pixPaymentResult.transaction?.payment_instructions?.deposit_address || 
                      pixPaymentResult.transaction?.pix_code || 
                      pixPaymentResult.transaction?.deposit_address || 
                      pixPaymentResult.transaction?.id || 
                      pixPaymentResult.transaction_id;
      
      qrCodeData = depositAddress;
      
      console.log('Using deposit address for QR code:', depositAddress);
      
      // Generate the QR code using the deposit address
      await generateQRCode(qrCodeData);
      
      // Setup webhook listener for this transaction
      console.log('PIX payment created, waiting for webhook events for transaction:', pixPaymentResult.transaction_id);
      
      // Start polling for webhook status updates
      setWebhookStatus('waiting_for_payment');
      startWebhookStatusPolling(pixPaymentResult.transaction_id);
      
      toast({
        title: "PIX Payment Generated",
        description: `Transaction created with ID: ${pixPaymentResult.transaction_id}`,
      });
      return pixPaymentResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PIX payment';
      console.error('Error generating PIX payment:', error);
      setPixError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  }

  // Custom handler for mobile date input with YYYY-MM-DD formatting
  const handleMobileDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Extract only the numeric characters from the input
    const numbersOnly = value.replace(/\D/g, '');
    
    // Detect if user is deleting (fewer numbers than before)
    const isDeleting = numbersOnly.length < lastMobileDateLength;
    setLastMobileDateLength(numbersOnly.length);
    
    // Limit to 8 digits (YYYYMMDD)
    const limitedNumbers = numbersOnly.slice(0, 8);
    
    // If no numbers entered, show empty (placeholder will be visible)
    if (limitedNumbers.length === 0) {
      setMobileDateDisplay('');
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
      return;
    }
    
    // For deletions, allow more flexible formatting
    if (isDeleting) {
      // Simple format without padding for deletions
      let formattedValue = limitedNumbers;
      if (limitedNumbers.length > 4) {
        formattedValue = limitedNumbers.slice(0, 4) + '-' + limitedNumbers.slice(4);
      }
      if (limitedNumbers.length > 6) {
        formattedValue = limitedNumbers.slice(0, 4) + '-' + limitedNumbers.slice(4, 6) + '-' + limitedNumbers.slice(6);
      }
      setMobileDateDisplay(formattedValue);
    } else {
      // Build the formatted display with dashes always visible for typing
      let formattedValue = '';
      
      // Year part (4 digits)
      const yearPart = limitedNumbers.slice(0, 4);
      formattedValue += yearPart.padEnd(4, ' ');
      
      // Always add first dash
      formattedValue += '-';
      
      // Month part (2 digits)
      const monthPart = limitedNumbers.slice(4, 6);
      formattedValue += monthPart.padEnd(2, ' ');
      
      // Always add second dash
      formattedValue += '-';
      
      // Day part (2 digits)
      const dayPart = limitedNumbers.slice(6, 8);
      formattedValue += dayPart.padEnd(2, ' ');
      
      setMobileDateDisplay(formattedValue);
    }
    
    // Store the actual date value in YYYY-MM-DD format when complete
    if (limitedNumbers.length === 8) {
      const storageValue = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4, 6)}-${limitedNumbers.slice(6, 8)}`;
      setFormData(prev => ({ ...prev, dateOfBirth: storageValue }));
    } else {
      // Clear stored value for incomplete dates
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  }

  const createCustomer = async () => {
    try {
      // If user is logged in, fetch their wallet info from backend
      if (user && userProfile?.unblockpay_customer_id) {
        console.log('Using existing customer ID:', userProfile.unblockpay_customer_id)
        
        // Fetch wallet info from backend
        try {
          const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_CUSTOMER), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              use_existing_customer: true,
              existing_customer_id: userProfile.unblockpay_customer_id
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.wallet_address) {
              localStorage.setItem('walletAddress', data.wallet_address);
              localStorage.setItem('walletId', data.wallet_id);
              console.log('✅ Fetched wallet for logged-in user:', data.wallet_address);
            }
          }
        } catch (error) {
          console.error('Error fetching wallet for logged-in user:', error);
        }
        
        return userProfile.unblockpay_customer_id
      }

      // Debug log current form data
      console.log('Current form data:', formData)

      // Validate all required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone Number',
        dateOfBirth: 'Date of Birth',
        nationalId: 'CPF/National ID',
        country: 'Country',
        streetAddress: 'Street Address',
        city: 'City',
        state: 'State/Province',
        zipCode: 'ZIP/Postal Code'
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !formData[field as keyof FormData])
        .map(([, label]) => label)

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      }

      // Validate email format
      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(formData.dateOfBirth)) {
        throw new Error('Date of Birth must be in YYYY-MM-DD format')
      }

      // Sanitize and validate phone number
      const sanitizedPhone = formData.phone.replace(/[^0-9]/g, '')
      if (!sanitizedPhone) {
        throw new Error('Phone number must contain at least one digit')
      }

      // Log field values before creating customer data
      console.log('Field values before mapping:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        nationalId: formData.nationalId,
        country: formData.country,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      })

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

      // Log the final customer data being sent
      console.log('Customer data being sent:', customerData)

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

      const data = await response.json()
      console.log('Customer creation response:', data)
      
      // Validate that we got a customer_id
      if (!data.customer_id) {
        throw new Error('No customer ID returned from API')
      }
      
      // Save wallet_id and wallet_address to localStorage if they exist in the response
      if (data.wallet_id) {
        localStorage.setItem('walletId', data.wallet_id)
        console.log('Saved wallet ID to localStorage:', data.wallet_id)
      } else {
        console.warn('No wallet_id found in customer creation response')
      }
      
      if (data.wallet_address) {
        localStorage.setItem('walletAddress', data.wallet_address)
        console.log('Saved wallet address to localStorage:', data.wallet_address)
      } else {
        console.warn('No wallet_address found in customer creation response')
      }
      
      // Handle popup for existing customer with external account
      if (data.show_popup && data.existing_customer_found) {
        // Show user the option to use existing bank account
        const useExistingAccount = window.confirm(
          `${data.popup_title}\n\n` +
          `${data.popup_message}\n` +
          `${data.popup_details}\n\n` +
          `${data.popup_question}`
        )
        
        if (useExistingAccount) {
          // User chose to use existing account - call API to use existing customer
          try {
            const existingCustomerResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_CUSTOMER), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                use_existing_customer: true,
                existing_customer_id: data.customer_id
              })
            })
            
            if (!existingCustomerResponse.ok) {
              throw new Error('Failed to use existing customer')
            }
            
            const existingData = await existingCustomerResponse.json()
            console.log('Using existing customer response:', existingData)
            
            toast({
              title: 'Welcome Back!',
              description: 'Using your existing bank account information',
            })
            
            // Return the existing customer data to be used in the flow
            console.log('Using existing customer data:', existingData)
            return {
              customer_id: existingData.customer_id,
              wallet_id: existingData.wallet_id,
              wallet_address: existingData.wallet_address,
              external_account_id: data.external_account_id,
              existing_customer: true,
              use_existing_account: true
            }
            
          } catch (error) {
            console.error('Error using existing customer:', error)
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to use existing account. Please try again.',
            })
            return
          }
        } else {
          // User chose to create new account - continue with normal flow
          toast({
            title: 'New Account',
            description: 'You can enter new bank account information',
          })
          // Continue with normal flow (don't return, let it proceed)
        }
      }
      // Handle existing customer case (legacy)
      else if (data.existing_customer && data.existing_external_account) {
        // Show user the option to use existing bank account
        const useExistingAccount = window.confirm(
          `We found an existing account with this information. You have a bank account on file:\n\n` +
          `Bank: ${data.existing_external_account.bank_name || 'N/A'}\n` +
          `Account: ***${(data.existing_external_account.bank_account_number || '').slice(-4)}\n\n` +
          `Would you like to use this existing bank account? Click OK to use it, or Cancel to enter new bank information.`
        )
        
        if (useExistingAccount) {
          toast({
            title: 'Existing Account Found',
            description: 'Using your existing bank account information',
          })
          
          // Return existing customer data without localStorage
          return {
            customer_id: data.customer_id,
            wallet_id: data.wallet_id,
            wallet_address: data.wallet_address,
            external_account_id: data.existing_external_account.id,
            existing_customer: true,
            use_existing_account: true
          }
        } else {
          toast({
            title: 'New Account',
            description: 'You can enter new bank account information',
          })
        }
      } else if (data.existing_customer) {
        toast({
          title: 'Existing Customer',
          description: 'Welcome back! Using your existing profile.',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Customer profile and wallet created successfully',
        })
      }
      
      console.log('Successfully processed customer with ID:', data.customer_id)
      return data.customer_id
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create customer',
      })
      throw error
    }
  }

  const createExternalAccount = async (customerId: string, existingAccountData?: any) => {
    try {
      console.log('Starting external account creation...');
      
      // Check if we have existing account data passed from customer creation
      if (existingAccountData?.use_existing_account && existingAccountData?.external_account_id) {
        console.log('Using existing external account:', existingAccountData.external_account_id);
        
        toast({
          title: 'Success',
          description: 'Using your existing bank account for payments',
        });
        
        return existingAccountData.external_account_id;
      }
      
      // Validate bank account fields for new account creation
      if (!formData.routingNumber || !formData.accountNumber || !formData.accountHolderName || 
          !formData.bankName || !formData.bankStreetAddress || !formData.bankCity || 
          !formData.bankState || !formData.bankZipCode) {
        console.error('Missing required bank fields:', {
          routingNumber: !!formData.routingNumber,
          accountNumber: !!formData.accountNumber,
          accountHolderName: !!formData.accountHolderName,
          bankName: !!formData.bankName,
          bankStreetAddress: !!formData.bankStreetAddress,
          bankCity: !!formData.bankCity,
          bankState: !!formData.bankState,
          bankZipCode: !!formData.bankZipCode
        });
        throw new Error('Please fill in all bank account details including bank address')
      }

      console.log('Bank field validation passed');
      
      const accountData = {
        account_name: `${formData.accountHolderName}'s USD Account`.substring(0, 32),
        beneficiary_name: formData.accountHolderName.substring(0, 32), // Trim to first 32 characters
        bank_name: formData.bankName,
        bank_account_number: formData.accountNumber,
        routing_number: formData.routingNumber,
        address: {
          street_line_1: formData.bankStreetAddress,
          city: formData.bankCity,
          state: formData.bankState,
          postal_code: formData.bankZipCode,
          country: 'USA' // For US wire accounts
        }
      }
      
      console.log('Prepared account data:', {
        ...accountData,
        bank_account_number: '****' + accountData.bank_account_number.slice(-4),
        routing_number: '****' + accountData.routing_number.slice(-4)
      });

      console.log('Creating external account with data:', accountData)

      console.log('Making API request to create external account...');
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_EXTERNAL_ACCOUNT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...accountData,
          customer_id: customerId
        })
      })
      
      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create external account')
      }

      const data = await response.json()
      console.log('API response data:', {
        ...data,
        external_account_id: data.external_account_id ? '****' + data.external_account_id.slice(-4) : null
      });
      
      toast({
        title: "External Account Saved",
        description: "The receiving bank account details have been securely saved"
      })
      
      console.log('External account creation successful!');
      return data.external_account_id
    } catch (error) {
      console.error('Error creating external account:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create external account',
      });
      throw error;
    }
  }

  const handlePaymentAuthorization = async () => {
    if (!authorizationAgreed) {
      toast({
        variant: 'destructive',
        title: 'Authorization Required',
        description: 'Please agree to the authorization to proceed with the payment.'
      });
      return;
    }

    try {
      // Get the latest quote IDs from localStorage
      const quoteIds = getLastQuoteIds();
      
      if (!quoteIds) {
        throw new Error('No valid quote found. Please generate a new quote.');
      }

      const timestamp = new Date().toISOString();
      setAuthorizationTimestamp(timestamp);
      
      // Log the digital signature with timestamp and quote IDs
      console.log("Payment Authorization Digital Signature:", {
        timestamp,
        userAgent: navigator.userAgent,
        acknowledged: true,
        studentName: formData.firstName + " " + formData.lastName,
        schoolName: formData.schoolName,
        amount: formData.amountUSD,
        deliveryMethod: formData.deliveryMethod,
        onRampQuoteId: quoteIds.onRampQuoteId,
        offRampQuoteId: quoteIds.offRampQuoteId
      });
      
      // Move to step 5 for payment processing
      setStep(5);
      
      // Start the countdown for payment expiration
      setCountdownSeconds(300); // 5 minutes
      
      // Save payment session to localStorage so user can return to it
      const sessionData = {
        step: 5,
        quote: quote,
        pixPayment: null,
        authorizationTimestamp: timestamp,
        authorizationAgreed: true,
        timestamp: Date.now(),
        formData: formData, // Save form data so customer info is available on restore
        payinProcessing: false, // Track if payment is processing
        paymentReceived: false
      };
      localStorage.setItem('activePaymentSession', JSON.stringify(sessionData));
      console.log('💾 Saved payment session to localStorage:', sessionData);
      
      toast({
        title: 'Payment Authorized',
        description: 'Generating your PIX payment...'
      });

      // Automatically generate PIX payment for Brazil
      if (formData.country === "brazil") {
        await generatePixPayment();
      }
    } catch (error) {
      console.error('Error in payment authorization:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment authorization',
      });
    }
  }

  const handleQuoteExpiry = () => {
    setShowExpiryModal(false)
    setQuote(null)
    setAuthorizationTimestamp("")
    setAuthorizationAgreed(false)
    setCountdownSeconds(300)
    setStep(4) // Go back to payment details to get new quote
  }

  // Countdown timer effect for steps 5 and 6
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    // Stop timer if payment has been received
    if (paymentReceived) {
      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    }
    
    if ((step === 4 || step === 5 || step === 6) && countdownSeconds > 0) {
      interval = setInterval(() => {
        setCountdownSeconds(seconds => {
          if (seconds <= 1) {
            // Only show expiry modal if timer wasn't stopped for processing
            if (!timerStoppedForProcessing) {
              setShowExpiryModal(true)
              // If we're on step 6, go back to step 4 to get a new quote
              if (step === 6) {
                setStep(4)
              }
            }
            return 0
          }
          return seconds - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [step, paymentReceived]) // Removed countdownSeconds from dependencies to prevent re-creating timer

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const calculateTotals = () => {
    if (!quote) {
      return {
        fxMarkup: 0,
        totalLocalAmount: 0,
        amountUSD: 0,
        exchangeRate: 0,
        onRampRate: 0,
        offRampRate: 0,
        effectiveRate: 0
      }
    }
    
    return {
      fxMarkup: quote.total_fees_usd,
      totalLocalAmount: quote.total_local_amount,
      amountUSD: quote.amount_usd,
      exchangeRate: quote.effective_rate,
      onRampRate: parseFloat(quote.on_ramp.quotation.toString()),
      offRampRate: parseFloat(quote.off_ramp.quotation.toString()),
      effectiveRate: quote.effective_rate
    }
  }
  
  const totals = calculateTotals()

  const getLastCustomerId = async () => {
    // If user is logged in, get customer_id from their profile
    if (user) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('unblockpay_customer_id')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to retrieve customer ID from profile');
      }
      
      if (profile?.unblockpay_customer_id) {
        console.log('Retrieved customer ID from user profile:', profile.unblockpay_customer_id);
        return profile.unblockpay_customer_id;
      }
    }
    
    // Fallback to localStorage for non-logged-in users
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      throw new Error('No customer ID found. Please create a customer profile first.');
    }
    console.log('Retrieved customer ID from localStorage:', customerId);
    return customerId;
  }

  // Function to get the last quote IDs from localStorage
  const getLastQuoteIds = () => {
    try {
      const onRampQuoteId = localStorage.getItem('onRampQuoteId');
      const offRampQuoteId = localStorage.getItem('offRampQuoteId');
      
      if (!onRampQuoteId || !offRampQuoteId) {
        console.log('No quote IDs found in localStorage');
        return null;
      }
      
      console.log('Retrieved quote IDs from localStorage:', { onRampQuoteId, offRampQuoteId });
      return {
        onRampQuoteId,
        offRampQuoteId
      };
    } catch (error) {
      console.error('Error retrieving quote IDs from localStorage:', error);
      return null;
    }
  }

  const handleGetQuote = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      let finalAmountUSD: number
      
      if (inputCurrency === 'USD') {
        finalAmountUSD = parseFloat(formData.amountUSD)
        if (isNaN(finalAmountUSD) || finalAmountUSD <= 0) {
          throw new Error('Please enter a valid USD amount')
        }
        
        // Check minimum amount for USD input
        if (finalAmountUSD < 16) {
          setShowMinimumAmountModal(true)
          setIsLoading(false)
          return
        }
      } else {
        // BRL input - need two-step process
        const amountBRLValue = parseFloat(amountBRL)
        if (isNaN(amountBRLValue) || amountBRLValue <= 0) {
          throw new Error('Please enter a valid BRL amount')
        }
        
        // Step 1: Get a sample quote to determine current exchange rate
        const sampleResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            symbol: 'USDC/BRL',
            amount_usd: 100 // Sample $100 USD
          })
        })
        
        if (!sampleResponse.ok) {
          const errorData = await sampleResponse.json()
          throw new Error(errorData.error || 'Failed to get exchange rate')
        }
        
        const sampleQuote = await sampleResponse.json()
        const exchangeRate = sampleQuote.total_local_amount / 100 // BRL per USD
        
        // Step 2: Calculate equivalent USD amount
        finalAmountUSD = amountBRLValue / exchangeRate
        
        // Check minimum amount for BRL input (converted to USD)
        if (finalAmountUSD < 16) {
          setShowMinimumAmountModal(true)
          setIsLoading(false)
          return
        }
        
        // Update the USD field for form consistency
        handleInputChange("amountUSD", finalAmountUSD.toFixed(2))
      }
      
      // Get the final quote with USD amount
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          symbol: 'USDC/BRL',
          amount_usd: finalAmountUSD
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get quote')
      }
      
      const quoteData = await response.json()
      setQuote(quoteData)
      
      // Store quote IDs in localStorage for later use
      if (quoteData.on_ramp?.id) {
        localStorage.setItem('onRampQuoteId', quoteData.on_ramp.id);
        console.log('Saved on-ramp quote ID to localStorage:', quoteData.on_ramp.id);
      }
      if (quoteData.off_ramp?.id) {
        localStorage.setItem('offRampQuoteId', quoteData.off_ramp.id);
        console.log('Saved off-ramp quote ID to localStorage:', quoteData.off_ramp.id);
      }
      
      // Start countdown timer and move to step 5 (Payment Authorization)
      setCountdownSeconds(300) // 5 minutes
      setStep(4)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to get quote',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const schools = [
    "Harvard University",
    "Stanford University", 
    "MIT",
    "University of California, Berkeley",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "University of Pennsylvania"
  ]

  return (
    <div className="min-h-screen bg-background">
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
                  type="button"
                  className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
                  onClick={() => setValidationError(null)}
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
      {/* Back Arrow Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-white/90 hover:bg-white shadow-lg rounded-full p-3"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
      </div>
      
      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-1 sm:space-x-4 mb-6 px-2 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div key={stepNum} className="flex items-center flex-shrink-0">
                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-satoshi font-medium text-xs sm:text-base ${
                    step >= stepNum 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 5 && (
                    <div className={`w-4 sm:w-16 h-0.5 mx-0.5 sm:mx-2 ${
                      step > stepNum ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-3xl lg:text-4xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                Get Started with Your Payment
              </h1>
              <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                {step === 1 && "Personal information"}
                {step === 2 && "Choose your delivery method"}
                {step === 3 && "Enter payment amount"}
                {step === 4 && "Payment authorization"}
                {step === 5 && "Complete your payment"}
              </p>
            </div>
          </div>

          {/* Step 1: Customer Information */}
          {step === 1 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">

                  <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Individual Information</span>
                </CardTitle>
                <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  Please provide your personal information to get started
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Country of Citizenship *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country where your document is from" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brazil">Brazil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nationalId" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>CPF (National ID) *</Label>
                    <Input
                      id="nationalId"
                      placeholder="Enter your 11-digit CPF number"
                      maxLength={11}
                      value={formData.nationalId}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 11) {
                          handleInputChange("nationalId", value);
                        }
                      }}
                      onBlur={() => {
                        if (formData.nationalId && formData.nationalId.length > 0 && formData.nationalId.length !== 11) {
                          setValidationError("CPF must be exactly 11 digits. Please enter a valid CPF number.");
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Date of Birth *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="birthDay" className="text-sm text-muted-foreground">Day *</Label>
                      <Input
                        id="birthDay"
                        type="text"
                        placeholder="DD"
                        maxLength={2}
                        value={formData.birthDay || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
                            handleInputChange("birthDay", value);
                            updateDateOfBirth(formData.birthMonth, value, formData.birthYear);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="birthMonth" className="text-sm text-muted-foreground">Month *</Label>
                      <Input
                        id="birthMonth"
                        type="text"
                        placeholder="MM"
                        maxLength={2}
                        value={formData.birthMonth || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                            handleInputChange("birthMonth", value);
                            updateDateOfBirth(value, formData.birthDay, formData.birthYear);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="birthYear" className="text-sm text-muted-foreground">Year *</Label>
                      <Input
                        id="birthYear"
                        type="text"
                        placeholder="YYYY"
                        maxLength={4}
                        value={formData.birthYear || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value === '' || value.length <= 4) {
                            handleInputChange("birthYear", value);
                            updateDateOfBirth(formData.birthMonth, formData.birthDay, value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Phone (Brazillian or US) *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                    
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your-email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Address on Driver's License or Bank Statements</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Street Address *</Label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => {
                          autocompleteRef.current = autocomplete;
                        }}
                        onPlaceChanged={() => {
                          if (autocompleteRef.current) {
                            const place = autocompleteRef.current.getPlace();
                            if (place.address_components) {
                              let streetNumber = '';
                              let route = '';
                              let city = '';
                              let state = '';
                              let zipCode = '';
                              
                              place.address_components.forEach((component) => {
                                const types = component.types;
                                if (types.includes('street_number')) {
                                  streetNumber = component.long_name;
                                }
                                if (types.includes('route')) {
                                  route = component.long_name;
                                }
                                if (types.includes('locality')) {
                                  city = component.long_name;
                                }
                                if (types.includes('administrative_area_level_1')) {
                                  state = component.short_name;
                                }
                                if (types.includes('postal_code')) {
                                  zipCode = component.long_name;
                                }
                              });
                              
                              const fullAddress = `${streetNumber} ${route}`.trim();
                              
                              setFormData(prev => ({
                                ...prev,
                                streetAddress: fullAddress,
                                city: city,
                                state: state,
                                zipCode: zipCode
                              }));
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
                        placeholder="Street address, apartment, suite, etc."
                        value={formData.streetAddress}
                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                      />
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                      <Label htmlFor="state" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>State/Province *</Label>
                      <Input
                        id="state"
                        placeholder="State or province"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>ZIP/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="ZIP or postal code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#17484A]/10 p-4 rounded-lg border border-[#17484A]/20">
                  <p className="text-sm text-[#17484A]">
                    <strong>Identity Verification:</strong> We need this information for compliance with our partner Unblock Pay, who must confirm user identity before currency conversion.
                  </p>
                </div>

                <div className="flex justify-end pt-6">
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      // Create a temporary sanitized version for validation without updating state yet
                      const sanitizedData = {
                        ...formData,
                        firstName: trimmed(formData.firstName),
                        lastName: trimmed(formData.lastName),
                        email: trimmed(formData.email),
                        phone: digitsOnly(formData.phone),
                        nationalId: digitsOnly(formData.nationalId),
                        streetAddress: trimmed(formData.streetAddress),
                        city: trimmed(formData.city),
                        state: trimmed(formData.state),
                        zipCode: digitsOnly(formData.zipCode)
                      };
                      
                      // Validate using sanitized data
                      let error: string | null = null;
                      
                      if (trimmed(sanitizedData.firstName).length === 0) error = "Please enter your first name.";
                      else if (trimmed(sanitizedData.lastName).length === 0) error = "Please enter your last name.";
                      else if (!sanitizedData.country) error = "Please choose your country.";
                      else if (digitsOnly(sanitizedData.phone).length === 0) error = "Please enter your phone number.";
                      else if (digitsOnly(sanitizedData.phone).length < 10) error = "Please enter a valid phone number.";
                      else if (trimmed(sanitizedData.email).length === 0) error = "Please enter your email.";
                      else if (!sanitizedData.email.includes("@") || !sanitizedData.email.includes(".")) error = "Please enter a valid email address.";
                      else if (!sanitizedData.nationalId) error = "Please enter your national ID number.";
                      else if (sanitizedData.country === 'BR' && digitsOnly(sanitizedData.nationalId).length !== 11) error = "CPF must be exactly 11 digits.";
                      else {
                        // Birthdate validation
                        const d = parseInt(sanitizedData.birthDay);
                        const m = parseInt(sanitizedData.birthMonth);
                        const y = parseInt(sanitizedData.birthYear);
                        
                        if (!d || !m || !y) error = "Please enter a valid birth date.";
                        else if (d < 1 || d > 31) error = "Please enter a valid birth day.";
                        else if (m < 1 || m > 12) error = "Please enter a valid birth month.";
                        else if (y < 1900 || y > 2025) error = "Please enter a valid birth year.";
                      }
                      
                      if (error) {
                        setValidationError(error);
                        return;
                      }
                      
                      // Only sanitize and proceed if validation passes
                      sanitizeStep1();
                      setValidationError(null);
                      setStep(2);
                      window.scrollTo(0, 0);
                      
                      // Create customer in background without blocking UI
                      createCustomer()
                        .then(customerResult => {
                          if (customerResult) {
                            // Handle different return types from createCustomer
                            let customerId: string;
                            let existingAccountData: any = null;
                            
                            if (typeof customerResult === 'string') {
                              // New customer - just the ID
                              customerId = customerResult;
                            } else if (typeof customerResult === 'object') {
                              // Existing customer with account data
                              customerId = customerResult.customer_id;
                              existingAccountData = customerResult;
                            } else {
                              console.error('Unexpected customer result type:', customerResult);
                              return;
                            }
                            
                            localStorage.setItem('customerId', customerId)
                            console.log('Created and saved customer ID in background:', customerId)
                            
                            // If user chose to use existing account, skip to step 4
                            if (existingAccountData?.use_existing_account) {
                              console.log('Using existing account, skipping to step 4')
                              localStorage.setItem('existingAccountData', JSON.stringify(existingAccountData))
                              setStep(3)
                              window.scrollTo(0, 0)
                            }
                            // For new customers, continue normal flow (stay on step 2)
                          }
                        })
                        .catch(error => {
                          console.error('Failed to create customer in background:', error)
                        })
                    }}
                    disabled={
                      !formData.firstName || !formData.lastName || 
                      !formData.nationalId || !formData.email || !formData.dateOfBirth || 
                      !formData.phone || !formData.country || !formData.streetAddress || 
                      !formData.city || !formData.state || !formData.zipCode ||
                      validationError !== null ||
                      (formData.country === 'BR' && digitsOnly(formData.nationalId).length !== 11)
                    }
                  >
                    Continue to Bank Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Delivery Method Selection */}
          {step === 2 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Choose Your Delivery Method</span>
                </CardTitle>
                <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  Select how you'd like us to deliver your payment to the school
                </p>
              </CardHeader>
              <CardContent>
                {/* USD Bank Transfer - Single Option */}
                <div className="max-w-md mx-auto p-6">
                  <div 
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.deliveryMethod === "usd-bank-transfer" 
                        ? "border-success bg-success/5" 
                        : "border-muted hover:border-success/50"
                    }`}
                    onClick={() => handleInputChange("deliveryMethod", "usd-bank-transfer")}
                  >
                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="text-lg text-foreground mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                          Convert BRL to USD and send to US Bank Account
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Fast and secure payment to any US bank account
                        </p>
                        <div className="space-y-2 text-left text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-success rounded-full" />
                            <span>BRL converted and USD sent directly to the receiving bank account</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-success rounded-full" />
                            <span>Processing time: Less than 30 minutes during bank business hours</span>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACH Information Section */}
                {formData.deliveryMethod === "usd-bank-transfer" && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>US Bank Account Information</h3>
                    <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      We'll need the receiving US bank account details to send the USD payment
                    </p>
                    
                    <div className="max-w-2xl">
                      <div className="space-y-6">
                        <div className="w-full">
                          <Label htmlFor="accountHolderName">Account Holder Name</Label>
                          <Input
                            id="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                            placeholder="Enter account holder's full name"
                            className="w-full mt-1"
                          />
                        </div>
                        <div className="w-full relative">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={formData.bankName}
                            onChange={(e) => handleBankNameChange(e.target.value)}
                            onFocus={() => {
                              if (formData.bankName.length > 0 && bankSuggestions.length > 0) {
                                setShowBankSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow click on suggestion
                              setTimeout(() => setShowBankSuggestions(false), 200);
                            }}
                            placeholder="Enter bank name (e.g. Chase, Bank of America)"
                            className="w-full mt-1"
                            autoComplete="off"
                          />
                          {showBankSuggestions && bankSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {bankSuggestions.map((bankKey) => (
                                <div
                                  key={bankKey}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => selectBank(bankKey)}
                                  style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                                >
                                  {bankKey.split(' ').map(word => {
                                    if (word.toLowerCase() === 'us') {
                                      return 'US';
                                    }
                                    return word.charAt(0).toUpperCase() + word.slice(1);
                                  }).join(' ')}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="w-full">
                          <Label htmlFor="bankStreetAddress">Bank Street Address</Label>
                          <Input
                            id="bankStreetAddress"
                            value={formData.bankStreetAddress}
                            onChange={(e) => handleInputChange("bankStreetAddress", e.target.value)}
                            placeholder="Enter bank's street address"
                            className="w-full mt-1"
                          />
                          {formData.bankAddressAutopopulated ? (
                            <p className="text-xs font-bold text-green-600 mt-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              Bank headquarters autopopulated - this will work for your transaction
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              Put the address of any bank branch or the main headquarters as found online
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <Label htmlFor="bankCity">Bank City</Label>
                          <Input
                            id="bankCity"
                            value={formData.bankCity}
                            onChange={(e) => handleInputChange("bankCity", e.target.value)}
                            placeholder="Enter bank's city"
                            className="w-full mt-1"
                          />
                        </div>
                        <div className="w-full">
                          <Label htmlFor="bankState">Bank State</Label>
                          <Input
                            id="bankState"
                            value={formData.bankState}
                            onChange={(e) => handleInputChange("bankState", e.target.value)}
                            placeholder="Enter bank's state"
                            className="w-full mt-1"
                          />
                        </div>
                        <div className="w-full">
                          <Label htmlFor="bankZipCode">Bank ZIP Code</Label>
                          <Input
                            id="bankZipCode"
                            value={formData.bankZipCode}
                            onChange={(e) => handleInputChange("bankZipCode", e.target.value)}
                            placeholder="Enter bank's ZIP code"
                            className="w-full mt-1"
                          />
                        </div>
                        <div className="w-full">
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            value={formData.routingNumber}
                            onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                            placeholder="Enter 9-digit routing number"
                            className="w-full mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                            Use your bank's domestic wire routing number. This may be auto-populated, but please double-check as some specific bank locations may have a different routing number.
                          </p>
                        </div>
                        <div className="w-full">
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={formData.accountNumber}
                            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                            placeholder="Enter account number"
                            className="w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => { setStep(1); window.scrollTo(0, 0); }} style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}>
                    Back to Personal Info
                  </Button>
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={async () => {
                      // Sanitize inputs first
                      sanitizeStep2();
                      
                      // Validate step 2
                      const error = validateStep2();
                      if (error) {
                        setValidationError(error);
                        return;
                      }
                      
                      // Clear any existing errors
                      setValidationError(null);
                      
                      if (formData.deliveryMethod === "usd-bank-transfer") {
                        try {
                          console.log('Retrieving customer ID...');
                          const customerId = await getLastCustomerId();
                          console.log('Retrieved customer ID:', customerId);
                          
                          // Check if we have existing account data from customer creation
                          const existingAccountDataStr = localStorage.getItem('existingAccountData');
                          let existingAccountData = null;
                          if (existingAccountDataStr) {
                            try {
                              existingAccountData = JSON.parse(existingAccountDataStr);
                              // Clean up after use
                              localStorage.removeItem('existingAccountData');
                            } catch (e) {
                              console.error('Failed to parse existing account data:', e);
                            }
                          }
                          
                          console.log('Creating external account for customer:', customerId);
                          await createExternalAccount(customerId, existingAccountData);
                          console.log('External account created successfully, moving to next step.');
                          setStep(3);
                          window.scrollTo(0, 0);
                        } catch (error) {
                          console.error('Failed to create external account:', error);
                          setValidationError('Failed to create external account. Please try again.');
                        }
                      } 
                    }}
                    disabled={
                      !formData.deliveryMethod || 
                      (formData.deliveryMethod === "usd-bank-transfer" && 
                       (!formData.routingNumber || !formData.accountNumber || !formData.accountHolderName))
                    }
                  >
                    {formData.deliveryMethod === "usd-bank-transfer" ? "Continue to Payment Details" : "Continue to School Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

         

          {/* Step 3: Payment Details */}
          {step === 3 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">

                  <span>Payment Amount</span>
                </CardTitle>
                <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  Enter the amount due to get your final quote
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Live Quote Section - Matching Header Dropdown Style */}
                <div className="bg-gray-100 rounded-2xl shadow-lg border border-gray-200 p-4">
                  {/* Hint Section */}
                  {!amountBRL && !formData.amountUSD && (
                    <div className="text-center py-3 mb-3 bg-[#FFEC7D]/20 rounded-xl border border-[#FFEC7D]/50">
                      <p className="text-sm font-medium text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        Click on any amount below to start typing your transfer amount
                      </p>
                      <p className="text-xs text-gray-600 mt-1" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        Example: Type R$5,400 to send or $1,000 to receive
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {/* BRL Input Card */}
                    <div className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#0C3E3F]/20">
                      <div className="flex items-center gap-4">
                        <img src={brazilFlag} alt="Brazil" className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-semibold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            You Send from Brazil
                          </div>
                          <div className="text-sm text-gray-600" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Pay with Pix
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-bold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>R$</span>
                            <Input
                              id="amountBRL"
                              type="text"
                              placeholder={`${(exchangeRate * 1000).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                              className="text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus:ring-0 focus:border-0 focus:outline-none focus:shadow-none flex-1 cursor-text placeholder:text-gray-400"
                              style={{ 
                                border: 'none', 
                                boxShadow: 'none', 
                                fontFamily: "'Satoshi Variable', sans-serif",
                                color: amountBRL ? '#0C3E3F' : '#9CA3AF'
                              }}
                              value={amountBRL}
                              onChange={(e) => {
                                setAmountBRL(e.target.value)
                                // Auto-calculate USD amount
                                if (e.target.value) {
                                  const usdAmount = (parseFloat(e.target.value) / exchangeRate).toFixed(2);
                                  handleInputChange("amountUSD", usdAmount);
                                } else {
                                  handleInputChange("amountUSD", '');
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* USD Output Card */}
                    <div className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#0C3E3F]/20">
                      <div className="flex items-center gap-4">
                        <img src={usFlag} alt="United States" className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-semibold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            You Receive in USA
                          </div>
                          <div className="text-sm text-gray-600" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Direct to a bank account
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-bold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>$</span>
                            <Input
                              id="amountUSD"
                              type="text"
                              placeholder="1,000.00"
                              className="text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus:ring-0 focus:border-0 focus:outline-none focus:shadow-none flex-1 cursor-text placeholder:text-gray-400"
                              style={{ 
                                border: 'none', 
                                boxShadow: 'none', 
                                fontFamily: "'Satoshi Variable', sans-serif",
                                color: formData.amountUSD ? '#0C3E3F' : '#9CA3AF'
                              }}
                              value={formData.amountUSD}
                              onChange={(e) => {
                                handleInputChange("amountUSD", e.target.value)
                                // Auto-calculate BRL amount
                                if (e.target.value) {
                                  const brlAmount = (parseFloat(e.target.value) * exchangeRate).toFixed(2);
                                  setAmountBRL(brlAmount);
                                } else {
                                  setAmountBRL('');
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Exchange Rate Display Below Cards */}
                    <div className="text-center py-3   ">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        
                        <span className="text-lg font-bold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          {exchangeRate ? exchangeRate.toFixed(3) : '...'} BRL = 1 USD
                        </span>
                      </div>
                      <p className="text-sm text-[#0C3E3F]/80" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        Best rate on the market • No IOF Tax
                      </p>
                    </div>
                  </div>
                </div>

                {formData.paymentMethod && (
                <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Review Your Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {formData.paymentMethod === "pix" ? (
                        <>
                          <p>• Pay using PIX instant transfer from your Brazilian bank account</p>
                          <p>• Funds converted from BRL to USD for payment</p>
                          <p>• Processing time: Instant PIX transfer, {formData.deliveryMethod === "check-to-school" ? "5-7 days for check delivery" : "within 3 hours for USD bank transfer"}</p>
                        </>
                      ) : (
                        <>
                          <p>• International payment processing</p>
                          <p>• Currency conversion handled automatically</p>
                          <p>• Processing time: {formData.deliveryMethod === "check-to-school" ? "5-7 days for check delivery" : "Within 3 hours for USD bank transfer"}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-info-muted p-4 rounded-lg border border-info/20">
                  <div className="flex items-center space-x-3">

                    <div>
                      <p className="font-satoshi font-medium text-foreground">Get your locked quote</p>
                      <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        Your quote will be locked for 5 minutes, giving you time to complete payment at the guaranteed rate.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => { setStep(2); window.scrollTo(0, 0); }}>
                  Back to Bank Account Info
                  </Button>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleGetQuote}
                    disabled={
                      (inputCurrency === 'USD' ? !formData.amountUSD : !amountBRL) || !formData.paymentMethod || isLoading
                    }
                  >
                    {isLoading ? "Generating Quote..." : "Get Locked Quote"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          
          {false && (
            <div className="space-y-6">
              <Card className="shadow-card border-0 border-l-4 border-l-success">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">

                      <span>Your Locked Quote</span>
                    </div>
                    <Badge variant="secondary" className="bg-success-muted text-success">
                      Valid for {formatCountdown(countdownSeconds)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Payment Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Final Cost Breakdown</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transfer Amount</span>
                          <p className="text-2xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>${quote.amount_usd.toFixed(2)} USD</p>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exchange Rate</span>
                          <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>1 USD = {quote.effective_rate.toFixed(4)} BRL</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>$<span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{quote.amount_usd.toFixed(2)}</span> USD × <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{quote.effective_rate.toFixed(4)}</span> = <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{(quote.amount_usd * quote.effective_rate).toFixed(2)}</span> BRL</p>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">FX Markup</span>
                          <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{quote.total_fees_usd.toFixed(2)} USD</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Network Fee</span>
                          <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{quote.off_ramp.flat_fee.toFixed(2)} USD</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{quote.on_ramp.flat_fee.toFixed(2)} USD</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between text-lg" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                          <span>Total You Pay</span>
                          <span className="text-primary" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{(quote.amount_usd * quote.effective_rate).toFixed(2)} BRL</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Process */}
                    <div className="space-y-4">
                      <h4 style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Details</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-satoshi-variable font-bold mt-0.5">1</div>
                          <div>
                            <p className="font-satoshi font-medium text-sm">Complete Payment</p>
                            <p className="text-2xl font-satoshi-variable font-bold text-foreground">{(quote.amount_usd * quote.effective_rate).toFixed(2)} BRL</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-satoshi-variable font-bold mt-0.5">2</div>
                          <div>
                            <p className="font-satoshi font-medium text-sm">Check Processing</p>
                            <p className="text-xs text-muted-foreground font-inter">We prepare and mail your $<span className="font-satoshi-variable font-bold">{totals.amountUSD.toFixed(2)}</span> USD check</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white text-xs font-satoshi-variable font-bold mt-0.5">3</div>
                          <div>
                            <p className="font-satoshi font-medium text-sm">Delivery Confirmation</p>
                            <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Check delivered to {formData.schoolName}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border" style={{backgroundColor: '#FFEE8C', borderColor: '#FFEE8C'}}>
                    <div className="flex items-center space-x-3">

                      <div>
                        <p className="font-satoshi font-medium text-foreground">Quote expires in 5 minutes</p>
                        <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Complete your payment now to lock this rate.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => { setStep(3); window.scrollTo(0, 0); }}>
                      Back to Edit Amount
                    </Button>
                    <Button variant="hero" size="lg" onClick={() => { setStep(4); window.scrollTo(0, 0); }}>
                      Continue to Payment Authorization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Payment Authorization Agreement */}
          {step === 4 && quote && (
            <Card className="shadow-card border-0 border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">

                  <span>Payment Authorization Agreement</span>
                </CardTitle>
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                    Final step: Please review and authorize this payment
                  </p>
                  {countdownSeconds > 0 && (
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full border" style={{backgroundColor: '#FFEE8C20', borderColor: '#FFEE8C'}}>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{backgroundColor: '#FFEE8C75'}}></span>
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{backgroundColor: '#FFEE8C'}}></span>
                      </span>
                      <span className="text-sm font-satoshi font-medium text-black">
                        Quote expires in {Math.floor(countdownSeconds / 60)}:{String(countdownSeconds % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Payment Summary */}
                <div className="space-y-6">
                  <h3 className="text-lg text-foreground mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Summary</h3>
                  
                  {/* Quote Breakdown */}
                  <div className="space-y-4 bg-muted/10 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">BRL to USDC Rate</span>
                        <span>{quote.on_ramp.quotation} BRL = 1 USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">USDC to USD Rate</span>
                        <span>1 USDC = {quote.off_ramp.quotation} USD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Effective Rate</span>
                        <span className="font-satoshi-variable font-bold">{quote.effective_rate.toFixed(3)} BRL = 1 USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">USD Amount</span>
                      <span className="font-satoshi-variable font-bold">${quote.amount_usd.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                     
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-satoshi font-medium">
                          <span>Total Amount</span>
                          <div className="text-right">
                            <div className="font-satoshi-variable font-bold">{quote.total_local_amount.toFixed(2)} BRL</div>
                            <div className="text-sm text-muted-foreground font-inter">$<span className="font-satoshi-variable font-bold">{quote.amount_usd.toFixed(2)}</span> USD</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                
                </div>

                {/* Authorization Statement */}
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg text-foreground mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Authorization Statement</h3>
                  <div className="space-y-4">
                    <p className="text-foreground text-base leading-relaxed">
                      <span className="font-inter">By clicking confirm below, I authorize Crebit to act as my agent and transmit the above amount of <strong className="font-satoshi-variable font-bold">${quote.amount_usd.toFixed(2)} USD</strong> to the given bank account using the payment instructions I have provided.</span>
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>I acknowledge that:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• I cannot withdraw or redirect funds once payment processing begins</li>
                        <li>• Crebit acts only as my agent and is not a bank or money transmitter</li>
                        <li>• I have reviewed and agree to the Terms of Service and Privacy Policy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Legal References */}
                <div className="bg-info/5 p-4 rounded-lg border border-info/20">
                  <p className="text-sm text-muted-foreground">
                    This authorization is governed by our{" "}
                    <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>.
                    Please review these documents if you haven't already.
                  </p>
                </div>

                {/* Agreement Checkbox */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="payment-authorization"
                      checked={authorizationAgreed}
                      onCheckedChange={(checked) => setAuthorizationAgreed(checked as boolean)}
                    />
                    <label 
                      htmlFor="payment-authorization" 
                      className="text-sm font-inter leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I have read, understood, and agree to authorize this payment. I confirm that all information provided is accurate and that I have the legal authority to make this payment authorization.
                    </label>
                  </div>

                  {authorizationAgreed && (
                    <div className="bg-yellow/10 p-4 rounded-lg border border-yellow/30">
                      <p className="text-sm text-foreground">
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-4 h-4 text-success" />
                          <span>Authorization acknowledged. Digital signature will be recorded upon confirmation.</span>
                        </div>
                      </p>
                    </div>
                  )}
                </div>

                {/* Final Action Buttons */}
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => { setStep(3); window.scrollTo(0, 0); }}>
                    Back to Payment Details
                  </Button>
                  <Button 
                    onClick={handlePaymentAuthorization}
                    disabled={!authorizationAgreed}
                    className="font-satoshi font-medium"
                    style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
                  >
                    Proceed to Payment
                  </Button>
                </div>
                {authorizationTimestamp && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      Digital Signature Recorded: {new Date(authorizationTimestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Payment Processing - Country Specific */}
          {step === 5 && quote && authorizationTimestamp && (
            <div className="space-y-6">
              {/* Countdown Timer - Hidden when processing or payment received */}
              {!payinProcessing && !paymentReceived && countdownSeconds > 0 && (
                <Card className="shadow-card border-0 border-l-4 border-l-warning">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">

                        <div>
                          <p className="font-satoshi font-medium text-foreground">Quote expires in:</p>
                          <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Complete payment before timer expires</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-satoshi-variable font-bold ${countdownSeconds <= 60 ? 'text-destructive' : 'text-warning'}`}>
                        {formatCountdown(countdownSeconds)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Brazil - PIX Payment */}
              {formData.country === "brazil" && (
                <Card className="shadow-card border-0 border-l-4 border-l-success">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">

                      <span>PIX Payment - Brazil</span>
                    </CardTitle>
                    <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      Complete your payment using PIX to fund your money transfer
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Details</h3>
                          <div className="space-y-2 text-sm">
                            <p className="font-inter"><strong>Amount to Pay:</strong> <span className="font-satoshi-variable font-bold">{pixPayment ? pixPayment.amount_brl.toFixed(2) : quote.total_local_amount.toFixed(2)} BRL</span></p>
                            <p className="font-inter"><strong>USD Amount:</strong> <span className="font-satoshi-variable font-bold">${quote.amount_usd.toFixed(2)}</span></p>
                            <p className="font-inter"><strong>Exchange Rate:</strong> <span className="font-satoshi-variable font-bold">1 USD = {quote.effective_rate.toFixed(2)} BRL</span></p>
                            
                          </div>
                          
                          <div className="p-4 rounded-lg border" style={{backgroundColor: '#FFEE8C20', borderColor: '#FFEE8C'}}>
                            <p className="text-sm" style={{color: '#8B5A00'}}>
                              <strong>Payment Window:</strong> Please complete your PIX payment within 5 minutes to lock in this exchange rate.
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-4">
                          <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>PIX QR Code</h3>
                          {payinProcessing ? (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl">
                                <div className="text-center space-y-6">
                                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                                      Payment Processing Complete!
                                    </h3>
                                    <p className="text-gray-600 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
                                      Your PIX payment has been received and we're now processing your USD transfer.
                                    </p>
                                  </div>
                                  
                                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                                      Transfer Timeline
                                    </h4>
                                    <p className="text-sm text-blue-800" style={{fontFamily: "'Inter', sans-serif"}}>
                                      On business days during the receiving bank's business hours, you should receive the payment in the receiving bank account <strong>within 1 hour</strong>.
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <p className="text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif"}}>
                                      You can safely close this screen. Your payment is being processed automatically.
                                    </p>
                                    
                                    <div className="p-3 rounded-lg border" style={{backgroundColor: '#FFEE8C', borderColor: '#FFEE8C'}}>
                                      <p className="text-sm" style={{fontFamily: "'Inter', sans-serif", color: '#8B5A00'}}>
                                        <strong>Want to track your payment?</strong> Create an account to monitor your transfer status in the dashboard and view payment history. 
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button 
                                      variant="outline" 
                                      className="flex-1"
                                      onClick={() => navigate('/')}
                                    >
                                      Close Window
                                    </Button>
                                    <Button 
                                      variant="primary" 
                                      className="flex-1"
                                      onClick={() => navigate('/signup')}
                                    >
                                      Create Account
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : isGeneratingPix ? (
                            <div className="w-48 h-48 flex items-center justify-center mx-auto">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                          ) : pixPayment && !paymentReceived ? (
                            <div className="bg-white p-6 rounded-lg border mx-auto inline-block">
                              {qrCodeDataUrl ? (
                                <img 
                                  src={qrCodeDataUrl} 
                                  alt="PIX QR Code" 
                                  className="w-48 h-48"
                                />
                              ) : pixPayment.transaction?.pix_qr_code ? (
                                <img 
                                  src={pixPayment.transaction.pix_qr_code} 
                                  alt="PIX QR Code" 
                                  className="w-48 h-48"
                                />
                              ) : (
                                <div className="w-48 h-48 bg-black flex items-center justify-center text-white text-xs text-center p-2">
                                  QR CODE<br />
                                  PIX Payment<br />
                                  <span className="font-satoshi-variable font-bold">{pixPayment.amount_brl.toFixed(2)} BRL</span><br />
                                  Transaction: {pixPayment.transaction_id}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-48 h-48 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
                              <p className="text-muted-foreground text-sm text-center">
                                Click "Generate PIX" to create your payment
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground font-inter">
                            Scan with your banking app or copy the PIX key below
                          </p>
                          
                          {/* Transaction Status Indicator */}
                          {pixPayment && (
                            <div className="mt-4 p-3 bg-info/5 rounded-lg border border-info/20">
                              <div className="flex items-center justify-center space-x-2">
                                {paymentReceived ? (
                                  <>
                                    <CheckIcon className="w-4 h-4 text-success" />
                                    <span className="text-sm text-success" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                      Payment received!
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                    Waiting for payment via webhook...
                                  </span>
                                )}
                              </div>
                              {transactionStatus && (
                                <p className="text-xs text-center mt-1 text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                  Status: {transactionStatus.status} | Updated: {new Date(transactionStatus.updated_at).toLocaleTimeString()}
                                </p>
                              )}
                              
                              {/* Mock Webhook Testing Buttons */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>PIX Deposit Address</h3>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        {pixPayment ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-mono break-all pr-2">
                                {(pixPayment as any).deposit_address || pixPayment.transaction?.sender_deposit_instructions?.deposit_address || pixPayment.transaction?.sender?.deposit_address || pixPayment.transaction?.payment_instructions?.pix_code || pixPayment.transaction?.payment_instructions?.deposit_address || pixPayment.transaction?.pix_code || pixPayment.transaction?.deposit_address || pixPayment.transaction?.id || pixPayment.transaction_id}
                              </code>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const textToCopy = (pixPayment as any).deposit_address || pixPayment.transaction?.sender_deposit_instructions?.deposit_address || pixPayment.transaction?.sender?.deposit_address || pixPayment.transaction?.payment_instructions?.pix_code || pixPayment.transaction?.payment_instructions?.deposit_address || pixPayment.transaction?.pix_code || pixPayment.transaction?.deposit_address || pixPayment.transaction?.id || pixPayment.transaction_id;
                                  navigator.clipboard.writeText(textToCopy);
                                  toast({
                                    title: 'Copied!',
                                    description: 'PIX deposit address copied to clipboard',
                                  })
                                }}
                              >
                                Copy Address
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Transaction ID: {pixPayment.transaction_id}<br />
                              Status: {pixPayment.status}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-muted-foreground text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              Generate PIX payment to see deposit address
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {pixPayment && (
                      <div className="space-y-4">
                        <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Transaction Progress</h3>
                        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                          
                          {/* PIX Payment Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              webhookStatus === 'waiting_for_payment' ? 'bg-yellow-500 animate-pulse' : 
                              paymentReceived ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <div>
                              <p className="text-sm font-medium" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                PIX Payment
                              </p>
                              <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                {paymentReceived ? 'Payment received successfully' : 'Waiting for PIX payment confirmation'}
                              </p>
                            </div>
                          </div>

                          
                        
                        </div>
                      </div>
                    )}

                    <div className="bg-info/5 p-6 rounded-lg border border-info/20">
                      <h3 className="text-lg text-foreground mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>How PIX Payment Works</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span>1</span>
                          </div>
                          <p className="font-satoshi font-medium">Scan QR Code</p>
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Use your banking app to scan the PIX QR code</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span>2</span>
                          </div>
                          <p className="font-satoshi font-medium">Confirm Payment</p>
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Verify the amount and complete the PIX transfer</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span>3</span>
                          </div>
                          <p className="font-satoshi font-medium">Instant Processing</p>
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Your payment is processed immediately</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => { setStep(4); window.scrollTo(0, 0); }}>
                        Back to Authorization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Other Countries - Should not appear since only Brazil is supported */}
              {formData.country !== "brazil" && (
                <Card className="shadow-card border-0 border-l-4 border-l-warning">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <XCircleIcon className="w-6 h-6 text-warning" />
                      <span>Country Not Supported</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="p-6 rounded-lg border" style={{backgroundColor: '#FFEE8C20', borderColor: '#FFEE8C'}}>
                      <p className="text-foreground">
                        Currently, Crebit only supports students from Brazil. 
                        Please contact our support team if you have questions about expanding to other countries.
                      </p>
                      <div className="mt-4">
                        <Button variant="primary" asChild>
                          <a href="mailto:jensen@getcrebit.com">Contact Support</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          


          {/* Minimum Amount Modal */}
          <AlertDialog open={showMinimumAmountModal} onOpenChange={setShowMinimumAmountModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span>Minimum Transfer Amount</span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Due to bank policies, the minimum transfer amount is <strong>$16 USD</strong>. 
                  <br /><br />
                  Please adjust your transfer amount to at least $16 USD and try again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowMinimumAmountModal(false)}>
                  Got it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Quote Expiry Modal */}
          <AlertDialog open={showExpiryModal} onOpenChange={setShowExpiryModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2">

                  <span>Quote Expired</span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Your payment quote has expired after 5 minutes. Don't worry if you already paid - your transaction is still processing. Just close this message.
                  <br /><br />
                  If you haven't paid yet, you'll need to get a new quote with current rates before proceeding with your payment.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowExpiryModal(false)}>
                  Close
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleQuoteExpiry}>
                  Get New Quote
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GetStarted;