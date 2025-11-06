import { getApiUrl, API_CONFIG } from '@/config/api';

export interface TransactionStatus {
  id: string;
  status: 'awaiting_deposit' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'error';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

class TransactionService {
  async getTransactionStatus(transactionId: string): Promise<TransactionStatus | null> {
    try {
      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.TRANSACTION_STATUS)}/${encodeURIComponent(transactionId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.transaction;
      } else {
        console.error('Failed to get transaction status:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return null;
    }
  }

  async pollTransactionStatus(
    transactionId: string, 
    onStatusChange: (status: TransactionStatus) => void,
    intervalMs: number = 5000
  ): Promise<() => void> {
    const poll = async () => {
      const status = await this.getTransactionStatus(transactionId);
      if (status) {
        onStatusChange(status);
        
        // Stop polling if transaction is in a final state
        if (['completed', 'failed', 'cancelled', 'refunded', 'error'].includes(status.status)) {
          clearInterval(intervalId);
        }
      }
    };

    // Initial poll
    await poll();
    
    // Set up interval polling
    const intervalId = setInterval(poll, intervalMs);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export const transactionService = new TransactionService();
