import { FormData } from '@/types/payment';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validatePersonalInfo = (formData: FormData): ValidationResult => {
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

  const missingFields = Object.entries(requiredFields)
    .filter(([field]) => !formData[field as keyof FormData])
    .map(([, label]) => label);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Please fill in all required fields: ${missingFields.join(', ')}`
    };
  }

  // Validate email format
  if (!formData.email.includes('@')) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(formData.dateOfBirth)) {
    return {
      isValid: false,
      error: 'Date of Birth must be in YYYY-MM-DD format'
    };
  }

  // Sanitize and validate phone number
  const sanitizedPhone = formData.phone.replace(/[^0-9]/g, '');
  if (!sanitizedPhone) {
    return {
      isValid: false,
      error: 'Phone number must contain at least one digit'
    };
  }

  return { isValid: true };
};

export const validateBankAccount = (formData: FormData): ValidationResult => {
  const requiredFields = {
    routingNumber: 'Routing Number',
    accountNumber: 'Account Number',
    accountHolderName: 'Account Holder Name',
    bankName: 'Bank Name',
    bankStreetAddress: 'Bank Street Address',
    bankCity: 'Bank City',
    bankState: 'Bank State/Province',
    bankZipCode: 'Bank ZIP/Postal Code'
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([field]) => !formData[field as keyof FormData])
    .map(([, label]) => label);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Please fill in all required bank account fields: ${missingFields.join(', ')}`
    };
  }

  return { isValid: true };
};

export const prepareCustomerData = (formData: FormData) => ({
  first_name: formData.firstName,
  last_name: formData.lastName,
  email: formData.email,
  phone_number: formData.phone.replace(/[^0-9]/g, ''),
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
});

export const prepareExternalAccountData = (formData: FormData, customerId: string) => ({
  customer_id: customerId,
  account_name: `${formData.accountHolderName}'s USD Account`,
  beneficiary_name: formData.accountHolderName,
  bank_name: formData.bankName,
  bank_account_number: formData.accountNumber,
  routing_number: formData.routingNumber,
  address: {
    street_line_1: formData.bankStreetAddress,
    city: formData.bankCity,
    state: formData.bankState,
    postal_code: formData.bankZipCode,
    country: 'USA'
  }
});
