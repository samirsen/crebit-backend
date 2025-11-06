import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface SignUpFormData {
  // Personal Information (KYC)
  firstName: string;
  lastName: string;
  documentType: string;
  taxId: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  country: string;
  // Address Information
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  // Account Information
  password: string;
  confirmPassword: string;
  // Optional US Bank Account
  hasUSBankAccount: boolean;
  routingNumber: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  bankStreetAddress: string;
  bankCity: string;
  bankState: string;
  bankZipCode: string;
}

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    // Personal Information (KYC)
    firstName: '',
    lastName: '',
    documentType: '',
    taxId: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    country: '',
    // Address Information
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    // Account Information
    password: '',
    confirmPassword: '',
    // Optional US Bank Account
    hasUSBankAccount: false,
    routingNumber: '',
    accountNumber: '',
    accountHolderName: '',
    bankName: '',
    bankStreetAddress: '',
    bankCity: '',
    bankState: '',
    bankZipCode: ''
  });

  const fullText = "Without The Markups";

  // Helper function to handle input changes
  const handleInputChange = (field: keyof SignUpFormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Auto-set document type based on country
      if (field === 'country') {
        updated.documentType = value === 'Mexico' ? 'curp' : 'cpf';
      }
      
      return updated;
    });
  };

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
  const convertDateFormat = (ddmmyyyy: string): string => {
    if (!ddmmyyyy || ddmmyyyy.length !== 10) return ddmmyyyy;
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Create customer function (from GetStarted.tsx)
  const createCustomer = async () => {
    try {
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
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field as keyof SignUpFormData]) {
          throw new Error(`${label} is required`);
        }
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_CUSTOMER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phone,
          date_of_birth: convertDateFormat(formData.dateOfBirth),
          type: "individual",
          identity_documents: [{
            type: "national_id",
            value: formData.taxId,
            country: formData.country
          }],
          address: {
            street_line_1: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            country: formData.country
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer profile');
      }

      const customerData = await response.json();
      const customerId = customerData.customer_id;
      
      if (customerId) {
        localStorage.setItem('customerId', customerId);
        console.log('Customer created successfully:', customerId);
        return customerId;
      } else {
        throw new Error('No customer ID returned from server');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create customer profile',
      });
      throw error;
    }
  };

  // Create external account function (from GetStarted.tsx)
  const createExternalAccount = async (customerId: string) => {
    try {
      if (!formData.hasUSBankAccount) {
        return null; // Skip if no US bank account provided
      }

      // Validate bank account fields
      if (!formData.routingNumber || !formData.accountNumber || !formData.accountHolderName || 
          !formData.bankName || !formData.bankStreetAddress || !formData.bankCity || 
          !formData.bankState || !formData.bankZipCode) {
        throw new Error('Please fill in all required bank account fields');
      }
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_EXTERNAL_ACCOUNT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          customer_id: customerId,
          routing_number: formData.routingNumber,
          account_number: formData.accountNumber,
          account_holder_name: formData.accountHolderName,
          bank_name: formData.bankName,
          bank_street_address: formData.bankStreetAddress,
          bank_city: formData.bankCity,
          bank_state: formData.bankState,
          bank_zip_code: formData.bankZipCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create external account');
      }

      const accountData = await response.json();
      console.log('External account created successfully:', accountData.external_account_id);
      return accountData.external_account_id;
    } catch (error) {
      console.error('Error creating external account:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create external account',
      });
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Create UnblockPay customer using existing function
      const customerId = await createCustomer();
      
      if (!customerId) {
        throw new Error('Failed to create customer profile');
      }

      // 3. Save user profile to Supabase with UnblockPay customer ID
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          date_of_birth: convertDateFormat(formData.dateOfBirth),
          national_id: formData.taxId,
          country: formData.country,
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          unblockpay_customer_id: customerId
        });

      if (profileError) throw profileError;

      // 4. Create external account if provided
      if (formData.hasUSBankAccount && customerId) {
        await createExternalAccount(customerId);
      }

      toast({
        title: 'Success',
        description: 'Account created successfully! Welcome to Crebit.',
      });

      // Redirect to login after successful signup
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Wait for slide-in animation to complete (1.2s) before starting typing
    const animationDelay = setTimeout(() => {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypedText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // Keep cursor blinking for a bit after typing is done
          setTimeout(() => setShowCursor(false), 2000);
        }
      }, 100);

      return () => clearInterval(typingInterval);
    }, 1200);

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(animationDelay);
      clearInterval(cursorInterval);
    };
  }, []);


  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit the form
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Create Your Account";
      case 2: return "Personal Information";
      case 3: return "Address Information";
      case 4: return "Bank Account (Optional)";
      default: return "Sign Up";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Create your account with email and password.";
      case 2: return "Fill in your personal information for verification.";
      case 3: return "Provide your address information.";
      case 4: return "Optionally add a US bank account for faster transfers.";
      default: return "Complete your registration.";
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword;
      case 2:
        return formData.firstName && formData.lastName && formData.documentType && 
               formData.taxId && formData.dateOfBirth && formData.phone && formData.country;
      case 3:
        return formData.streetAddress && formData.city && formData.state && formData.zipCode;
      case 4:
        if (!formData.hasUSBankAccount) return true;
        return formData.routingNumber && formData.accountNumber && formData.accountHolderName &&
               formData.bankName && formData.bankStreetAddress && formData.bankCity &&
               formData.bankState && formData.bankZipCode;
      default:
        return false;
    }
  };

  return (
    <div className="h-[95vh] bg-gray-50 flex">
      {/* Left Side - Crebit Branding */}
      <div className="flex-1 bg-[#17484A] flex flex-col justify-between text-white relative overflow-visible m-6 rounded-2xl p-12 animate-slide-in-left">
        {/* Logo */}
        <div className="flex items-center gap-2 z-10 relative">
          <img src="/crebit_logo.png" alt="Crebit" className="h-8" style={{filter: 'brightness(0) invert(1)'}} />
        </div>

        {/* Main Content */}
        <div className="z-10 relative">
          <h1 className="text-5xl font-bold mb-6 leading-tight" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            Welcome back to the future of payments
          </h1>
          <p className="text-xl mb-8 opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            Continue To Your U.S Payment—<span className="font-semibold">
              {typedText}
              {showCursor && <span className="animate-pulse">|</span>}
            </span>
          </p>
        </div>

        {/* Bottom Quote */}
        <div className="z-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <p className="text-lg italic opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            "Crossing Borders, Not Budgets."
          </p>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-stretch justify-center p-6 animate-slide-in-right">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-12 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                {getStepTitle()}
              </h2>
              <p className="text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
                {getStepDescription()}
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {/* Dynamic form container - grows to fit content or scrolls if needed */}
              <div className="flex-1 overflow-y-visible overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                <form className="space-y-6">
                  {/* Step 1: Create Account (Email & Password) */}
                  {currentStep === 1 && (
                    <>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your-email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2">Create Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2">Confirm Password *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-red-500 text-sm">Passwords do not match</p>
                      )}
                    </>
                  )}

                  {/* Step 2: Personal Information (KYC) */}
                  {currentStep === 2 && (
                    <>
                      {/* Country */}
                      <div>
                        <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2">Country *</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                          <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Brazil">Brazil</SelectItem>
                            <SelectItem value="Mexico">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* First Name & Last Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2">First Name *</Label>
                          <Input
                            id="firstName"
                            placeholder="Your first name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2">Last Name *</Label>
                          <Input
                            id="lastName"
                            placeholder="Your last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Tax ID */}
                      <div>
                        <Label htmlFor="taxId" className="text-sm font-medium text-gray-700 mb-2">
                          {formData.country === 'Mexico' ? 'CURP *' : 'CPF *'}
                        </Label>
                        <Input
                          id="taxId"
                          placeholder={formData.country === 'Mexico' ? 'Enter your CURP' : 'Enter your CPF'}
                          value={formData.taxId}
                          onChange={(e) => handleInputChange("taxId", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      {/* Date of Birth & Phone */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 mb-2">Date of Birth *</Label>
                          <Input
                            id="dateOfBirth"
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={formData.dateOfBirth}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                              if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5, 9);
                              handleInputChange("dateOfBirth", value);
                            }}
                            maxLength={10}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+55 (11) 99999-9999"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                    </>
                  )}

                  {/* Step 3: Address Information */}
                  {currentStep === 3 && (
                    <>
                      <div>
                        <Label htmlFor="streetAddress" className="text-sm font-medium text-gray-700 mb-2">Street Address *</Label>
                        <Input
                          id="streetAddress"
                          placeholder="Street address, apartment, suite, etc."
                          value={formData.streetAddress}
                          onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2">City *</Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2">State/Province *</Label>
                          <Input
                            id="state"
                            placeholder="State or province"
                            value={formData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code *</Label>
                        <Input
                          id="zipCode"
                          placeholder="ZIP or postal code"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </>
                  )}


                  {/* Step 4: Optional US Bank Account */}
                  {currentStep === 4 && (
                    <>
                      <div className="mb-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasUSBankAccount"
                            checked={formData.hasUSBankAccount}
                            onCheckedChange={(checked) => handleInputChange("hasUSBankAccount", checked as boolean)}
                          />
                          <Label htmlFor="hasUSBankAccount" className="text-sm font-medium text-gray-700">
                            Optionally add a US bank account for faster transfers (optional)
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Money will be directly wired to this account for faster transfers and lower fees. If not provided, transfers will use alternative methods.
                        </p>
                      </div>

                      {formData.hasUSBankAccount && (
                        <div className="relative">
                          <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                            <span>📋 Bank Information</span>
                            <span className="text-blue-600">↕️ Scroll to see all fields</span>
                          </div>
                          <div className="max-h-96 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="routingNumber" className="text-sm font-medium text-gray-700 mb-2">Routing Number *</Label>
                              <Input
                                id="routingNumber"
                                placeholder="9-digit routing number"
                                value={formData.routingNumber}
                                onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700 mb-2">Account Number *</Label>
                              <Input
                                id="accountNumber"
                                placeholder="Account number"
                                value={formData.accountNumber}
                                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="accountHolderName" className="text-sm font-medium text-gray-700 mb-2">Account Holder Name *</Label>
                            <Input
                              id="accountHolderName"
                              placeholder="Full name on account"
                              value={formData.accountHolderName}
                              onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>

                          <div>
                            <Label htmlFor="bankName" className="text-sm font-medium text-gray-700 mb-2">Bank Name *</Label>
                            <Input
                              id="bankName"
                              placeholder="Name of your bank"
                              value={formData.bankName}
                              onChange={(e) => handleInputChange("bankName", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>

                          <div>
                            <Label htmlFor="bankStreetAddress" className="text-sm font-medium text-gray-700 mb-2">Bank Address * (address of headquarters or branch you use)</Label>
                            <Input
                              id="bankStreetAddress"
                              placeholder="Bank street address"
                              value={formData.bankStreetAddress}
                              onChange={(e) => handleInputChange("bankStreetAddress", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="bankCity" className="text-sm font-medium text-gray-700 mb-2">Bank City *</Label>
                              <Input
                                id="bankCity"
                                placeholder="City"
                                value={formData.bankCity}
                                onChange={(e) => handleInputChange("bankCity", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                              />
                            </div>
                            <div>
                              <Label htmlFor="bankState" className="text-sm font-medium text-gray-700 mb-2">Bank State *</Label>
                              <Input
                                id="bankState"
                                placeholder="State"
                                value={formData.bankState}
                                onChange={(e) => handleInputChange("bankState", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                              />
                            </div>
                            <div>
                              <Label htmlFor="bankZipCode" className="text-sm font-medium text-gray-700 mb-2">Bank ZIP *</Label>
                              <Input
                                id="bankZipCode"
                                placeholder="ZIP code"
                                value={formData.bankZipCode}
                                onChange={(e) => handleInputChange("bankZipCode", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                              />
                            </div>
                          </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Section - Progress Dots and Buttons */}
          <div>
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step <= currentStep ? "bg-[#17484A]" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                className={`${currentStep === 1 ? 'w-full' : 'flex-1'} px-6 py-3 bg-[#17484A] text-white rounded-lg hover:bg-[#17484A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
              >
                {isLoading ? 'Creating Account...' : currentStep === 4 ? 'Create Account' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
