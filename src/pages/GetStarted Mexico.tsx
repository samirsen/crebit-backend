import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, QrCode, Clock, CheckCircle, AlertCircle } from "lucide-react"

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
import mexicoFlag from "@/assets/Mexico.png"

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
  documentType: string
  taxId: string
  email: string
  dateOfBirth: string
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
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    firstName: "",
    lastName: "",
    documentType: "",
    taxId: "",
    email: "",
    dateOfBirth: "",
    phone: "",
    country: "",
    // Address Information
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    // Delivery Method
    deliveryMethod: "",
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
    amountUSD: "",
    paymentMethod: "spei"
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
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'MXN'>('USD');
  const [amountMXN, setAmountMXN] = useState('');
  const [speiPayment, setSpeiPayment] = useState<{
    success: boolean;
    transaction: any;
    transaction_id: string;
    status: string;
    amount_mxn: number;
    wallet_id: string;
    deposit_address?: string;
    bank_account?: any;
    beneficiary?: any;
  } | null>(null)
  // Removed QR code for SPEI payments
  const [isGeneratingSpei, setIsGeneratingSpei] = useState(false)
  const [speiError, setSpeiError] = useState<string | null>(null);
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
          if (data.payin_processing) {
            setWebhookStatus('processing');
            setPayinProcessing(true);
            
            // Stop the countdown timer when processing starts
            setTimerStoppedForProcessing(true);
            setCountdownSeconds(0);
            
            
          }
          
          if (data.payin_completed) {
            setWebhookStatus('payment_received');
            setPaymentReceived(true);
            setPayinProcessing(false);
            
            // Stop the countdown timer when payment is received
            setCountdownSeconds(0);
            
            // Move to completion step
            setStep(7);
            
            
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
              description: "Funds have been sent to your bank account",
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

  // SPEI payments don't use QR codes - removed QR code generation
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
    
    // Handle payment completion
    if (event.event_type === 'payin.processing' && !paymentReceived) {
      setPaymentReceived(true);
      setOffRampProcessing(true);
      
      
      
      // Move to next step to show processing status
      setStep(7);
    } else if (event.event_type === 'payin.completed' && offRampProcessing) {
      setOffRampProcessing(false);
      
      

      setStep(8);
      
      // Stay on final success page - don't move to referral step yet
      // setStep(9); // Will move to referrals when transfer is complete
    }
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
      setStep(8);
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

  const generateSpeiPayment = async () => {
    setIsGeneratingSpei(true);
    setSpeiError(null);
    
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
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error('No wallet address found. Please try again.');
      }
      
      if (!quote) {
        throw new Error('No quote available. Please generate a quote first.');
      }
      
      // Get sender information from form data
      const senderName = `${formData.firstName} ${formData.lastName}`;
      let senderDocument = formData.taxId; // CURP
      
      if (!senderName || !senderDocument) {
        throw new Error('Sender information (name and CURP) is required for SPEI payment.');
      }
      
      // Clean and validate CURP format for UnblockPay API (18 characters)
      senderDocument = senderDocument.replace(/[^A-Z0-9]/g, ''); // Remove all non-alphanumeric characters
      
      if (senderDocument.length !== 18) {
        throw new Error(`Invalid CURP format. CURP must have 18 characters, but got ${senderDocument.length} characters: ${senderDocument}`);
      }
      
      console.log(`CURP validation: Original: "${formData.taxId}" -> Cleaned: "${senderDocument}" (${senderDocument.length} characters)`);
      
      // Ensure it's a string (UnblockPay API requirement)
      senderDocument = String(senderDocument);
      
      // Get wallet ID from localStorage
      const walletId = localStorage.getItem('walletId');
      if (!walletId) {
        throw new Error('No wallet ID found. Please try again.');
      }
      
      console.log('Generating SPEI payment with:', {
        amount: quote.total_local_amount,
        customerId,
        walletId,
        onRampQuoteId: quote.on_ramp.id,
        senderName,
        senderDocument
      });
      
      // Call the backend to create SPEI payment using the saved on-ramp quote ID
      const speiPaymentResult = await fetch('/api/create-spei-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_mxn: quote.total_local_amount,
          quote_id: quote.on_ramp.id,
          customer_id: customerId,
          sender_clabe: senderDocument, // Using CURP as CLABE for now
          wallet_id: walletId
        })
      });
      
      if (!speiPaymentResult.ok) {
        const errorData = await speiPaymentResult.json();
        throw new Error(errorData.error || 'Failed to create SPEI payment');
      }
      
      const speiPaymentData = await speiPaymentResult.json();
      
      console.log('SPEI payment generated successfully:', speiPaymentData);
      setSpeiPayment(speiPaymentData);
      
      // SPEI payments don't use QR codes - just extract payment details
      console.log('Full SPEI transaction response:', speiPaymentData.transaction);
      
      // Setup webhook listener for this transaction
      console.log('SPEI payment created, waiting for webhook events for transaction:', speiPaymentData.transaction_id);
      
      // Start polling for webhook status updates
      setWebhookStatus('waiting_for_payment');
      startWebhookStatusPolling(speiPaymentData.transaction_id);
      
      toast({
        title: "SPEI Payment Generated",
        description: `Transaction created with ID: ${speiPaymentData.transaction_id}`,
      });
      return speiPaymentData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate SPEI payment';
      console.error('Error generating SPEI payment:', error);
      setSpeiError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsGeneratingSpei(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const createCustomer = async () => {
    try {
      // Debug log current form data
      console.log('Current form data:', formData)

      // Validate all required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone Number',
        dateOfBirth: 'Date of Birth',
        documentType: 'Document Type',
        taxId: 'Tax ID/Document Number',
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
        documentType: formData.documentType,
        taxId: formData.taxId,
        country: formData.country,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      })

      const customerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: sanitizedPhone,
        type: 'individual',
        date_of_birth: formData.dateOfBirth,
        identity_documents: [
          {
            type: formData.documentType,
            value: formData.taxId,
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
      
      // Handle existing customer case
      if (data.existing_customer && data.existing_external_account) {
        // Store existing external account info
        localStorage.setItem('existingExternalAccount', JSON.stringify(data.existing_external_account))
        
        // Show user the option to use existing bank account
        const useExistingAccount = window.confirm(
          `We found an existing account with this information. You have a bank account on file:\n\n` +
          `Bank: ${data.existing_external_account.bank_name || 'N/A'}\n` +
          `Account: ***${(data.existing_external_account.bank_account_number || '').slice(-4)}\n\n` +
          `Would you like to use this existing bank account? Click OK to use it, or Cancel to enter new bank information.`
        )
        
        if (useExistingAccount) {
          // Store the existing account ID for later use
          localStorage.setItem('selectedExternalAccountId', data.existing_external_account.id)
          localStorage.setItem('useExistingAccount', 'true')
          
          toast({
            title: 'Existing Account Found',
            description: 'Using your existing bank account information',
          })
        } else {
          localStorage.setItem('useExistingAccount', 'false')
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

  const createExternalAccount = async (customerId: string) => {
    try {
      console.log('Starting external account creation...');
      
      // Validate bank account fields
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
        account_name: `${formData.accountHolderName}'s USD Account`,
        beneficiary_name: formData.accountHolderName, // Using account holder name as beneficiary
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
        description: "Your bank account details have been securely saved"
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
      
      // Move to step 6 for payment processing
      setStep(6);
      
      // Start the countdown for payment expiration
      setCountdownSeconds(300); // 5 minutes
      
      toast({
        title: 'Payment',
        description: 'Generating your SPEI payment...'
      });

      // Automatically generate SPEI payment for Mexico
      if (formData.country === "mexico") {
        await generateSpeiPayment();
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
    
    if ((step === 5 || step === 6) && countdownSeconds > 0) {
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
  }, [step, countdownSeconds, paymentReceived])

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

  const getLastCustomerId = () => {
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

  const generateQuote = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      let finalAmountUSD: number
      
      if (inputCurrency === 'USD') {
        finalAmountUSD = parseFloat(formData.amountUSD)
        if (isNaN(finalAmountUSD) || finalAmountUSD <= 0) {
          throw new Error('Please enter a valid USD amount')
        }
      } else {
        // MXN input - need two-step process
        const amountMXNValue = parseFloat(amountMXN)
        if (isNaN(amountMXNValue) || amountMXNValue <= 0) {
          throw new Error('Please enter a valid MXN amount')
        }
        
        // Step 1: Get a sample quote to determine current exchange rate
        const sampleResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            symbol: 'USDC/MXN',
            amount_usd: 100 // Sample $100 USD
          })
        })
        
        if (!sampleResponse.ok) {
          const errorData = await sampleResponse.json()
          throw new Error(errorData.error || 'Failed to get exchange rate')
        }
        
        const sampleQuote = await sampleResponse.json()
        const exchangeRate = sampleQuote.total_local_amount / 100 // MXN per USD
        
        // Step 2: Calculate equivalent USD amount
        finalAmountUSD = amountMXNValue / exchangeRate
        
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
          symbol: 'USDC/MXN',
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
      setStep(5)
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
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-satoshi font-medium ${
                    step >= stepNum 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 7 && (
                    <div className={`w-16 h-0.5 mx-2 ${
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
                {step === 3 && "School and student information (for check delivery)"}
                {step === 4 && "Enter payment amount and method"}
                {step === 5 && "Payment authorization and completion"}
                {step === 6 && "Complete your payment"}
                {step === 7 && "Payment received - Processing transfer"}
                {step === 8 && "Transfer complete - Success!"}
                {step === 9 && "Email updates & Refer friends"}
              </p>
            </div>
          </div>

          {/* Step 1: Individual Information */}
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
                    <Label htmlFor="documentType" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Document Type *</Label>
                    <Select value={formData.documentType} onValueChange={(value) => handleInputChange("documentType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        
                        <SelectItem value="national_id">National ID (CURP)</SelectItem>
                        
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxId" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>CURP *</Label>
                    <Input
                      id="taxId"
                      placeholder="Enter your CURP number"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange("taxId", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Country of Citizenship *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country where your document is from" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mexico">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Address Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Street Address *</Label>
                    <Input
                      id="streetAddress"
                      placeholder="Street address, apartment, suite, etc."
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    />
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
                      // Immediately proceed to next step
                      setStep(2)
                      
                      // Create customer in background without blocking UI
                      createCustomer()
                        .then(customerId => {
                          if (customerId) {
                            localStorage.setItem('customerId', customerId)
                            console.log('Created and saved customer ID in background:', customerId)
                            
                            // Check if user chose to use existing account
                            const useExistingAccount = localStorage.getItem('useExistingAccount') === 'true'
                            if (useExistingAccount) {
                              // Skip to step 4
                              console.log('Using existing account, skipping to step 4')
                              setStep(4)
                            }
                          }
                        })
                        .catch(error => {
                          console.error('Failed to create customer in background:', error)
                        })
                    }}
                    disabled={
                      !formData.firstName || !formData.lastName || !formData.documentType || 
                      !formData.taxId || !formData.email || !formData.dateOfBirth || 
                      !formData.phone || !formData.country || !formData.streetAddress || 
                      !formData.city || !formData.state || !formData.zipCode
                    }
                  >
                    Continue to Delivery Method
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
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Check to School - Coming Soon */}
                  <div 
                    className="p-6 rounded-lg border-2 border-muted bg-muted/20 opacity-60 cursor-not-allowed"
                  >
                    <div className="text-center space-y-4">
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <h3 className="text-lg text-foreground mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                            Mail Check to School
                          </h3>
                          <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Coming Soon</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Perfect if you don't have a US bank account
                        </p>
                        <div className="space-y-2 text-left text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>Physical check mailed directly to school</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>Processing time: 5-7 business days</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>Full tracking provided</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3  border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800 mb-2" style={{fontFamily: "'Inter', sans-serif !important"}}>
                            <strong>Launching Spring 2025</strong>
                          </p>
                          <p className="text-xs text-orange-700 mb-3" style={{fontFamily: "'Inter', sans-serif !important"}}>
                            This feature will be available for Spring 2025. Join our waitlist to be notified when it launches!
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-orange-800 bg-orange-50 border-orange-300 hover:bg-orange-100"
                            onClick={() => {
                              window.open('mailto:jensen@getcrebit.com?subject=Check Delivery Waitlist&body=Hi, I would like to join the waitlist for check delivery to schools.', '_blank');
                            }}
                          >
                            Join Waitlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* USD Bank Transfer */}
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
                          USD to Your US Bank Account
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          For those who have a US bank account
                        </p>
                        <div className="space-y-2 text-left text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-success rounded-full" />
                            <span>USD sent directly to your bank account</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-success rounded-full" />
                            <span>Processing time: Less than 1 hour</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-success rounded-full" />
                            <span>School pulls funds via ACH</span>
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
                      We'll need your US bank account details to send the USD payment
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
                        <div className="w-full">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={formData.bankName}
                            onChange={(e) => handleInputChange("bankName", e.target.value)}
                            placeholder="Enter bank name (e.g. Chase, Bank of America)"
                            className="w-full mt-1"
                          />
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

                    <div className="bg-[#17484A]/10 p-4 rounded-lg border border-[#17484A]/20">
                      <p className="text-sm text-[#17484A]">
                        <strong>Note:</strong> You will need to set up ACH pull with your school using this account and put the account info in your school payment portal. We will email you as soon as the USD funds are in your account.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}>
                    Back to Personal Info
                  </Button>
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={async () => {
                      if (formData.deliveryMethod === "usd-bank-transfer") {
                        try {
                          console.log('Retrieving customer ID from localStorage...');
                          const customerId = getLastCustomerId();
                          console.log('Retrieved customer ID:', customerId);
                          
                          console.log('Creating external account for customer:', customerId);
                          await createExternalAccount(customerId);
                          console.log('External account created successfully, moving to next step.');
                          setStep(4);
                        } catch (error) {
                          console.error('Failed to create external account:', error);
                          // Don't proceed to next step if creation failed
                        }
                      } else {
                        setStep(3);
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

          {/* Step 3: School & Student Information (only for check delivery) */}
          {step === 3 && formData.deliveryMethod === "check-to-school" && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">

                  <span>School & Student Information</span>
                </CardTitle>
                <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  Enter details exactly as they appear on your school's payment page
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* School Information */}
                <div className="space-y-4">
                  <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>School Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>School Name *</Label>
                      <div className="relative">
                        <Input
                          id="schoolName"
                          list="schools"
                          placeholder="Start typing your school name..."
                          value={formData.schoolName}
                          onChange={(e) => handleInputChange("schoolName", e.target.value)}
                        />
                        <datalist id="schools">
                          {schools.map(school => (
                            <option key={school} value={school} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payeeName" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payee Name *</Label>
                      <Input
                        id="payeeName"
                        placeholder="e.g., MIT Office of Student Finances"
                        value={formData.payeeName}
                        onChange={(e) => handleInputChange("payeeName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Mailing Address for Checks *</Label>
                    <Input
                      id="streetAddress"
                      placeholder="Street address where check should be mailed"
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
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
                        placeholder="State/Province"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="ZIP/Postal Code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                    <Textarea
                      id="deliveryInstructions"
                      placeholder="Any special delivery instructions..."
                      value={formData.deliveryInstructions}
                      onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
                    />
                  </div>

                  <div className="bg-[#17484A]/10 p-4 rounded-lg border border-[#17484A]/20">
                    <p className="text-sm text-[#17484A]">
                      <strong>Tip:</strong> Go to your school's payment page and find the "pay with check" option to get the exact mailing address and payment information.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Student Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentFullName" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Student Full Name *</Label>
                      <Input
                        id="studentFullName"
                        placeholder="Full name as registered"
                        value={formData.studentFullName}
                        onChange={(e) => handleInputChange("studentFullName", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="studentId" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Student ID *</Label>
                      <Input
                        id="studentId"
                        placeholder="Student ID number"
                        value={formData.studentId}
                        onChange={(e) => handleInputChange("studentId", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termReference">Term/Semester Reference *</Label>
                    <Input
                      id="termReference"
                      placeholder="e.g., Fall 2024, Spring 2025"
                      value={formData.termReference}
                      onChange={(e) => handleInputChange("termReference", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Email for Tracking Updates *</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      placeholder="your-email@example.com"
                      value={formData.studentEmail}
                      onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      We'll send you payment status updates and tracking notifications
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setStep(2)} style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}>
                    Back to Delivery Method
                  </Button>
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={() => setStep(4)}
                    disabled={!formData.schoolName || !formData.payeeName || !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode || !formData.studentFullName || !formData.studentId || !formData.termReference || !formData.studentEmail}
                  >
                    Continue to Payment Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment Details */}
          {step === 4 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">

                  <span>Payment Amount & Method</span>
                </CardTitle>
                <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  Enter the amount due and select your payment method to get your final quote
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Label style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Amount *</Label>
                      <Select value={inputCurrency} onValueChange={(value: 'USD' | 'MXN') => setInputCurrency(value)}>
                        <SelectTrigger className="w-48 bg-gray-100 border-2 border-gray-200 rounded-xl p-2 h-auto">
                          <SelectValue>
                            {inputCurrency === 'USD' ? (
                              <div className="flex items-center gap-2">
                                <img src={usFlag} alt="United States" className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-sm font-semibold" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>USD</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <img src={mexicoFlag} alt="Mexico" className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-sm font-semibold" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>MXN</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">
                            <div className="flex items-center gap-2">
                              <img src={usFlag} alt="United States" className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-sm font-semibold" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>USD</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="MXN">
                            <div className="flex items-center gap-2">
                              <img src={mexicoFlag} alt="Mexico" className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-sm font-semibold" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>MXN</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {inputCurrency === 'USD' ? (
                      <div className="bg-[#FDF2B0] rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-teal-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>YOU NEED TO SEND</span>
                          <div className="flex items-center gap-2">
                            <img src={usFlag} alt="United States" className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-lg font-bold text-teal-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>USD</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-teal-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>$</span>
                          <Input
                            id="amountUSD"
                            type="text"
                            placeholder="1000.00"
                            className="text-3xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus:ring-0 focus:border-0 focus:outline-none focus:shadow-none flex-1 cursor-text placeholder:text-gray-400"
                            style={{ 
                              border: 'none', 
                              boxShadow: 'none', 
                              fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                              color: formData.amountUSD ? '#0C3E3F' : '#9CA3AF'
                            }}
                            value={formData.amountUSD}
                            onChange={(e) => {
                              handleInputChange("amountUSD", e.target.value)
                              setAmountMXN('')
                            }}
                          />
                        </div>
                        <p className="text-xs text-teal-600 mt-2">Enter the USD amount you want to receive</p>
                      </div>
                    ) : (
                      <div className="bg-[#FDF2B0] rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-teal-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>YOU HAVE AVAILABLE</span>
                          <div className="flex items-center gap-2">
                            <img src={mexicoFlag} alt="Mexico" className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-lg font-bold text-teal-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>MXN</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-teal-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>$</span>
                          <Input
                            id="amountMXN"
                            type="text"
                            placeholder="18000.00"
                            className="text-3xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus:ring-0 focus:border-0 focus:outline-none focus:shadow-none flex-1 cursor-text placeholder:text-gray-400"
                            style={{ 
                              border: 'none', 
                              boxShadow: 'none', 
                              fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                              color: amountMXN ? '#0C3E3F' : '#9CA3AF'
                            }}
                            value={amountMXN}
                            onChange={(e) => {
                              setAmountMXN(e.target.value)
                              // Don't update USD field when using MXN input
                            }}
                          />
                        </div>
                        <p className="text-xs text-teal-600 mt-2">Enter the MXN amount you want to transfer</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="paymentMethod" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}} className="mb-2">Payment Method</Label>
                    <div className="flex items-center gap-3 mt-4">
                      <img src={mexicoFlag} alt="Mexico" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-lg font-bold text-foreground" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>SPEI</div>
                        <div className="text-sm text-muted-foreground" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>Mexican Bank Transfer</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Automatically selected for Mexico</p>
                  </div>

                </div>

                {formData.paymentMethod && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Review Your Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {formData.paymentMethod === "spei" ? (
                        <>
                          <p>• Pay using SPEI bank transfer from your Mexican bank account</p>
                          <p>• Funds converted from MXN to USD for tuition payment</p>
                          <p>• Processing time: SPEI transfer (same day), {formData.deliveryMethod === "check-to-school" ? "5-7 days for check delivery" : "within 3 hours for USD bank transfer"}</p>
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
                  <Button variant="outline" onClick={() => setStep(formData.deliveryMethod === "usd-bank-transfer" ? 2 : 3)}>
                    {formData.deliveryMethod === "usd-bank-transfer" ? "Back to Delivery Method" : "Back to School Details"}
                  </Button>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={generateQuote}
                    disabled={
                      (inputCurrency === 'USD' ? !formData.amountUSD : !amountMXN) || !formData.paymentMethod || isLoading
                    }
                  >
                    {isLoading ? "Generating Quote..." : "Get Locked Quote"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Locked Quote */}
          {/* Removed step 5 (quote display) as it was redundant */}
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
                          <span className="text-muted-foreground">Tuition Amount</span>
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

                  <div className="bg-warning-muted p-4 rounded-lg border border-warning/20">
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
                    <Button variant="outline" onClick={() => setStep(4)}>
                      Back to Edit Amount
                    </Button>
                    <Button variant="hero" size="lg" onClick={() => setStep(5)}>
                      Continue to Payment Authorization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Payment Authorization Agreement */}
          {step === 5 && quote && (
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
                    <div className="flex items-center space-x-2 bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning/75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
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
                        <span className="text-muted-foreground">MXN to USDC Rate</span>
                        <span>{quote.on_ramp.quotation} MXN = 1 USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">USDC to USD Rate</span>
                        <span>1 USDC = {quote.off_ramp.quotation} USD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Effective Rate</span>
                        <span className="font-satoshi-variable font-bold">{quote.effective_rate.toFixed(3)} MXN = 1 USD</span>
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
                      <div className="flex justify-between text-sm">
                        <div>
                          <span>Total Fees</span>
                          <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Covers off-ramping fees imposed by the bank</p>
                        </div>
                        <span className="font-satoshi-variable font-bold">${quote.total_fees_usd.toFixed(2)} USD</span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-satoshi font-medium">
                          <span>Total Amount</span>
                          <div className="text-right">
                            <div className="font-satoshi-variable font-bold">{quote.total_local_amount.toFixed(2)} MXN</div>
                            <div className="text-sm text-muted-foreground font-inter">$<span className="font-satoshi-variable font-bold">{quote.amount_usd.toFixed(2)}</span> USD</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student and School Info - Only show for check-to-school delivery */}
                  {formData.deliveryMethod === "check-to-school" && (
                    <div className="grid md:grid-cols-2 gap-4 text-sm pt-4 border-t">
                      <div className="space-y-2">
                        <p><strong>Student:</strong> {formData.firstName} {formData.lastName}</p>
                        <p><strong>Student ID:</strong> {formData.studentId || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>School:</strong> {formData.schoolName || "Your Educational Institution"}</p>
                        <p><strong>Delivery Method:</strong> Check to School</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Authorization Statement */}
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg text-foreground mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Authorization Statement</h3>
                  <div className="space-y-4">
                    <p className="text-foreground text-base leading-relaxed">
                      <span className="font-inter">By clicking confirm below, I authorize <strong>Crebit</strong> to act as my agent and transmit the above amount of <strong className="font-satoshi-variable font-bold">${quote.amount_usd.toFixed(2)} USD</strong> to <strong>{formData.schoolName || "my designated educational institution"}</strong> using the specified payment instructions I have provided.</span>
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>I acknowledge that:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• This payment is for any expense billed by my designated educational institution</li>
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
                  <Button variant="outline" onClick={() => setStep(4)}>
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

          {/* Step 6: Payment Processing - Country Specific */}
          {step === 6 && quote && authorizationTimestamp && (
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

              {/* Mexico - SPEI Payment */}
              {formData.country === "mexico" && (
                <Card className="shadow-card border-0 border-l-4 border-l-success">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">

                      <span>SPEI Payment - Mexico</span>
                    </CardTitle>
                    <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      Complete your payment using SPEI to fund your tuition transfer
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Details</h3>
                          <div className="space-y-2 text-sm">
                            <p className="font-inter"><strong>Amount to Pay:</strong> <span className="font-satoshi-variable font-bold">{speiPayment ? speiPayment.amount_mxn.toFixed(2) : quote.total_local_amount.toFixed(2)} MXN</span></p>
                            <p className="font-inter"><strong>USD Amount:</strong> <span className="font-satoshi-variable font-bold">${quote.amount_usd.toFixed(2)}</span></p>
                            <p className="font-inter"><strong>Exchange Rate:</strong> <span className="font-satoshi-variable font-bold">1 USD = {quote.effective_rate.toFixed(2)} MXN</span></p>
                            <p><strong>Student:</strong> {formData.firstName} {formData.lastName}</p>
                          </div>
                          
                          <div className="bg-warning/5 p-4 rounded-lg border border-warning/20">
                            <p className="text-sm text-warning">
                              <strong>Payment Window:</strong> Please complete your SPEI payment within 5 minutes to lock in this exchange rate.
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-4">
                          <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>SPEI Payment Details</h3>
                          {payinProcessing ? (
                            <div className="w-48 h-48 flex items-center justify-center mx-auto bg-[#17484A]/10 rounded-lg border">
                              <div className="text-center space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#17484A] mx-auto"></div>
                                <p className="text-sm text-[#17484A] font-medium">Processing Payment...</p>
                                <p className="text-sm text-[#17484A]/80">Please wait while we confirm your SPEI payment</p>
                              </div>
                            </div>
                          ) : isGeneratingSpei ? (
                            <div className="w-48 h-48 flex items-center justify-center mx-auto">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                          ) : speiPayment && !paymentReceived ? (
                            <div className="bg-white p-6 rounded-lg border mx-auto max-w-md">
                              <div className="space-y-4">
                                <div className="text-center">
                                  <h4 className="font-semibold text-lg mb-2">SPEI Bank Transfer</h4>
                                  <p className="text-2xl font-bold text-primary">{speiPayment.amount_mxn.toFixed(2)} MXN</p>
                                  <p className="text-sm text-muted-foreground">Transaction: {speiPayment.transaction_id}</p>
                                </div>
                                
                                {/* Deposit Instructions */}
                                <div className="space-y-3 text-sm border-t pt-3">
                                  <h5 className="font-semibold text-center">Deposit Instructions</h5>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="font-medium">Amount:</span>
                                      <span className="font-bold">{speiPayment.amount_mxn.toFixed(2)} MXN</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Payment Method:</span>
                                      <span>SPEI</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">CLABE:</span>
                                      <span className="font-mono">{speiPayment.deposit_address}</span>
                                    </div>
                                  </div>
                                  
                                  {speiPayment.bank_account && (
                                    <div className="space-y-2 border-t pt-2">
                                      <div className="flex justify-between">
                                        <span className="font-medium">Bank:</span>
                                        <span>{speiPayment.bank_account.bank_name}</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {speiPayment.beneficiary && (
                                    <div className="space-y-2 border-t pt-2">
                                      <div className="flex justify-between">
                                        <span className="font-medium">Beneficiary:</span>
                                        <span>{speiPayment.beneficiary.name}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-center text-xs text-muted-foreground border-t pt-2">
                                  Use the bank details above to make your SPEI transfer
                                </div>
                              </div>
                            </div>
                          ) : paymentReceived ? (
                            <div className="w-48 h-48 flex items-center justify-center mx-auto bg-[#17484A]/10 rounded-lg border">
                              <div className="text-center space-y-2">
                                <CheckIcon className="w-12 h-12 text-[#17484A] mx-auto" />
                                <p className="text-sm text-[#17484A] font-medium">Payment Received!</p>
                                <p className="text-xs text-[#17484A]/80">Processing transfer to your bank account</p>
                              </div>
                            </div>
                          ) : (
                            <div className="w-48 h-48 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
                              <p className="text-muted-foreground text-sm text-center">
                                Click "Generate SPEI" to create your payment
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground font-inter">
                            Use the bank details above to make your SPEI transfer
                          </p>
                          
                          {/* Transaction Status Indicator */}
                          {speiPayment && (
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
                      <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>SPEI Transfer Details</h3>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        {speiPayment ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="bg-white p-3 rounded border">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Amount to Transfer:</p>
                                <p className="text-lg font-bold text-primary">{speiPayment.amount_mxn.toFixed(2)} MXN</p>
                              </div>
                              
                              <div className="bg-white p-3 rounded border">
                                <p className="text-xs font-medium text-muted-foreground mb-1">CLABE (Account Number):</p>
                                <code className="text-sm font-mono break-all font-bold">{speiPayment.deposit_address}</code>
                              </div>
                              
                              {speiPayment.bank_account && (
                                <div className="bg-white p-3 rounded border">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Bank Name:</p>
                                  <p className="text-sm font-semibold">{speiPayment.bank_account.bank_name}</p>
                                </div>
                              )}
                              
                              {speiPayment.beneficiary && (
                                <div className="bg-white p-3 rounded border">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Beneficiary Name:</p>
                                  <p className="text-sm font-semibold">{speiPayment.beneficiary.name}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between border-t pt-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const copyText = `SPEI Transfer Details:\nAmount: ${speiPayment.amount_mxn.toFixed(2)} MXN\nCLABE: ${speiPayment.deposit_address}\nBank: ${speiPayment.bank_account?.bank_name || 'N/A'}\nBeneficiary: ${speiPayment.beneficiary?.name || 'N/A'}\nTransaction ID: ${speiPayment.transaction_id}`;
                                  navigator.clipboard.writeText(copyText);
                                  toast({
                                    title: 'SPEI Details Copied',
                                    description: 'All transfer details copied to clipboard',
                                  })
                                }}
                              >
                                Copy Details
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Transaction ID: {speiPayment.transaction_id}<br />
                              Status: {speiPayment.status}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-muted-foreground text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              Generate SPEI payment to see transfer details
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {speiPayment && (
                      <div className="space-y-4">
                        <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Transaction Progress</h3>
                        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                          
                          {/* SPEI Payment Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              webhookStatus === 'waiting_for_payment' ? 'bg-yellow-500 animate-pulse' : 
                              paymentReceived ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <div>
                              <p className="text-sm font-medium" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                SPEI Payment
                              </p>
                              <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                {paymentReceived ? 'Payment received successfully' : 'Waiting for SPEI payment confirmation'}
                              </p>
                            </div>
                          </div>

                          {/* Off-ramp Transaction Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              webhookStatus === 'offramp_created' || offRampProcessing ? 'bg-blue-500 animate-pulse' : 
                              webhookStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <div>
                              <p className="text-sm font-medium" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                Off-ramp Transaction
                              </p>
                              <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                {webhookStatus === 'completed' ? 'Funds sent to bank account' :
                                 offRampTransaction ? `Processing transaction ${offRampTransaction.id}` :
                                 paymentReceived ? 'Creating off-ramp transaction...' : 'Waiting for SPEI payment'}
                              </p>
                              {offRampTransaction && (
                                <p className="text-xs text-muted-foreground mt-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                  Amount: ${offRampTransaction.amount} {offRampTransaction.currency} | Status: {offRampTransaction.status}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Bank Transfer Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              webhookStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <div>
                              <p className="text-sm font-medium" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                Bank Transfer
                              </p>
                              <p className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                {webhookStatus === 'completed' ? 'Transfer completed successfully' : 'Pending off-ramp completion'}
                              </p>
                            </div>
                          </div>

                          {/* Overall Status Message */}
                          {webhookStatus === 'completed' && (
                            <div className="mt-4 p-3 bg-[#17484A]/10 border border-[#17484A]/20 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <CheckIcon className="w-5 h-5 text-[#17484A]" />
                                <p className="text-sm font-medium text-[#17484A]" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                  Transaction Complete!
                                </p>
                              </div>
                              <p className="text-xs text-[#17484A]/80 mt-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                Your tuition payment has been successfully processed and sent to the school's bank account.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-info/5 p-6 rounded-lg border border-info/20">
                      <h3 className="text-lg text-foreground mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>How SPEI Payment Works</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span>1</span>
                          </div>
                          <p className="font-satoshi font-medium">Get Bank Details</p>
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Use the provided bank account details for your SPEI transfer</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span>2</span>
                          </div>
                          <p className="font-satoshi font-medium">Make SPEI Transfer</p>
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Use your bank to make the SPEI transfer with the provided details</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span>3</span>
                          </div>
                          <p className="font-satoshi font-medium">Fast Processing</p>
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Your tuition payment is processed within 1 business day</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => setStep(5)}>
                        Back to Authorization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          {/* Step 7: Payment Received - Processing Transfer */}
          {step === 7 && (
            <div className="space-y-6">
              <Card className="shadow-card border-0 border-l-4 border-l-success">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckIcon className="w-6 h-6 text-success" />
                    <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Received!</span>
                  </CardTitle>
                  <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                    Your SPEI payment has been successfully received and we're now processing your tuition transfer.
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Summary</h3>
                        <div className="space-y-2 text-sm">
                          {speiPayment && (
                            <>
                              <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>Amount Received:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{speiPayment.amount_mxn.toFixed(2)} MXN</span></p>
                              <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>Transaction ID:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{speiPayment.transaction_id}</span></p>
                            </>
                          )}
                          {quote && (
                            <>
                              <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>USD Amount:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>${quote.amount_usd.toFixed(2)}</span></p>
                              <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>Exchange Rate:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>1 USD = {quote.effective_rate.toFixed(2)} MXN</span></p>
                            </>
                          )}
                          <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>Student:</strong> {formData.firstName} {formData.lastName}</p>
                          <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>School:</strong> {formData.schoolName}</p>
                        </div>
                        
                        {transactionStatus && (
                          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                            <p className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              <strong>Status:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{transactionStatus.status}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              Last updated: {new Date(transactionStatus.updated_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center space-y-4">
                        <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Processing Status</h3>
                        {offRampProcessing ? (
                          <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto">
                              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-success"></div>
                            </div>
                            <div className="space-y-2">
                              <p style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}} className="text-success">Processing Transfer</p>
                              <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                Your money is now en route to your US bank account. Wire transfers typically take approximately 1 hour to complete.
                              </p>
                            </div>
                            
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <CheckIcon className="w-16 h-16 text-success mx-auto" />
                            <div className="space-y-2">
                              <p style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}} className="text-success">Transfer Complete</p>
                              <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                                Your funds have been successfully transferred to your US bank account and are now available for tuition payment.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-info/5 p-6 rounded-lg border border-info/20">
                    <h3 className="text-lg text-foreground mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>What happens next?</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckIcon className="w-6 h-6 text-success" />
                        </div>
                        <p style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Received</p>
                        <p className="text-muted-foreground text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Your PIX payment was successfully processed
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span>2</span>
                        </div>
                        <p style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>USD Transfer</p>
                        <p className="text-muted-foreground text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Converting to USD and wiring to your US bank account (approximately 1 hour)
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span>3</span>
                        </div>
                        <p style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>School Payment</p>
                        <p className="text-muted-foreground text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Use the USD funds to pay your tuition directly
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Referral Program Section - Available Immediately */}
                  <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <h3 className="text-xl text-success" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                          🎉 Earn $100 for Each Friend You Refer!
                        </h3>
                        <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          While your transfer processes, invite friends to use Crebit and earn $100 for each successful signup!
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {referralEmails.map((email, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="email"
                              placeholder="friend@example.com"
                              value={email}
                              onChange={(e) => updateReferralEmail(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                              style={{fontFamily: "'Inter', sans-serif !important"}}
                            />
                            {referralEmails.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeReferralEmail(index)}
                                className="px-2"
                              >
                                ✕
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addReferralEmail}
                          className="w-full"
                        >
                          + Add Another Email
                        </Button>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button
                          onClick={submitReferrals}
                          disabled={isSubmittingReferrals}
                          className="font-satoshi font-medium"
                          style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
                        >
                          {isSubmittingReferrals ? 'Sending...' : 'Send Referrals & Earn $100 Each'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-muted-foreground mb-4" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      You'll receive email updates about your transfer status. Questions? Contact our support team.
                    </p>
                    <div className="space-x-4">
                      <Button variant="outline" asChild>
                        <a href="mailto:jensen@getcrebit.com">Contact Support</a>
                      </Button>
                      <Button onClick={() => navigate('/')}>
                        Return to Home
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 8: Transfer Complete - Final Success State */}
          {step === 8 && (
            <div className="space-y-6">
              <Card className="shadow-card border-0 border-l-4 border-l-success">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {offRampProcessing ? (
                      <>
                        <div className="w-6 h-6">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-success"></div>
                        </div>
                        <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Processing Transfer...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-6 h-6 text-success" />
                        <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Transfer Complete!</span>
                      </>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                    {offRampProcessing ? (
                      "Your PIX payment was received successfully. We're now processing your USD transfer to your bank account."
                    ) : (
                      "Your tuition payment has been successfully processed and transferred to your bank account."
                    )}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                        {offRampProcessing ? (
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-success"></div>
                        ) : (
                          <CheckIcon className="w-10 h-10 text-success" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl text-success" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                          {offRampProcessing ? "Processing USD Transfer" : "Payment Successfully Completed"}
                        </h3>
                        <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          {offRampProcessing ? (
                            "Converting your BRL to USD and initiating the transfer to your bank account. This process can take a few hours to complete."
                          ) : (
                            "Your USD funds have been transferred to your bank account and are ready to use for tuition payment."
                          )}
                        </p>
                      </div>
                      
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Transaction Summary</h3>
                      <div className="space-y-2 text-sm">
                        {speiPayment && (
                          <>
                            <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>MXN Paid:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{speiPayment.amount_mxn.toFixed(2)} MXN</span></p>
                            <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>Transaction ID:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{speiPayment.transaction_id}</span></p>
                          </>
                        )}
                        {quote && (
                          <>
                            <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>USD Received:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>${quote.amount_usd.toFixed(2)}</span></p>
                            <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>Exchange Rate:</strong> <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>1 USD = {quote.effective_rate.toFixed(2)} MXN</span></p>
                          </>
                        )}
                        <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>Student:</strong> {formData.firstName} {formData.lastName}</p>
                        <p style={{fontFamily: "'Inter', sans-serif !important"}}><strong>School:</strong> {formData.schoolName}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Next Steps</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <CheckIcon className="w-4 h-4 text-success mt-0.5" />
                          <p style={{fontFamily: "'Inter', sans-serif !important"}}>Check your bank account for the USD transfer</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckIcon className="w-4 h-4 text-success mt-0.5" />
                          <p style={{fontFamily: "'Inter', sans-serif !important"}}>Use the funds to pay your tuition directly</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckIcon className="w-4 h-4 text-success mt-0.5" />
                          <p style={{fontFamily: "'Inter', sans-serif !important"}}>Keep transaction records for your records</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      {offRampProcessing ? (
                        "We'll send you email updates as your transfer progresses. The process typically takes 2-4 hours during business hours."
                      ) : (
                        "Thank you for using Crebit for your tuition payment. You'll receive email confirmations shortly."
                      )}
                    </p>
                    <div className="space-x-4">
                      <Button variant="outline" asChild>
                        <a href="mailto:jensen@getcrebit.com">Contact Support</a>
                      </Button>
                      {!offRampProcessing && (
                        <>
                          <Button onClick={() => setStep(9)}>
                            Refer Friends & Earn $100
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/')}>
                            Return to Home
                          </Button>
                        </>
                      )}
                      {offRampProcessing && (
                        <Button onClick={() => navigate('/')}>
                          Return to Home
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 9: Email Updates & Referral Program */}
          {step === 9 && (
            <div className="space-y-6">
              <Card className="shadow-card border-0 border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Stay Updated & Earn Rewards</span>
                  </CardTitle>
                  <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                    We'll keep you informed about your transaction status and you can earn rewards by referring friends!
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Email Updates Section */}
                  <div className="bg-info/5 p-6 rounded-lg border border-info/20">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center mt-1">
                          <span className="text-xs font-medium text-primary">📧</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Email Updates</h4>
                          <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>You'll receive email notifications at <strong>{formData.email}</strong> for:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4 mt-2" style={{fontFamily: "'Inter', sans-serif !important"}}>
                            <li>• Transaction confirmation and receipt</li>
                            <li>• Bank transfer completion updates</li>
                            <li>• Any issues that require your attention</li>
                            <li>• Referral program rewards notifications</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referral Program Section */}
                  <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl">🎁</span>
                        </div>
                        <h3 className="text-xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                          Earn $100 Gift Cards!
                        </h3>
                        <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Refer friends who need to make tuition payments and earn a <strong>$100 gift card of your choice</strong> for each successful signup!
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                          Refer Your Friends
                        </h4>
                        <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                          Enter email addresses of friends who might need our tuition payment service:
                        </p>
                        
                        <div className="space-y-3">
                          {referralEmails.map((email, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="email"
                                placeholder="friend@example.com"
                                value={email}
                                onChange={(e) => updateReferralEmail(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                                style={{fontFamily: "'Inter', sans-serif !important"}}
                              />
                              {referralEmails.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeReferralEmail(index)}
                                  className="px-2"
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addReferralEmail}
                            className="w-full"
                          >
                            + Add Another Email
                          </Button>
                        </div>

                        <div className="bg-warning/5 p-4 rounded-lg border border-warning/20">
                          <p className="text-sm text-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                            <strong>How it works:</strong>
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                            <li>• We'll send your friends an invitation to try Crebit</li>
                            <li>• When they complete their first tuition payment, you both win!</li>
                            <li>• You get a $100 gift card (Amazon, Apple, or your choice)</li>
                            <li>• They get priority support and exclusive rates</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(8)}
                    >
                      Skip Referrals
                    </Button>
                    <div className="space-x-3">
                      <Button
                        onClick={submitReferrals}
                        disabled={isSubmittingReferrals}
                        className="font-satoshi font-medium"
                        style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
                      >
                        {isSubmittingReferrals ? 'Sending...' : 'Send Referrals & Continue'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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