import { FormData, QuoteResult, QuoteIds } from '@/types/payment';
import { getApiUrl, API_CONFIG } from '@/config/api';

interface CreateCustomerParams {
  customerData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    type: string;
    date_of_birth: string;
    identity_documents: Array<{
      type: string;
      value: string;
      country: string;
    }>;
    address: {
      street_line_1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

interface CreateExternalAccountParams {
  customer_id: string;
  account_name: string;
  beneficiary_name: string;
  bank_name: string;
  bank_account_number: string;
  routing_number: string;
  address: {
    street_line_1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export const paymentService = {
  // Create a new customer
  createCustomer: async (customerData: CreateCustomerParams['customerData']) => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_CUSTOMER), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create customer');
    }
    
    return response.json();
  },

  // Create a wallet for a customer
  createWallet: async (customerId: string) => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_WALLET), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create wallet');
    }
    
    return response.json();
  },
  
  // Create an external bank account
  createExternalAccount: async (customerId: string, accountData: Omit<CreateExternalAccountParams, 'customer_id'>) => {
    const payload = {
      customer_id: customerId,
      ...accountData
    };
    
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_EXTERNAL_ACCOUNT), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create external account');
    }
    
    return response.json();
  },

  getLastCustomerId: async () => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LAST_CUSTOMER_ID), {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('No customer ID found in session');
    }
    
    return response.json();
  },

  getLastQuoteIds: async (): Promise<QuoteIds> => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LAST_QUOTE_IDS), {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('No quote IDs found in session');
    }
    
    return response.json();
  },

  createQuote: async (amount: number, currency: string) => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        symbol: `${currency}_USD`,
        amount_usd: amount
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Quote creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create quote');
    }
    
    return response.json();
  },

  createPixPayment: async (amountBrl: number, customerId: string, walletAddress: string, quoteId: string, senderName: string, senderDocument: string): Promise<{
    success: boolean;
    transaction: any;
    transaction_id: string;
    status: string;
    amount_brl: number;
    wallet_address: string;
  }> => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_PIX_PAYMENT), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        amount_brl: amountBrl,
        customer_id: customerId,
        wallet_address: walletAddress,
        quote_id: quoteId,
        sender_name: senderName,
        sender_document: senderDocument
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('PIX payment creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create PIX payment');
    }
    
    return response.json();
  },
};

export const formatCountdown = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const calculateTotals = (quote: QuoteResult | null) => {
  if (!quote) {
    return {
      fxMarkup: 0,
      totalLocalAmount: 0,
      amountUSD: 0,
      exchangeRate: 0,
      onRampRate: 0,
      offRampRate: 0,
      effectiveRate: 0,
    };
  }
  
  return {
    fxMarkup: quote.total_fees_usd,
    totalLocalAmount: quote.total_local_amount,
    amountUSD: quote.amount_usd,
    exchangeRate: quote.effective_rate,
    onRampRate: parseFloat(quote.on_ramp.quotation.toString()),
    offRampRate: parseFloat(quote.off_ramp.quotation.toString()),
    effectiveRate: quote.effective_rate,
  };
};
