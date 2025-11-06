# Webhook & Transaction History Setup

## Overview
Your Flask server now saves all UnblockPay webhook events to Supabase, automatically linking them to users so they can see their transaction history in the dashboard.

## What Was Implemented

### 1. **Database Tables** (`supabase-webhook-events.sql`)

#### `webhook_events` Table
Stores every webhook received from UnblockPay:
- Event type, resource, status
- Transaction ID, customer ID, user ID
- Amounts (USD and local currency)
- Full raw payload for debugging

#### `transactions` Table  
User-facing transaction records:
- Linked to user via `user_id`
- Transaction type (payin, payout, transfer)
- Status (pending, processing, completed, failed)
- Amounts, recipient, reference
- Metadata from webhook

### 2. **Flask Server Updates** (`src/server/app.py`)

#### Added Supabase Integration
```python
from supabase import create_client, Client

# Initialize with service key for server-side operations
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
```

#### `save_webhook_to_database()` Function
Automatically called for every webhook:
1. Saves complete webhook event to `webhook_events` table
2. Looks up user by `unblockpay_customer_id`
3. Creates/updates transaction record in `transactions` table
4. Links transaction to user for dashboard display

### 3. **How It Works**

**When a webhook arrives:**
1. Flask receives webhook from UnblockPay
2. Logs all details (already had this)
3. **NEW:** Calls `save_webhook_to_database()`
4. Finds user by matching `customer_id` → `unblockpay_customer_id`
5. Saves webhook event with user link
6. Creates/updates transaction record for user

**User sees in dashboard:**
- All their transactions from `transactions` table
- Status updates in real-time as webhooks arrive
- Transaction amounts, dates, recipients

## Setup Instructions

### 1. **Run SQL Schema in Supabase**
```sql
-- Copy contents of supabase-webhook-events.sql
-- Paste in Supabase SQL Editor
-- Click "Run"
```

This creates:
- `webhook_events` table
- `transactions` table  
- Row Level Security policies
- Indexes for performance

### 2. **Get Supabase Service Key**
1. Go to https://app.supabase.com/project/udzmxstrkhesiantlods/settings/api
2. Copy the **service_role** key (NOT the anon key)
3. Add to your `.env` file:

```bash
SUPABASE_URL=https://udzmxstrkhesiantlods.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

⚠️ **IMPORTANT:** The service key has admin access - keep it secret!

### 3. **Install Supabase Python Client**
```bash
pip install supabase
```

### 4. **Restart Flask Server**
```bash
python3 src/server/app.py
```

## Retrieving Past Webhooks

### Option 1: Check Server Logs
Your Flask server logs all webhooks with 🔥 emojis. Search your terminal output for:
```
🚨 WEBHOOK RECEIVED! 🚨
```

### Option 2: Query Supabase Directly
Once the tables are created, you can query past data:

```sql
-- Get all webhook events
SELECT * FROM webhook_events ORDER BY created_at DESC;

-- Get webhooks for a specific customer
SELECT * FROM webhook_events 
WHERE customer_id = 'your_customer_id' 
ORDER BY created_at DESC;

-- Get all user transactions
SELECT * FROM transactions 
WHERE user_id = 'user_uuid'
ORDER BY created_at DESC;
```

### Option 3: Dashboard API Endpoint
Create an endpoint to fetch user transactions:

```python
@app.route("/api/transactions/<user_id>", methods=["GET"])
def get_user_transactions(user_id):
    if not supabase:
        return jsonify({"error": "Database not configured"}), 500
    
    result = supabase.table("transactions")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()
    
    return jsonify(result.data), 200
```

## Transaction Flow

### New User Makes Payment:
1. Signs up → Creates Supabase account + UnblockPay customer
2. `user_profiles` table stores `unblockpay_customer_id`
3. Makes payment via GetStarted flow
4. UnblockPay sends webhook to `/webhook/unblockpay`
5. Flask saves to database, linking via customer ID
6. User sees transaction in dashboard

### Existing User Makes Payment:
1. Logs in → Skips to Step 2 of GetStarted
2. Uses existing `unblockpay_customer_id`
3. Makes payment
4. Webhook arrives → Automatically linked to user
5. Transaction appears in dashboard

## Testing

### Test Webhook Endpoint:
```bash
curl http://127.0.0.1:5001/webhook/unblockpay
```

### Simulate Webhook (for testing):
```bash
curl -X POST http://127.0.0.1:5001/webhook/unblockpay \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payin.completed",
    "event_resource_status": "completed",
    "event_resource": {
      "id": "test_transaction_123",
      "customer_id": "your_customer_id",
      "sender": {
        "amount": "1000.00",
        "currency": "BRL"
      },
      "receiver": {
        "amount": "184.50",
        "currency": "USDC"
      }
    }
  }'
```

## Dashboard Integration

Update your Dashboard component to fetch and display transactions:

```typescript
// In Dashboard.tsx
const [transactions, setTransactions] = useState([]);

useEffect(() => {
  if (userProfile?.id) {
    fetch(`/api/transactions/${userProfile.id}`)
      .then(res => res.json())
      .then(data => setTransactions(data));
  }
}, [userProfile]);
```

## Benefits

✅ **Complete History:** Every webhook saved permanently  
✅ **User Linking:** Automatic association via customer ID  
✅ **Real-time Updates:** Status changes reflected immediately  
✅ **Debugging:** Full webhook payload stored for troubleshooting  
✅ **Audit Trail:** Timestamp and metadata for all events  
✅ **Dashboard Ready:** Transactions table ready for UI display

## Notes

- Past webhooks are NOT retrievable from UnblockPay
- Only webhooks received AFTER this setup will be saved
- Check your server logs for any webhooks received before setup
- Service key required for server-side database operations
- Row Level Security ensures users only see their own transactions
