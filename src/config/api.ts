// API Configuration for different environments using Vite env vars
export const API_CONFIG = {
  // Backend API base URL - uses Vite env vars for proper Render proxying
  // In local dev: VITE_API_BASE_URL=http://localhost:5001
  // In production: VITE_API_BASE_URL is empty, so it uses relative /api/ URLs
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    
  // Webhook URL for UnblockPay
  WEBHOOK_URL: import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/webhook/payout-events`
    : '/api/webhook/payout-events', // Relative URL for production proxying
    
  // API endpoints with /api prefix for production proxying
  ENDPOINTS: {
    CREATE_CUSTOMER: '/api/create-customer',
    CREATE_EXTERNAL_ACCOUNT: '/api/create-external-account',
    CREATE_QUOTE: '/api/create-quote',
    CREATE_PIX_PAYMENT: '/api/create-pix-payment',
    SETUP_WEBHOOK: '/api/setup-webhook',
    LAST_CUSTOMER_ID: '/api/last-customer-id',
    LAST_QUOTE_IDS: '/api/last-quote-ids',
    CREATE_WALLET: '/api/create-wallet',
    TRANSACTION_STATUS: '/api/transaction-status',
    TRIGGER_MOCK_WEBHOOK: '/api/trigger-mock-webhook',
    WEBHOOK_STATUS: '/api/webhook-status',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
 
