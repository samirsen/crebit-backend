export interface FormData {
  // Personal Information
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
  // Delivery Method
  deliveryMethod: string;
  routingNumber: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  bankStreetAddress: string;
  bankCity: string;
  bankState: string;
  bankZipCode: string;
  schoolName: string;
  payeeName: string;
  deliveryInstructions: string;
  studentFullName: string;
  studentId: string;
  customerId?: string;
  amountUSD?: string;
  termReference: string;
  studentEmail: string;
  paymentMethod: string;
}

export interface SingleQuote {
  id: string;
  quotation: string | number;
  flat_fee: number;
  expires_at: number;
  symbol: string;
  type: string;
}

export interface QuoteResult {
  on_ramp: SingleQuote & { quote_id: string };
  off_ramp: SingleQuote & { quote_id: string };
  amount_usd: number;
  total_fees_usd: number;
  total_local_amount: number;
  effective_rate: number;
  expires_at: number;
  expires_at_readable: string;
  // For backward compatibility and easier access
  onRampQuoteId?: string;
  offRampQuoteId?: string;
  totalBrlAmount?: number;
}

export interface QuoteIds {
  onRampQuoteId: string;
  offRampQuoteId: string;
  totalBrlAmount: number;
}
