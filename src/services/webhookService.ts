import { getApiUrl, API_CONFIG } from '@/config/api';

export interface WebhookEvent {
  event: string;
  event_id: string;
  event_type: string;
  event_resource_id: string;
  event_resource_status: string;
  event_resource: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
    updated_at: string;
  };
  event_created_at: string;
}

class WebhookService {
  async triggerMockWebhook(eventType: string, transactionId?: string): Promise<WebhookEvent | null> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TRIGGER_MOCK_WEBHOOK), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          event_type: eventType,
          transaction_id: transactionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.event;
      } else {
        console.error('Failed to trigger mock webhook:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error triggering mock webhook:', error);
      return null;
    }
  }

  async setupWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SETUP_WEBHOOK), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          webhook_url: webhookUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log('Webhook setup successful:', data.webhook);
        return true;
      } else {
        console.error('Failed to setup webhook:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error setting up webhook:', error);
      return false;
    }
  }

  // Setup webhook event listeners (for real-time updates via WebSocket or Server-Sent Events)
  setupWebhookListener(onEvent: (event: WebhookEvent) => void): () => void {
    // In a real implementation, this would connect to WebSocket or SSE
    // For now, we'll use a simple polling mechanism as fallback
    console.log('Webhook listener setup (mock implementation)');
    
    // Return cleanup function
    return () => {
      console.log('Webhook listener cleanup');
    };
  }
}

export const webhookService = new WebhookService();
