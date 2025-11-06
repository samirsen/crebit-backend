#!/usr/bin/env python3
"""
UnblockPay Off-Ramp Payout Script
Generates an off-ramp quote and executes a payout from crypto wallet to external account
"""
import os
from supabase import create_client, Client

import requests
import json
import sys
from typing import Dict, Optional

# Configuration
AUTH_TOKEN = "7b17dd6f-867e-48eb-ada1-682e361d6717"
BASE_URL = "https://api.unblockpay.com"  # Production URL (change to sandbox if needed)

# Your specific values
WALLET_ID = "0199d386-a3e2-77ce-8402-877744f4eb1b"
EXTERNAL_ACCOUNT_ID = "0199e8da-edd4-76b5-95fe-04f2690e25bc"
AMOUNT_USDC = 922.35

def create_offramp_quote() -> Optional[Dict]:
    """Create an off-ramp quote for USDC to USD"""
    try:
        print("🔄 Creating off-ramp quote...")
        
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        quote_data = {
            "symbol": "USDC/USD",
            "type": "off_ramp"
        }
        
        print(f"📋 Quote request: {json.dumps(quote_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/quote",
            headers=headers,
            json=quote_data,
            timeout=30
        )
        
        print(f"📊 Quote API response status: {response.status_code}")
        print(f"📊 Quote API response: {response.text}")
        
        response.raise_for_status()
        quote_result = response.json()
        
        print(f"✅ Successfully created quote:")
        print(f"   Quote ID: {quote_result.get('id')}")
        print(f"   Rate: {quote_result.get('quotation')}")
        print(f"   Expires at: {quote_result.get('expires_at')}")
        
        return quote_result
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error creating quote: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"   Response: {e.response.text}")
        return None
    except Exception as e:
        print(f"❌ Error creating quote: {e}")
        return None

def create_payout(quote_id: str, amount: float) -> Optional[Dict]:
    """Create a payout using the quote"""
    try:
        print(f"💰 Creating payout for ${amount} USDC...")
        
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        payout_data = {
            "amount": amount,
            "quote_id": quote_id,
            "sender": {
                "currency": "USDC",
                "payment_rail": "solana",
                "wallet_id": WALLET_ID
            },
            "receiver": {
                "external_account_id": EXTERNAL_ACCOUNT_ID
            }
        }
        
        print(f"📋 Payout request: {json.dumps(payout_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/payout",
            headers=headers,
            json=payout_data,
            timeout=30
        )
        
        print(f"💸 Payout API response status: {response.status_code}")
        print(f"💸 Payout API response: {response.text}")
        
        response.raise_for_status()
        payout_result = response.json()
        
        print(f"🎉 Successfully created payout:")
        print(f"   Payout ID: {payout_result.get('id')}")
        print(f"   Status: {payout_result.get('status')}")
        print(f"   Amount: ${payout_result.get('amount')} {payout_result.get('currency', 'USD')}")
        
        return payout_result
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error creating payout: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"   Response: {e.response.text}")
        return None
    except Exception as e:
        print(f"❌ Error creating payout: {e}")
        return None

def generate_curl_command(quote_id: str, amount: float) -> str:
    """Generate the curl command with the quote ID"""
    curl_command = f"""curl -X POST "{BASE_URL}/payout" \\
  -H "Authorization: {AUTH_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{{
    "amount": {amount},
    "quote_id": "{quote_id}",
    "sender": {{
      "currency": "USDC",
      "payment_rail": "solana",
      "wallet_id": "{WALLET_ID}"
    }},
    "receiver": {{
      "external_account_id": "{EXTERNAL_ACCOUNT_ID}"
    }}
  }}'"""
    return curl_command


def sign_up(email: str, password: str, phone: str):
    url = "https://llpecsynltyxlettolvi.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscGVjc3lubHR5eGxldHRvbHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTYyNjUsImV4cCI6MjA3NTM3MjI2NX0.7b8Rhlq0AViwXeGYd2ChOKSXH4OEVy4635oH0_71UnA"
    supabase = create_client(url, key)
    response = supabase.auth.sign_up(
    {
        "email": "therobotwhisperer32@gmail.com",
        "password": "1234566",
    }
    
)


def main():
    
    #Main execution function
    print("🚀 UnblockPay Off-Ramp Payout Script")
    print("=" * 50)
    print(f"Amount: ${AMOUNT_USDC} USDC")
    print(f"Wallet ID: {WALLET_ID}")
    print(f"External Account ID: {EXTERNAL_ACCOUNT_ID}")
    print("=" * 50)
    
    # Step 1: Create off-ramp quote
    quote = create_offramp_quote()
    if not quote:
        print("❌ Failed to create quote. Exiting.")
        sys.exit(1)
    
    quote_id = quote.get('id')
    if not quote_id:
        print("❌ No quote ID returned. Exiting.")
        sys.exit(1)
    
    print(f"\n📋 Generated Quote ID: {quote_id}")
    
    # Step 2: Generate curl command
    print(f"\n🔧 Generated curl command:")
    print("-" * 50)
    curl_cmd = generate_curl_command(quote_id, AMOUNT_USDC)
    print(curl_cmd)
    print("-" * 50)
    
    # Step 3: Ask user if they want to execute the payout
    print(f"\n⚠️  Ready to execute payout of ${AMOUNT_USDC} USDC")
    user_input = input("Do you want to proceed with the payout? (y/N): ").strip().lower()
    
    if user_input in ['y', 'yes']:
        print("\n🚀 Executing payout...")
        payout = create_payout(quote_id, AMOUNT_USDC)
        if payout:
            print(f"\n🎉 Payout completed successfully!")
            print(f"   Transaction ID: {payout.get('id')}")
        else:
            print(f"\n❌ Payout failed!")
            sys.exit(1)
    else:
        print(f"\n✋ Payout cancelled by user.")
        print(f"💡 You can use the curl command above to execute it manually.")
"""
    url = "https://llpecsynltyxlettolvi.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscGVjc3lubHR5eGxldHRvbHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTYyNjUsImV4cCI6MjA3NTM3MjI2NX0.7b8Rhlq0AViwXeGYd2ChOKSXH4OEVy4635oH0_71UnA"
    supabase = create_client(url, key)
    response = supabase.auth.sign_up(
    {
        "email": "therobotwhisperer32@gmail.com",
        "password": "1234566",
    }
    
    )
    print(response)"""
if __name__ == "__main__":
    
    
    main()
