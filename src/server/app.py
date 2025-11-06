from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
import uuid
from typing import Dict, Union, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Get environment variables
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:8080,http://127.0.0.1:8080,http://localhost:8081,http://localhost:8082,http://127.0.0.1:8081,http://127.0.0.1:8082').split(',')
FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'fallback-secret-key-change-in-production')
AUTH_TOKEN = os.getenv('UNBLOCKPAY_AUTH_TOKEN', 'f6e34b0e-a2e4-49c0-abc6-4bfdc66a8ba4')
BASE_URL = os.getenv('UNBLOCKPAY_BASE_URL', 'https://api.sandbox.unblockpay.com') 
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
PORT = int(os.getenv('PORT', 5001))
HOST = os.getenv('HOST', '0.0.0.0')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://udzmxstrkhesiantlods.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Need service key for server-side operations

# Initialize Supabase client (only if service key is available)
supabase: Client = None
if SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
else:
    print("WARNING: SUPABASE_SERVICE_KEY not set - webhook events will not be saved to database")

# Pre-configured external account ID for check delivery
CHECK_DELIVERY_EXTERNAL_ACCOUNT_ID = "11111111111"

# Validate required environment variables
if not AUTH_TOKEN:
    raise ValueError("UNBLOCKPAY_AUTH_TOKEN environment variable is required")

# Configure CORS with environment-based origins
CORS(app, 
     origins=ALLOWED_ORIGINS,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type"],
     supports_credentials=True,
     allow_credentials=True)

# Session configuration removed - using localStorage on frontend instead

# Root route for health checks
@app.route("/", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy", "service": "tuition-bridge-backend"}, 200

# Health check endpoint
@app.route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}, 200

def create_external_account(
    customer_id: str,
    account_name: str,
    beneficiary_name: str,
    bank_name: str,
    bank_account_number: str,
    routing_number: str,
    address: Dict[str, str],
    authorization_token: str = AUTH_TOKEN,
    base_url: str = BASE_URL
) -> Dict[str, Union[str, int, Dict]]:
    """
    Create an external US wire account for a customer.
    """
    # Validate required fields
    if not customer_id:
        raise ValueError("customer_id is required")
    if not account_name:
        raise ValueError("account_name is required")
    if not beneficiary_name:
        raise ValueError("beneficiary_name is required")
    if not bank_name:
        raise ValueError("bank_name is required")
    if not bank_account_number:
        raise ValueError("bank_account_number is required")
    if not routing_number:
        raise ValueError("routing_number is required")
    if not address:
        raise ValueError("address is required")
    
    required_address_fields = ["street_line_1", "city", "state", "postal_code", "country"]
    missing_fields = [field for field in required_address_fields if not address.get(field)]
    if missing_fields:
        raise ValueError(f"Missing required address fields: {', '.join(missing_fields)}")
    
    # Truncate account_name to first 34 characters if longer
    truncated_account_name = account_name[:34] if len(account_name) > 34 else account_name
    
    # Prepare the request payload
    payload = {
        "account_name": truncated_account_name,
        "payment_rail": "wire",
        "beneficiary_name": beneficiary_name,
        "bank_name": bank_name,
        "bank_account_number": bank_account_number,
        "routing_number": routing_number,
        "address": address
    }
    
    # Prepare headers
    headers = {
        "Authorization": authorization_token,
        "Content-Type": "application/json"
    }
    
    # Make the API request
    try:
        response = requests.post(
            f"{base_url}/customers/{customer_id}/external-accounts",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        # Log the response for debugging
        print(f"External account creation response status: {response.status_code}")
        print(f"External account creation response body: {response.text}")
        
        # Raise an exception for bad status codes
        response.raise_for_status()
        
        response_data = response.json()
        
        # External account ID will be returned to frontend for localStorage storage
        external_account_id = response_data.get("id")
        if external_account_id:
            print(f"External account ID created: {external_account_id}")
        
        return response_data
        
    except requests.RequestException as e:
        print(f"Error creating external account: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response headers: {e.response.headers}")
            print(f"Response body: {e.response.text}")
        raise

def create_wallet(
    customer_id: str,
    name: str,
    blockchain: str,
    authorization_token: str = AUTH_TOKEN,
    base_url: str = BASE_URL
) -> Dict[str, Union[str, int, Dict]]:
    """
    Create a wallet for a customer in UnblockPay API.
    """
    # Validate required fields
    if not customer_id:
        raise ValueError("customer_id is required")
    if not name:
        raise ValueError("name is required")
    if not blockchain:
        raise ValueError("blockchain is required")
    
    # Prepare the request payload
    payload = {
        "name": name,
        "blockchain": blockchain
    }
    
    # Prepare headers
    headers = {
        "Authorization": authorization_token,
        "Content-Type": "application/json"
    }
    
    # Make the API request
    try:
        response = requests.post(
            f"{base_url}/customers/{customer_id}/wallets",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        # Log the response for debugging
        print(f"Wallet creation response status: {response.status_code}")
        print(f"Wallet creation response body: {response.text}")
        
        # Raise an exception for bad status codes
        response.raise_for_status()
        
        return response.json()
        
    except requests.RequestException as e:
        print(f"Error creating wallet: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response headers: {e.response.headers}")
            print(f"Response body: {e.response.text}")
        raise

def create_wallet_transfer(
    amount: float,
    customer_id: str,
    sender_wallet_id: str,
    receiver_address: str,
    receiver_currency: str = "USDC",
    receiver_payment_rail: str = "solana",
    sender_currency: str = "USDC",
    sender_payment_rail: str = "solana",
    authorization_token: str = AUTH_TOKEN,
    base_url: str = BASE_URL
) -> Dict[str, Union[str, int, Dict]]:
    """
    Create a wallet transfer in UnblockPay API.
    Transfers funds from a customer's wallet to another wallet address.
    """
    # Validate required fields
    if not amount or amount <= 0:
        raise ValueError("amount must be greater than 0")
    if not customer_id:
        raise ValueError("customer_id is required")
    if not sender_wallet_id:
        raise ValueError("sender_wallet_id is required")
    if not receiver_address:
        raise ValueError("receiver_address is required")
    
    # Prepare the request payload
    payload = {
        "amount": amount,
        "customer_id": customer_id,
        "sender": {
            "currency": sender_currency,
            "payment_rail": sender_payment_rail,
            "wallet_id": sender_wallet_id
        },
        "receiver": {
            "currency": receiver_currency,
            "payment_rail": receiver_payment_rail,
            "address": receiver_address
        }
    }
    
    # Prepare headers
    headers = {
        "Authorization": authorization_token,
        "Content-Type": "application/json"
    }
    
    # Make the API request
    try:
        response = requests.post(
            f"{base_url}/wallet-transfer",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        # Log the response for debugging
        print(f"Wallet transfer response status: {response.status_code}")
        print(f"Wallet transfer response body: {response.text}")
        
        # Raise an exception for bad status codes
        response.raise_for_status()
        
        return response.json()
        
    except requests.RequestException as e:
        print(f"Error creating wallet transfer: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response headers: {e.response.headers}")
            print(f"Response body: {e.response.text}")
        raise

def create_individual_customer(
    first_name: str,
    last_name: str,
    email: str,
    phone_number: str,
    date_of_birth: str,
    document_type: str,
    document_value: str,
    document_country: str,
    street_line_1: str,
    city: str,
    state: str,
    postal_code: str,
    country: str,
    street_line_2: Optional[str] = None,
    authorization_token: str = AUTH_TOKEN,
    base_url: str = BASE_URL
) -> Dict[str, Union[str, int, Dict]]:
    """
    Create an individual customer using the UnblockPay API.
    """
    identity_documents = [{
        "type": document_type,
        "value": document_value,
        "country": document_country
    }]

    address = {
        "street_line_1": street_line_1,
        "city": city,
        "state": state,
        "postal_code": postal_code,
        "country": country
    }

    if street_line_2:
        address["street_line_2"] = street_line_2

    # Prepare the request payload
    payload = {
        "type": "individual",
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone_number": phone_number,
        "date_of_birth": date_of_birth,
        "identity_documents": identity_documents,
        "address": address
    }

    # Log the request payload for debugging
    print(f"Request payload: {json.dumps(payload, indent=2)}")

    # Prepare headers
    headers = {
        "Authorization": authorization_token,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            f"{base_url}/customers",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        # Log the response for debugging
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        # Try to parse error response even for non-200 status codes
        try:
            response_data = response.json()
        except ValueError:
            response_data = {"error": "Invalid JSON response"}
            
        if not response.ok:
            error_message = response_data.get("error", {}).get("message", str(response_data))
            print(f"API Error: {error_message}")
            raise requests.RequestException(f"API Error: {error_message}")
            
        response.raise_for_status()
        return response_data
        
    except requests.RequestException as e:
        print(f"Error creating customer: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response headers: {e.response.headers}")
            print(f"Response body: {e.response.text}")
        raise

@app.route("/api/check-customer-by-id", methods=["POST", "OPTIONS"])
def check_customer_by_national_id():
    """Check if a customer exists by national ID (CPF, passport, etc.) and return customer ID if found"""
    if request.method == "OPTIONS":
        return "", 200
    
    try:
        data = request.get_json()
        national_id = data.get('national_id')
        
        if not national_id:
            return jsonify({"error": "national_id is required"}), 400
        
        print(f"🔍 Checking for existing customer with national ID: {national_id}")
        
        # Get all customers from UnblockPay API
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{BASE_URL}/customers", headers=headers)
        response.raise_for_status()
        customers = response.json()
        
        print(f"📊 Retrieved {len(customers)} customers from API")
        
        # Search through all customers for matching national ID
        for customer in customers:
            identity_docs = customer.get("identity_documents", [])
            
            for doc in identity_docs:
                doc_value = doc.get("value")
                doc_type = doc.get("type")
                
                # Check if the national ID matches (CPF, passport, national_id, etc.)
                if doc_value == national_id:
                    customer_id = customer.get('id')
                    customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()
                    
                    print(f"✅ Found matching customer:")
                    print(f"   Customer ID: {customer_id}")
                    print(f"   Name: {customer_name}")
                    print(f"   Document Type: {doc_type}")
                    print(f"   Document Value: {doc_value}")
                    
                    # Get external account info
                    external_account = get_customer_external_account(customer_id)
                    
                    # Get wallet info
                    wallet_id = get_customer_wallet_id(customer_id)
                    
                    return jsonify({
                        "customer_exists": True,
                        "customer_id": customer_id,
                        "customer_name": customer_name,
                        "document_type": doc_type,
                        "document_value": doc_value,
                        "has_external_account": external_account is not None,
                        "has_wallet": wallet_id is not None,
                        "external_account_id": external_account.get('id') if external_account else None,
                        "wallet_id": wallet_id,
                        "message": f"Customer found with {doc_type}: {doc_value}"
                    }), 200
        
        print(f"❌ No customer found with national ID: {national_id}")
        return jsonify({
            "customer_exists": False,
            "message": f"No customer found with national ID: {national_id}"
        }), 200
        
    except requests.RequestException as e:
        error_msg = f"Error fetching customers from API: {str(e)}"
        print(f"❌ {error_msg}")
        if hasattr(e, 'response') and e.response:
            print(f"❌ Response: {e.response.text}")
        return jsonify({"error": error_msg}), 500
        
    except Exception as e:
        error_msg = f"Error checking customer by national ID: {str(e)}"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 500

@app.route("/api/create-customer", methods=["POST", "OPTIONS"])
def create_customer():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 200
        
    data = request.json
    print(f"Received data: {json.dumps(data, indent=2)}")
    
    # Check if this is a request to use existing customer
    if data.get('use_existing_customer') and data.get('existing_customer_id'):
        customer_id = data['existing_customer_id']
        print(f"🔄 Using existing customer: {customer_id}")
        
        # Get customer wallet info
        wallet_id = get_customer_wallet_id(customer_id)
        wallet_address = None
        
        # If no wallet exists, create one automatically
        if not wallet_id:
            print(f"⚠️ No wallet found for customer {customer_id}, creating one now...")
            try:
                # Get customer info to create wallet name
                headers = {"Authorization": AUTH_TOKEN, "Content-Type": "application/json"}
                customer_response = requests.get(f"{BASE_URL}/customers/{customer_id}", headers=headers)
                customer_response.raise_for_status()
                customer_data = customer_response.json()
                
                wallet_name = f"{customer_data.get('first_name', 'User')}'s Wallet"
                wallet_data = create_wallet(
                    customer_id=customer_id,
                    name=wallet_name,
                    blockchain="solana"
                )
                wallet_id = wallet_data.get('id')
                wallet_address = wallet_data.get('address')
                
                print(f"✅ Created wallet for existing customer - wallet_id: {wallet_id}, wallet_address: {wallet_address}")
                        
            except Exception as e:
                print(f"❌ Error creating wallet for existing customer: {e}")
                return jsonify({"error": f"Failed to create wallet: {str(e)}"}), 500
        else:
            # Get wallet address for existing wallet
            try:
                headers = {"Authorization": AUTH_TOKEN, "Content-Type": "application/json"}
                wallet_response = requests.get(f"{BASE_URL}/customers/{customer_id}/wallets", headers=headers)
                wallet_response.raise_for_status()
                wallets = wallet_response.json()
                wallet_address = wallets[0].get('address') if wallets and len(wallets) > 0 else None
            except Exception as e:
                print(f"Error getting wallet address: {e}")
                wallet_address = None
        
        return jsonify({
            "message": "Using existing customer",
            "customer_id": customer_id,
            "wallet_id": wallet_id,
            "wallet_address": wallet_address,
            "existing_customer": True
        }), 200
    
    # Check for existing customer by national ID before creating new one
    doc = data["identity_documents"][0] if data.get("identity_documents") else {}
    national_id = doc.get("value")
    
    if national_id:
        print(f"🔍 Checking for existing customer with national ID: {national_id}")
        
        # Use the existing check function
        try:
            headers = {"Authorization": AUTH_TOKEN, "Content-Type": "application/json"}
            response = requests.get(f"{BASE_URL}/customers", headers=headers)
            response.raise_for_status()
            customers = response.json()
            
            # Search for existing customer
            existing_customer = None
            for customer in customers:
                identity_docs = customer.get("identity_documents", [])
                for existing_doc in identity_docs:
                    if existing_doc.get("value") == national_id:
                        existing_customer = customer
                        break
                if existing_customer:
                    break
            
            if existing_customer:
                customer_id = existing_customer.get('id')
                customer_name = f"{existing_customer.get('first_name', '')} {existing_customer.get('last_name', '')}".strip()
                
                # Check if they have an external account
                external_account = get_customer_external_account(customer_id)
                
                if external_account:
                    # Customer exists with external account - return popup data
                    bank_info = {
                        "bank_name": external_account.get("bank_name", "Unknown Bank"),
                        "account_type": external_account.get("account_type", "checking"),
                        "last_4_digits": external_account.get("bank_account_number", "")[-4:] if external_account.get("bank_account_number") else "****"
                    }
                    
                    # Get wallet info for existing customer
                    wallet_id = get_customer_wallet_id(customer_id)
                    wallet_address = None
                    
                    # If no wallet exists, create one automatically for this transaction
                    if not wallet_id:
                        print(f"⚠️ No wallet found for customer {customer_id}, creating one now...")
                        try:
                            wallet_name = f"{customer_name}'s Wallet"
                            wallet_data = create_wallet(
                                customer_id=customer_id,
                                name=wallet_name,
                                blockchain="solana"
                            )
                            wallet_id = wallet_data.get('id')
                            wallet_address = wallet_data.get('address')
                            
                            print(f"✅ Created wallet for existing customer - wallet_id: {wallet_id}, wallet_address: {wallet_address}")
                                    
                        except Exception as e:
                            print(f"❌ Error creating wallet for existing customer: {e}")
                            # Continue with flow - wallet creation failure shouldn't block the user
                            wallet_id = None
                            wallet_address = None
                    else:
                        # Get wallet address for existing wallet
                        try:
                            headers = {"Authorization": AUTH_TOKEN, "Content-Type": "application/json"}
                            wallet_response = requests.get(f"{BASE_URL}/customers/{customer_id}/wallets", headers=headers)
                            wallet_response.raise_for_status()
                            wallets = wallet_response.json()
                            wallet_address = wallets[0].get('address') if wallets and len(wallets) > 0 else None
                        except Exception as e:
                            print(f"Error getting wallet address: {e}")
                    
                    print(f"⚠️ Existing customer found with external account: {customer_id}")
                    return jsonify({
                        "show_popup": True,
                        "existing_customer_found": True,
                        "customer_id": customer_id,
                        "customer_name": customer_name,
                        "has_external_account": True,
                        "bank_info": bank_info,
                        "external_account_id": external_account.get('id'),
                        "wallet_id": wallet_id,
                        "wallet_address": wallet_address,
                        "popup_title": "Welcome Back!",
                        "popup_message": f"Hi {customer_name}! We found your previous bank account:",
                        "popup_details": f"{bank_info['bank_name']} ({bank_info['account_type']}) ending in {bank_info['last_4_digits']}",
                        "popup_question": "Would you like to use this account for your transfer?",
                        "yes_action": "use_existing_account",
                        "no_action": "create_new_account"
                    }), 200
                else:
                    # Customer exists but no external account - proceed with normal flow
                    print(f"🔄 Existing customer found but no external account: {customer_id}")
                    
        except Exception as e:
            print(f"❌ Error checking for existing customer: {str(e)}")
            # Continue with normal flow if check fails
    
    # Validate required top-level fields
    required_top_fields = [
        "first_name", "last_name", "email", "phone_number", "date_of_birth",
        "type", "identity_documents", "address"
    ]
    missing_fields = [field for field in required_top_fields if not data.get(field)]
    if missing_fields:
        error_msg = f"Missing or empty top-level fields: {', '.join(missing_fields)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 400
        
    # Validate identity_documents
    if not data["identity_documents"] or not isinstance(data["identity_documents"], list):
        error_msg = "identity_documents must be a non-empty list"
        print(error_msg)
        return jsonify({"error": error_msg}), 400
        
    doc = data["identity_documents"][0]
    required_doc_fields = ["type", "value", "country"]
    missing_doc_fields = [field for field in required_doc_fields if not doc.get(field)]
    if missing_doc_fields:
        error_msg = f"Missing or empty identity document fields: {', '.join(missing_doc_fields)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 400
        
    # Validate address fields
    required_address_fields = ["street_line_1", "city", "state", "postal_code", "country"]
    missing_address_fields = [field for field in required_address_fields if not data["address"].get(field)]
    if missing_address_fields:
        error_msg = f"Missing or empty address fields: {', '.join(missing_address_fields)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 400
        
    # Validate field formats
    validation_errors = []
    
    # Email format
    if '@' not in data['email']:
        validation_errors.append("Invalid email format")
    
    # Date format (YYYY-MM-DD)
    date_str = data['date_of_birth']
    if not (len(date_str) == 10 and date_str[4] == '-' and date_str[7] == '-'):
        validation_errors.append("Date of birth must be in YYYY-MM-DD format")
    
    # Phone number format (should have at least some digits)
    if not any(c.isdigit() for c in data['phone_number']):
        validation_errors.append("Phone number must contain digits")
        
    # Type must be 'individual'
    if data['type'] != 'individual':
        validation_errors.append("Customer type must be 'individual'")
    
    if validation_errors:
        error_msg = f"Validation errors: {'; '.join(validation_errors)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 400

    try:
        # Extract fields from nested structure
        doc = data["identity_documents"][0]
        addr = data["address"]
        
        # Create customer using the helper function
        response_data = create_individual_customer(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            phone_number=data["phone_number"],
            date_of_birth=data["date_of_birth"],
            document_type=doc["type"],
            document_value=doc["value"],
            document_country=doc["country"],
            street_line_1=addr["street_line_1"],
            city=addr["city"],
            state=addr["state"],
            postal_code=addr["postal_code"],
            country=addr["country"],
            street_line_2=addr.get("street_line_2")
        )

        # Get customer_id and create wallet - data will be stored in frontend localStorage
        customer_id = response_data.get("id")
        if customer_id:
            # Store address for response
            customer_address = {
                "street_line_1": addr["street_line_1"],
                "street_line_2": addr.get("street_line_2"),
                "city": addr["city"],
                "state": addr["state"],
                "postal_code": addr["postal_code"],
                "country": addr["country"]
            }
            
            # Create a wallet for the customer
            wallet_name = f"{data['first_name']}'s Wallet"
            wallet_data = create_wallet(
                customer_id=customer_id,
                name=wallet_name,
                blockchain="solana"  # Using Solana as the default blockchain
            )
            wallet_id = wallet_data.get('id')
            wallet_address = wallet_data.get('address')  # Extract wallet address
            
            if not wallet_id:
                raise ValueError("Failed to create wallet: No wallet ID returned")
                
            if not wallet_address:
                raise ValueError("Failed to create wallet: No wallet address returned")
                
            print(f"Created customer and wallet - customer_id: {customer_id}, wallet_id: {wallet_id}, wallet_address: {wallet_address}")
            print(f"Customer address: {json.dumps(customer_address, indent=2)}")
            print(f"Wallet data: {json.dumps(wallet_data, indent=2)}")
            
            # Add wallet info to the response
            response_data["wallet"] = wallet_data
            response_data["customer_address"] = customer_address

        return jsonify({
            "message": "Customer and wallet created successfully",
            "customer_id": customer_id,
            "wallet_id": wallet_id,
            "wallet_address": wallet_address,
            "full_response": response_data
        }), 201

    except requests.RequestException as e:
        error_message = str(e)
        error_response = getattr(e.response, "text", "No response body") if hasattr(e, "response") else "No response"
        return jsonify({
            "error": error_message,
            "response": error_response
        }), 500

# Removed /api/last-customer-id endpoint - customer data now stored in frontend localStorage

# Removed /api/last-quote-ids endpoint - quote data now stored in frontend localStorage

@app.route("/api/create-external-account", methods=["POST", "OPTIONS"])
def create_us_wire_account():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 200
        
    data = request.json
    print(f"Received external account data: {json.dumps(data, indent=2)}")
    
    # Get customer_id from request body (required)
    customer_id = data.get("customer_id")
    if not customer_id:
        print(f"No customer_id found in request data: {data.get('customer_id')}")
        return jsonify({"error": "customer_id is required in request body"}), 400
    
    print(f"Creating external account for customer ID: {customer_id}")
    
    # Validate required fields
    required_fields = [
        "account_name", "beneficiary_name", "bank_name",
        "bank_account_number", "routing_number", "address"
    ]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        error_msg = f"Missing or empty fields: {', '.join(missing_fields)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 400
    
    try:
        # First, check if an external account already exists with the same routing and account number
        routing_number = data["routing_number"]
        account_number = data["bank_account_number"]
        
        print(f"🔍 Checking for existing external account with routing: {routing_number}, account: {account_number}")
        existing_account_id = check_existing_external_account(routing_number, account_number)
        
        if existing_account_id:
            print(f"✅ Found existing external account: {existing_account_id}")
            print(f"🔗 Reusing existing external account for customer: {customer_id}")
            
            # Return the existing external account ID without creating a new one
            return jsonify({
                "message": "Using existing external account",
                "external_account_id": existing_account_id,
                "reused_existing": True,
                "customer_id": customer_id
            }), 200
        
        # If no existing account found, create a new one
        print(f"📝 No existing account found, creating new external account")
        response_data = create_external_account(
            customer_id=customer_id,
            account_name=data["account_name"],
            beneficiary_name=data["beneficiary_name"],
            bank_name=data["bank_name"],
            bank_account_number=data["bank_account_number"],
            routing_number=data["routing_number"],
            address=data["address"]
        )
        
        return jsonify({
            "message": "External account created successfully",
            "external_account_id": response_data.get("id"),
            "reused_existing": False,
            "full_response": response_data
        }), 201
        
    except requests.RequestException as e:
        error_message = str(e)
        error_response = getattr(e.response, "text", "No response body") if hasattr(e, "response") else "No response"
        return jsonify({
            "error": error_message,
            "response": error_response
        }), 500

# Removed /api/last-external-account-id endpoint - external account data now stored in frontend localStorage

def create_quote(
    symbol: str,
    quote_type: str = "off_ramp",
    authorization_token: str = AUTH_TOKEN,
    base_url: str = BASE_URL
) -> Dict[str, Union[str, int, float]]:
    """Create a quote using the UnblockPay API."""
    try:
        response = requests.post(
            f"{base_url}/quote",
            headers={
                "Authorization": authorization_token,
                "Content-Type": "application/json"
            },
            json={
                "symbol": symbol,
                "type": quote_type
            }
        )
        response.raise_for_status()
        quote_data = response.json()
        print(f"Quote response: {quote_data}")
        return quote_data
    except requests.RequestException as e:
        print(f"Error creating quote: {e}")
        error_response = getattr(e.response, "text", "No response body") if hasattr(e, "response") else "No response"
        raise Exception(f"Failed to create quote: {error_response}")

@app.route("/api/create-quote", methods=["POST", "OPTIONS"])
def create_quote_endpoint():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 200
        
    try:
        data = request.json
        symbol = data.get("symbol")
        amount_usd = float(data.get("amount_usd", 0))
        
        if not symbol:
            return jsonify({"error": "symbol is required"}), 400
        if amount_usd <= 0:
            return jsonify({"error": "amount_usd must be greater than 0"}), 400
            
        # Map input symbol to UnblockPay API symbols
        # Frontend sends USDC/BRL, we need USDC-BRL
        currency = symbol.split("/")[1]  # Get BRL
        on_ramp_symbol = f"USDC/{currency}"
        off_ramp_symbol = "USDC/USD"
            
        # Get on-ramp quote (USDC-BRL)
        on_ramp_quote = create_quote(symbol=on_ramp_symbol, quote_type="on_ramp")
        # Get off-ramp quote (always USDC-USD)
        off_ramp_quote = create_quote(symbol=off_ramp_symbol, quote_type="off_ramp")
        
        # Parse rates
        on_ramp_rate = float(on_ramp_quote["quotation"])  # Local/USDC rate
        off_ramp_rate = float(off_ramp_quote["quotation"])  # USDC/USD rate
        
        # Simplified calculation: assume no fees and USDC:USD = 1:1
        # We still generate off-ramp quote but don't use its rate data
        on_ramp_flat_fee_usdc = 0.0  # Assume no fees
        off_ramp_flat_fee_usd = 0.0  # Assume no fees
        
        # Calculate total local currency needed
        # Since USDC:USD = 1:1, we need exactly amount_usd worth of USDC
        usdc_needed = amount_usd  # 1:1 rate, no fees
        # Convert USDC needed to local currency using on-ramp rate
        total_local_amount_raw = usdc_needed * on_ramp_rate
        # Round up to nearest whole BRL
        import math
        total_local_amount = math.ceil(total_local_amount_raw)
        
        # Calculate total fees in USD (zero for now)
        total_fees_usd = 0.0
        
        # Quote IDs will be stored in frontend localStorage
        print(f"Created quotes - on_ramp_id: {on_ramp_quote.get('id')}, off_ramp_id: {off_ramp_quote.get('id')}")
        
        # Combine the quotes with calculations
        combined_quote = {
            "on_ramp": on_ramp_quote,
            "off_ramp": off_ramp_quote,
            "amount_usd": amount_usd,
            "total_local_amount": total_local_amount,
            "total_fees_usd": total_fees_usd,
            "effective_rate": on_ramp_rate,  # Since USDC:USD = 1:1, effective rate is just the on-ramp rate
            "expires_at": min(on_ramp_quote["expires_at"], off_ramp_quote["expires_at"]),
            "expires_at_readable": datetime.fromtimestamp(
                min(on_ramp_quote["expires_at"], off_ramp_quote["expires_at"])
            ).strftime("%Y-%m-%d %H:%M:%S"),
        }
            
        return jsonify(combined_quote), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/create-wallet", methods=["POST", "OPTIONS"])
def create_wallet_endpoint():
    """
    Create a wallet for a customer.
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 200
        
    try:
        data = request.json or {}
        customer_id = data.get("customer_id")
        name = data.get("name", "Default Wallet")
        blockchain = data.get("blockchain", "solana")
        
        if not customer_id:
            return jsonify({"error": "customer_id is required"}), 400
        
        # Create the wallet using the helper function
        wallet_data = create_wallet(customer_id, name, blockchain)
        
        # Wallet ID will be returned to frontend for localStorage storage
        wallet_id = wallet_data.get("id")
        if wallet_id:
            print(f"Created wallet with ID: {wallet_id}")
        
        return jsonify({
            "wallet_id": wallet_id,
            "wallet_data": wallet_data
        }), 201
        
    except Exception as e:
        print(f"Error in create_wallet_endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/create-pix-payment", methods=["POST", "OPTIONS"])
def create_pix_payment():
    """
    Create a PIX payment for on-ramp transactions using UnblockPay payin API.
    Returns the complete transaction response including PIX payment instructions.
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 200
        
    try:
        data = request.json or {}
        amount_brl = float(data.get("amount_brl", 0))
        customer_id = data.get("customer_id")
        wallet_address = data.get("wallet_address")
        quote_id = data.get("quote_id")
        sender_name = data.get("sender_name")
        sender_document = data.get("sender_document")  # CPF
        
        # Validate required parameters
        if not amount_brl or amount_brl <= 0:
            return jsonify({"error": "A valid amount_brl is required"}), 400
        if not customer_id:
            return jsonify({"error": "customer_id is required"}), 400
        if not wallet_address:
            return jsonify({"error": "wallet_address is required"}), 400
        if not quote_id:
            return jsonify({"error": "quote_id is required"}), 400
        if not sender_name:
            return jsonify({"error": "sender_name is required"}), 400
        if not sender_document:
            return jsonify({"error": "sender_document (CPF) is required"}), 400
        
        print(f"Creating PIX payin transaction:")
        print(f"  Amount: R$ {amount_brl}")
        print(f"  Quote ID: {quote_id}")
        print(f"  Customer ID: {customer_id}")
        print(f"  Sender: {sender_name} (CPF: {sender_document})")
        print(f"  Wallet address: {wallet_address}")
        
        # Prepare the payin request payload exactly as per UnblockPay API
        payload = {
            "amount": amount_brl,
            "quote_id": quote_id,
            "customer_id": customer_id,
            "sender": {
                "currency": "BRL",
                "payment_rail": "pix",
                "name": sender_name,
                "document": sender_document
            },
            "receiver": {
                "currency": "USDC",
                "payment_rail": "solana",
                "address": wallet_address
            }
        }
        
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        print(f"Making request to {BASE_URL}/payin")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        # Make the API request to UnblockPay payin endpoint
        response = requests.post(
            f"{BASE_URL}/payin",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response body: {response.text}")
        
        response.raise_for_status()
        transaction_response = response.json()
        
        # Log the complete response structure for debugging
        print(f"=== PAYIN API RESPONSE STRUCTURE ===")
        print(f"Full response: {json.dumps(transaction_response, indent=2)}")
        print(f"====================================")
        
        # Transaction ID will be returned to frontend for localStorage storage
        transaction_id = transaction_response.get("id")
        if transaction_id:
            print(f"Created transaction with ID: {transaction_id}")
            
        # Extract deposit address from sender_deposit_instructions (based on actual API response structure)
        deposit_address = transaction_response.get("sender_deposit_instructions", {}).get("deposit_address")
        print(f"Extracted deposit address from sender_deposit_instructions: {deposit_address}")
        
        if not deposit_address:
            # Fallback locations if not in sender_deposit_instructions
            fallback_locations = [
                transaction_response.get("sender", {}).get("deposit_address"),
                transaction_response.get("deposit_address"),
                transaction_response.get("payment_instructions", {}).get("deposit_address"),
                transaction_response.get("payment_instructions", {}).get("pix_code"),
                transaction_response.get("receiver", {}).get("deposit_address"),
            ]
            
            for addr in fallback_locations:
                if addr:
                    deposit_address = addr
                    print(f"Using fallback deposit address: {deposit_address}")
                    break
        
        # Return the complete transaction response with deposit address explicitly included
        return jsonify({
            "success": True,
            "transaction": transaction_response,
            "transaction_id": transaction_id,
            "status": transaction_response.get("status", "unknown"),
            "amount_brl": amount_brl,
            "wallet_address": wallet_address,
            "deposit_address": deposit_address  # Explicitly include deposit address
        }), 201
        
    except requests.RequestException as e:
        error_msg = f"Error creating payin transaction: {str(e)}"
        print(error_msg)
        
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response headers: {e.response.headers}")
            print(f"Response body: {e.response.text}")
            
            try:
                error_data = e.response.json()
                error_msg = error_data.get('message', error_data.get('error', str(e)))
            except:
                error_msg = e.response.text or str(e)
        
        return jsonify({
            "success": False,
            "error": f"Failed to create PIX payment: {error_msg}"
        }), 500
        
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        print(error_msg)
        return jsonify({
            "success": False,
            "error": error_msg
        }), 500

@app.route("/api/create-spei-payment", methods=["POST", "OPTIONS"])
def create_spei_payment():
    """
    Create a SPEI payment for on-ramp transactions using UnblockPay payin API.
    Returns the complete transaction response including SPEI payment instructions.
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 200
        
    try:
        data = request.json or {}
        amount_mxn = float(data.get("amount_mxn", 0))
        customer_id = data.get("customer_id")
        wallet_id = data.get("wallet_id")
        quote_id = data.get("quote_id")
        sender_clabe = data.get("sender_clabe")
        
        # Validate required parameters
        if not amount_mxn or amount_mxn <= 0:
            return jsonify({"error": "A valid amount_mxn is required"}), 400
        if not customer_id:
            return jsonify({"error": "customer_id is required"}), 400
        if not wallet_id:
            return jsonify({"error": "wallet_id is required"}), 400
        if not quote_id:
            return jsonify({"error": "quote_id is required"}), 400
        if not sender_clabe:
            return jsonify({"error": "sender_clabe is required"}), 400
        
        print(f"Creating SPEI payin transaction:")
        print(f"  Amount: ${amount_mxn} MXN")
        print(f"  Quote ID: {quote_id}")
        print(f"  Customer ID: {customer_id}")
        print(f"  Sender CLABE: {sender_clabe}")
        print(f"  Wallet ID: {wallet_id}")
        
        # Prepare the payin request payload exactly as per UnblockPay API
        payload = {
            "amount": amount_mxn,
            "quote_id": quote_id,
            "customer_id": customer_id,
            "sender": {
                "currency": "MXN",
                "payment_rail": "spei",
                "clabe": sender_clabe
            },
            "receiver": {
                "currency": "USDC",
                "payment_rail": "polygon",
                "wallet_id": wallet_id
            }
        }
        
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        print(f"Making request to {BASE_URL}/payin")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        # Make the API request to UnblockPay payin endpoint
        response = requests.post(
            f"{BASE_URL}/payin",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response body: {response.text}")
        
        response.raise_for_status()
        transaction_response = response.json()
        
        # Log the complete response structure for debugging
        print(f"=== PAYIN API RESPONSE STRUCTURE ===")
        print(f"Full response: {json.dumps(transaction_response, indent=2)}")
        print(f"====================================")
        
        # Transaction ID will be returned to frontend for localStorage storage
        transaction_id = transaction_response.get("id")
        if transaction_id:
            print(f"Created transaction with ID: {transaction_id}")
            
        # Extract deposit address from sender_deposit_instructions (based on actual API response structure)
        deposit_address = transaction_response.get("sender_deposit_instructions", {}).get("deposit_address")
        bank_account = transaction_response.get("sender_deposit_instructions", {}).get("bank_account", {})
        beneficiary = bank_account.get("beneficiary", {})
        
        print(f"Extracted deposit address from sender_deposit_instructions: {deposit_address}")
        print(f"Bank account info: {bank_account}")
        print(f"Beneficiary info: {beneficiary}")
        
        if not deposit_address:
            # Fallback locations if not in sender_deposit_instructions
            fallback_locations = [
                transaction_response.get("sender", {}).get("deposit_address"),
                transaction_response.get("deposit_address"),
                transaction_response.get("payment_instructions", {}).get("deposit_address"),
                transaction_response.get("payment_instructions", {}).get("clabe"),
                transaction_response.get("receiver", {}).get("deposit_address"),
            ]
            
            for addr in fallback_locations:
                if addr:
                    deposit_address = addr
                    print(f"Using fallback deposit address: {deposit_address}")
                    break
        
        # Return the complete transaction response with SPEI payment details
        return jsonify({
            "success": True,
            "transaction": transaction_response,
            "transaction_id": transaction_id,
            "status": transaction_response.get("status", "unknown"),
            "amount_mxn": amount_mxn,
            "wallet_id": wallet_id,
            "deposit_address": deposit_address,  # CLABE for SPEI transfers
            "bank_account": bank_account,
            "beneficiary": beneficiary
        }), 201
        
    except requests.RequestException as e:
        error_msg = f"Error creating payin transaction: {str(e)}"
        print(error_msg)
        
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response headers: {e.response.headers}")
            print(f"Response body: {e.response.text}")
            
            try:
                error_data = e.response.json()
                error_msg = error_data.get('message', error_data.get('error', str(e)))
            except:
                error_msg = e.response.text or str(e)
        
        return jsonify({
            "success": False,
            "error": f"Failed to create SPEI payment: {error_msg}"
        }), 500
        
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        print(error_msg)
        return jsonify({
            "success": False,
            "error": error_msg
        }), 500


# Set to track processed transactions to avoid duplicate processing
processed_transactions = set()

# Dictionary to track webhook events and off-ramp transactions by payin transaction ID
webhook_status_tracker = {}

def save_webhook_to_database(payload, event_type, event_resource, event_resource_status):
    """Save webhook event to Supabase database"""
    if not supabase:
        print("Supabase not configured - skipping database save")
        return None
    
    try:
        transaction_id = event_resource.get("id")
        customer_id = event_resource.get("customer_id")
        
        # Try to find user_id by customer_id
        user_id = None
        if customer_id:
            result = supabase.table("user_profiles").select("id").eq("unblockpay_customer_id", customer_id).execute()
            if result.data and len(result.data) > 0:
                user_id = result.data[0]["id"]
        
        # Extract amounts
        sender_amount = event_resource.get("sender", {}).get("amount")
        receiver_amount = event_resource.get("receiver", {}).get("amount")
        sender_currency = event_resource.get("sender", {}).get("currency")
        
        # Save webhook event
        webhook_data = {
            "event_type": event_type,
            "event_resource": event_resource,
            "event_resource_status": event_resource_status,
            "transaction_id": transaction_id,
            "customer_id": customer_id,
            "user_id": user_id,
            "amount_local": float(sender_amount) if sender_amount else None,
            "local_currency": sender_currency,
            "amount_usd": float(receiver_amount) if receiver_amount else None,
            "status": event_resource_status or "unknown",
            "raw_payload": payload
        }
        
        result = supabase.table("webhook_events").insert(webhook_data).execute()
        print(f"✅ Saved webhook event to database - ID: {result.data[0]['id'] if result.data else 'unknown'}")
        
        # Create/update transaction record for user
        if user_id and transaction_id:
            transaction_data = {
                "user_id": user_id,
                "unblockpay_transaction_id": transaction_id,
                "type": "payin" if "payin" in event_type else "payout",
                "status": event_resource_status or "processing",
                "amount_usd": float(receiver_amount) if receiver_amount else 0,
                "amount_local": float(sender_amount) if sender_amount else None,
                "local_currency": sender_currency,
                "metadata": event_resource
            }
            
            # Check if transaction already exists
            existing = supabase.table("transactions").select("id").eq("unblockpay_transaction_id", transaction_id).execute()
            
            if existing.data and len(existing.data) > 0:
                # Update existing
                supabase.table("transactions").update(transaction_data).eq("unblockpay_transaction_id", transaction_id).execute()
                print(f"✅ Updated transaction record for user {user_id}")
            else:
                # Create new
                supabase.table("transactions").insert(transaction_data).execute()
                print(f"✅ Created transaction record for user {user_id}")
        
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"❌ Error saving webhook to database: {str(e)}")
        return None

# Add a simple test endpoint to verify webhook URL is accessible
@app.route("/webhook/unblockpay", methods=["GET"])
def test_webhook_endpoint():
    """Test endpoint to verify webhook URL is accessible"""
    print(f"GET request to webhook endpoint at {datetime.now()}")
    return jsonify({
        "status": "webhook_endpoint_accessible",
        "message": "UnblockPay webhook endpoint is working",
        "timestamp": datetime.now().isoformat(),
        "url": request.url,
        "method": request.method
    }), 200

# Webhook endpoint to handle UnblockPay events
@app.route("/webhook/unblockpay", methods=["POST"])
def handle_unblockpay_webhook():
    """Handle webhook events from UnblockPay"""
    try:
        # Log raw request for debugging - ALWAYS LOG WEBHOOK RECEIPT
        print(f"\n\n🚨 WEBHOOK RECEIVED! 🚨 AT {datetime.now()} 🚨")
        print(f"🔥 WEBHOOK URL: {request.url}")
        print(f"🔥 METHOD: {request.method}")
        print(f"🔥 HEADERS: {dict(request.headers)}")
        print(f"🔥 RAW DATA: {request.get_data()}")
        print(f"🔥 CONTENT-TYPE: {request.content_type}")
        print(f"🔥 REMOTE ADDRESS: {request.remote_addr}")
        print(f"🔥 USER AGENT: {request.headers.get('User-Agent', 'Unknown')}")
        print(f"🚨 WEBHOOK RECEIVED! 🚨 END 🚨\n")
        
        payload = request.get_json()
        if not payload:
            print("ERROR: No JSON payload received")
            return jsonify({"status": "error", "message": "No JSON payload"}), 400
            
        # Extract webhook data using correct UnblockPay format
        event = payload.get("event")
        event_type = payload.get("event_type")
        event_resource = payload.get("event_resource", {})
        event_resource_status = payload.get("event_resource_status")
        
        print(f"\n🎯 WEBHOOK DATA PARSED 🎯")
        print(f"🎯 EVENT: {event}")
        print(f"🎯 EVENT TYPE: {event_type}")
        print(f"🎯 EVENT RESOURCE STATUS: {event_resource_status}")
        print(f"🎯 EVENT RESOURCE: {json.dumps(event_resource, indent=2)}")
        print(f"🎯 WEBHOOK DATA PARSED END 🎯\n")
        
        # Save webhook to database
        save_webhook_to_database(payload, event_type, event_resource, event_resource_status)
        
        # Handle payin.processing event - payment detected
        if event_type == "payin.processing":
            transaction_id = event_resource.get("id")
            print(f"🎉 PIX payment processing - Transaction ID: {transaction_id}")
            
            # Track webhook status for frontend polling
            if transaction_id not in webhook_status_tracker:
                webhook_status_tracker[transaction_id] = {}
            
            webhook_status_tracker[transaction_id]["payin_processing"] = True
            webhook_status_tracker[transaction_id]["timestamp"] = datetime.now().isoformat()
            
            print(f"✅ Updated webhook_status_tracker with payin_processing for: {transaction_id}")
            print(f"Current tracker state: {webhook_status_tracker[transaction_id]}")
        
        # Handle payin.completed event - payment received
        elif event_type == "payin.completed":
            transaction_id = event_resource.get("id")
            customer_id = event_resource.get("customer_id")
            # Extract BRL amount from sender
            sender_amount = event_resource.get("sender", {}).get("amount")
            # Extract USDC amount from receiver
            receiver_amount = event_resource.get("receiver", {}).get("amount")
            # Extract wallet address from receiver for off-ramp
            wallet_address = event_resource.get("receiver", {}).get("address")
            
            print(f"PIX payment completed - Transaction ID: {transaction_id}")
            print(f"Sender amount: {sender_amount} BRL, Receiver amount: {receiver_amount} USDC")
            
            # Track webhook status for frontend polling
            webhook_status_tracker[transaction_id] = {
                "payin_completed": True,
                "payin_amount_brl": sender_amount,
                "payin_amount_usdc": receiver_amount,
                "customer_id": customer_id,
                "timestamp": datetime.now().isoformat()
            }
            
            # Automatically create off-ramp transaction
            try:
                # Always call API to get customer's external accounts
                print(f"=== CHECKING FOR CUSTOMER EXTERNAL ACCOUNTS ===")
                print(f"About to call get_customer_external_account for customer: {customer_id}")
                
                external_account = get_customer_external_account(customer_id)
                print(f"get_customer_external_account returned: {external_account}")
                
                if external_account:
                    # Use customer's external account ID from API
                    external_account_id = external_account["id"]
                    print(f"SUCCESS: Using customer's external account ID from API: {external_account_id}")
                else:
                    # Fallback to pre-configured external account for check delivery
                    external_account_id = CHECK_DELIVERY_EXTERNAL_ACCOUNT_ID
                    print(f"FALLBACK: No customer external account found, using check delivery account: {external_account_id}")
                    
                    # Send Slack notification for check delivery (without session data)
                    transaction_data = {
                        "cusomter_id": customer_id,  # Note: keeping original typo for webhook compatibility
                        "transaction_id": transaction_id,
                        "amount": sender_amount,
                        "note": "Check delivery - customer data not available in webhook context"
                    }
                    send_slack_notification(transaction_data)
                
                # Generate new off-ramp quote for this payout
                off_ramp_quote = create_quote(symbol="USDC/USD", quote_type="off_ramp")
                if not off_ramp_quote:
                    print("Failed to create off-ramp quote")
                    return jsonify({"status": "error", "message": "Failed to create quote"}), 500
                
                off_ramp_quote_id = off_ramp_quote.get("id")
                print(f"Created new off-ramp quote ID: {off_ramp_quote_id}")
                
                # Use the USDC amount received from the payin for the off-ramp
                usdc_amount = receiver_amount
                print(f"Creating off-ramp payout with USDC amount: {usdc_amount}")
                # Create off-ramp payout with the USDC amount
                payout_result = create_off_ramp_payout(
                    amount=usdc_amount,
                    quote_id=off_ramp_quote["id"],
                    customer_id=customer_id,
                    external_account_id=external_account_id
                )              
                if payout_result:
                    payout_id = payout_result.get('id')
                    print(f"Successfully created off-ramp payout: {payout_id}")
                    
                    # Update webhook status tracker with off-ramp transaction info
                    webhook_status_tracker[transaction_id]["offramp_transaction"] = {
                        "id": payout_id,
                        "status": "processing",
                        "amount": usdc_amount,
                        "currency": "USD",
                        "created_at": datetime.now().isoformat()
                    }
                    
                    return jsonify({"status": "success", "payout_id": payout_id}), 200
                else:
                    print("Failed to create off-ramp payout")
                    return jsonify({"status": "error", "message": "Failed to create payout"}), 500
                    
            except Exception as e:
                print(f"Error processing payin.completed webhook: {str(e)}")
                return jsonify({"status": "error", "message": str(e)}), 500
        
        # Handle payin.created event - transaction created
        elif event_type == "payin.created":
            transaction_id = event_resource.get("id")
            print(f"PIX payment created - Transaction ID: {transaction_id}")
            
            if not transaction_id:
                print(f"WARNING: payin.created webhook missing transaction ID")
                print(f"Event resource: {json.dumps(event_resource, indent=2)}")
            
            # Store the transaction creation event
            webhook_status_tracker[transaction_id] = {
                "payin_created": True,
                "payin_completed": False,
                "offramp_created": False,
                "offramp_completed": False,
                "offramp_failed": False,
                "transaction": event_resource
            }
            
            return jsonify({"status": "success"}), 200
        
        # Handle other webhook events
        elif event_type == "payout.completed":
            transaction_id = event_resource.get("id")
            print(f"Off-ramp payout completed - Transaction ID: {transaction_id}")
            
            # Find the payin transaction that triggered this payout
            payin_transaction_id = None
            for payin_id, status_data in webhook_status_tracker.items():
                if status_data.get("offramp_transaction", {}).get("id") == transaction_id:
                    payin_transaction_id = payin_id
                    break
            
            if payin_transaction_id:
                webhook_status_tracker[payin_transaction_id]["offramp_completed"] = True
                webhook_status_tracker[payin_transaction_id]["offramp_transaction"]["status"] = "completed"
                print(f"Updated webhook status for payin transaction: {payin_transaction_id}")
            else:
                print(f"WARNING: payout.completed webhook for unknown transaction ID: {transaction_id}")
                print(f"Current tracked payin transactions: {list(webhook_status_tracker.keys())}")
                print(f"Event resource: {json.dumps(event_resource, indent=2)}")
            
        elif event_type == "payout.failed":
            transaction_id = event_resource.get("id")
            print(f"Off-ramp transaction failed - Transaction ID: {transaction_id}")
            
            # Find the corresponding payin transaction
            payin_transaction_id = None
            for payin_id, status_data in webhook_status_tracker.items():
                if status_data.get("offramp_transaction", {}).get("id") == transaction_id:
                    payin_transaction_id = payin_id
                    break
            
            if payin_transaction_id:
                webhook_status_tracker[payin_transaction_id]["offramp_failed"] = True
                webhook_status_tracker[payin_transaction_id]["offramp_transaction"]["status"] = "failed"
                print(f"Updated webhook status for payin transaction: {payin_transaction_id}")
            else:
                print(f"WARNING: payout.failed webhook for unknown transaction ID: {transaction_id}")
                print(f"Current tracked payin transactions: {list(webhook_status_tracker.keys())}")
                print(f"Event resource: {json.dumps(event_resource, indent=2)}")
        
        else:
            # Handle unknown event types
            print(f"WARNING: Unknown webhook event type: {event_type}")
            print(f"Event resource: {json.dumps(event_resource, indent=2)}")
            
        # Always return success to acknowledge webhook receipt
        print(f"\n✅ WEBHOOK PROCESSING COMPLETE ✅")
        print(f"✅ EVENT TYPE PROCESSED: {event_type}")
        print(f"✅ CURRENT WEBHOOK STATUS TRACKER: {json.dumps(webhook_status_tracker, indent=2)}")
        print(f"✅ WEBHOOK PROCESSING COMPLETE END ✅\n")
        return jsonify({"status": "success", "event_type": event_type}), 200
        
    except Exception as e:
        error_msg = f"Webhook error: {str(e)}"
        print(f"\n❌ WEBHOOK ERROR! ❌")
        print(f"❌ ERROR MESSAGE: {error_msg}")
        print(f"❌ REQUEST DATA: {request.get_data()}")
        print(f"❌ WEBHOOK ERROR END ❌\n")
        # Still return 200 to avoid webhook retries
        return jsonify({"status": "error", "message": error_msg}), 200

@app.route("/api/webhook-status/<transaction_id>", methods=["GET"])
def get_webhook_status(transaction_id):
    """Get webhook status for a specific transaction ID"""
    try:
        print(f"Webhook status request for transaction: {transaction_id}")
        print(f"Current webhook_status_tracker keys: {list(webhook_status_tracker.keys())}")
        print(f"Total tracked transactions: {len(webhook_status_tracker)}")
        status_data = webhook_status_tracker.get(transaction_id, {})
        print(f"Returning webhook status data: {status_data}")
        
        # Ensure we return proper JSON with correct content-type
        response = jsonify(status_data)
        response.headers['Content-Type'] = 'application/json'
        return response, 200
        
    except Exception as e:
        error_msg = f"Error getting webhook status: {str(e)}"
        print(error_msg)
        
        # Return proper JSON error response
        return jsonify({"error": error_msg}), 500

@app.route("/api/user-transactions/<user_id>", methods=["GET"])
def get_user_transactions(user_id):
    """Get all transactions for a specific user from Supabase, grouped by amount and time"""
    try:
        if not supabase:
            return jsonify({"error": "Database not configured"}), 500
        
        print(f"Fetching transactions for user: {user_id}")
        
        # Get user's unblockpay_customer_id
        user_profile = supabase.table("user_profiles").select("unblockpay_customer_id").eq("id", user_id).execute()
        
        if not user_profile.data or len(user_profile.data) == 0:
            print(f"No user profile found for user_id: {user_id}")
            return jsonify({"transactions": [], "summary": {"total_sent": 0, "total_completed": 0, "total_pending": 0, "transaction_count": 0}}), 200
        
        customer_id = user_profile.data[0].get("unblockpay_customer_id")
        print(f"User's unblockpay_customer_id: {customer_id}")
        
        # Query webhook_events table by customer_id
        result = supabase.table("webhook_events").select("*").eq("customer_id", customer_id).order("created_at", desc=True).execute()
        
        raw_transactions = result.data if result.data else []
        print(f"Found {len(raw_transactions)} webhook events for customer_id: {customer_id}")
        
        from datetime import datetime, timedelta
        
        # Group transactions by similar amount and time proximity
        grouped_transactions = []
        used_indices = set()
        
        for i, t1 in enumerate(raw_transactions):
            if i in used_indices:
                continue
                
            # Start a new transaction group
            # Map webhook_events fields to transaction fields
            event_type = t1.get("event_type", "")
            tx_type = "payin" if "payin" in event_type else "payout"
            
            group = {
                "id": t1.get("id"),
                "unblockpay_transaction_id": t1.get("transaction_id"),
                "amount_usd": float(t1.get("amount_usd", 0)),
                "amount_local": t1.get("amount_local"),
                "local_currency": t1.get("local_currency"),
                "created_at": t1.get("created_at"),
                "updated_at": t1.get("updated_at") or t1.get("created_at"),
                "recipient": None,
                "reference": None,
                "statuses": [t1.get("status")],
                "types": [tx_type],
                "all_transactions": [t1]
            }
            used_indices.add(i)
            
            t1_time = datetime.fromisoformat(t1.get("created_at").replace('Z', '+00:00'))
            t1_amount = float(t1.get("amount_usd", 0))
            
            # Find related transactions (within $10.20 and 5 minutes) - check all transactions
            for j, t2 in enumerate(raw_transactions):
                if j in used_indices or j == i:
                    continue
                
                t2_time = datetime.fromisoformat(t2.get("created_at").replace('Z', '+00:00'))
                t2_amount = float(t2.get("amount_usd", 0))
                
                # Check if amounts are within $10.20 (to account for $10 bonus) and times are within 5 minutes
                amount_diff = abs(t1_amount - t2_amount)
                time_diff = abs((t1_time - t2_time).total_seconds())
                
                if amount_diff <= 10.20 and time_diff <= 300:  # $10.20 and 5 minutes
                    group["statuses"].append(t2.get("status"))
                    group["types"].append(t2.get("type"))
                    group["all_transactions"].append(t2)
                    group["updated_at"] = max(group["updated_at"], t2.get("updated_at"))
                    used_indices.add(j)
            
            # Determine overall status based on the most recent transaction status
            # Sort transactions by updated_at to get the most recent status
            sorted_txs = sorted(group["all_transactions"], key=lambda x: x.get("updated_at", ""), reverse=True)
            most_recent_status = sorted_txs[0].get("status") if sorted_txs else "unknown"
            
            # Find the highest USD amount in the group (to show payout amount with $10 bonus)
            max_usd_amount = max(float(tx.get("amount_usd", 0)) for tx in group["all_transactions"])
            group["amount_usd"] = max_usd_amount
            
            statuses = group["statuses"]
            # Priority: failed > most_recent > completed (all) > processing > awaiting_deposit > pending
            if "failed" in statuses:
                group["status"] = "failed"
            elif most_recent_status in ["completed", "processing", "awaiting_deposit", "pending"]:
                group["status"] = most_recent_status
            elif "completed" in statuses and len([s for s in statuses if s == "completed"]) == len(statuses):
                group["status"] = "completed"
            elif "processing" in statuses:
                group["status"] = "processing"
            elif "awaiting_deposit" in statuses:
                group["status"] = "awaiting_deposit"
            elif "pending" in statuses:
                group["status"] = "pending"
            else:
                group["status"] = statuses[0] if statuses else "unknown"
            
            # Clean up temporary fields
            del group["statuses"]
            del group["types"]
            del group["all_transactions"]
            
            grouped_transactions.append(group)
        
        # Calculate totals based on unique transaction groups
        total_sent = sum(float(t["amount_usd"]) for t in grouped_transactions)
        total_completed = sum(float(t["amount_usd"]) for t in grouped_transactions if t["status"] == "completed")
        total_pending = sum(float(t["amount_usd"]) for t in grouped_transactions if t["status"] in ["pending", "processing", "awaiting_deposit"])
        
        print(f"Found {len(grouped_transactions)} unique transaction groups for user {user_id}")
        print(f"Total sent: ${total_sent}, Completed: ${total_completed}, Pending: ${total_pending}")
        
        # Debug: Print raw transaction count
        print(f"Raw transactions from DB: {len(raw_transactions)}")
        if raw_transactions:
            print(f"Most recent raw transaction: {raw_transactions[0].get('created_at')} - Status: {raw_transactions[0].get('status')} - Amount: ${raw_transactions[0].get('amount_usd')}")
            print(f"All raw transaction timestamps:")
            for tx in raw_transactions[:5]:  # Show first 5
                print(f"  - {tx.get('created_at')} | ${tx.get('amount_usd')} | {tx.get('status')} | Type: {tx.get('type')}")
        
        return jsonify({
            "transactions": grouped_transactions,
            "summary": {
                "total_sent": total_sent,
                "total_completed": total_completed,
                "total_pending": total_pending,
                "transaction_count": len(grouped_transactions)
            }
        }), 200
        
    except Exception as e:
        error_msg = f"Error fetching user transactions: {str(e)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 500

def get_customer_wallet_id(customer_id: str) -> Optional[str]:
    """Get the first wallet_id for a customer"""
    try:
        print(f"=== GETTING CUSTOMER WALLET ID ===")
        print(f"Customer ID: {customer_id}")
        
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{BASE_URL}/customers/{customer_id}/wallets",
            headers=headers
        )
        
        print(f"Get wallets API response status: {response.status_code}")
        print(f"Get wallets API response: {response.text}")
        
        response.raise_for_status()
        wallets_data = response.json()
        
        if wallets_data and len(wallets_data) > 0:
            wallet_id = wallets_data[0].get("id")
            print(f"Found wallet_id: {wallet_id}")
            return wallet_id
        else:
            print("No wallets found for customer")
            return None
            
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error getting customer wallet: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        return None
    except Exception as e:
        print(f"Error getting customer wallet: {str(e)}")
        return None

def get_customer_external_account(customer_id: str) -> Optional[Dict]:
    """Get the first external account for a customer"""
    try:
        print(f"=== GETTING CUSTOMER EXTERNAL ACCOUNTS ===")
        print(f"Customer ID: {customer_id}")
        
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        url = f"{BASE_URL}/customers/{customer_id}/external-accounts"
        print(f"Making request to: {url}")
        
        response = requests.get(url, headers=headers)
        
        print(f"External accounts API response status: {response.status_code}")
        print(f"External accounts API response: {response.text}")
        
        response.raise_for_status()
        
        accounts = response.json()
        print(f"Parsed accounts: {accounts}")
        
        if accounts and len(accounts) > 0:
            print(f"Found {len(accounts)} external account(s), using first one: {accounts[0]}")
            return accounts[0]  # Return first external account
        
        print("No external accounts found for customer")
        return None
        
    except Exception as e:
        print(f"Error getting external accounts: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        return None

def create_off_ramp_quote() -> Optional[Dict]:
    """Create a quote for USDC to USD off-ramp"""
    try:
        print(f"=== CREATING OFF-RAMP QUOTE ===")
        headers = {
            "Authorization": f"Bearer {AUTH_TOKEN}",
            "Content-Type": "application/json"
        }
        
        quote_data = {
            "symbol": "USDC/USD", 
            "type": "off_ramp"
        }
        
        print(f"Quote request data: {json.dumps(quote_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/quote",
            headers=headers,
            json=quote_data
        )
        
        print(f"Quote API response status: {response.status_code}")
        print(f"Quote API response: {response.text}")
        
        response.raise_for_status()
        quote_result = response.json()
        print(f"Successfully created quote: {json.dumps(quote_result, indent=2)}")
        
        return quote_result
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error creating off-ramp quote: {e}")
        print(f"Response content: {e.response.text if e.response else 'No response'}")
        return None
    except Exception as e:
        print(f"Error creating off-ramp quote: {str(e)}")
        return None

def create_quote_new(symbol: str, quote_type: str) -> Optional[Dict]:
    """Create a quote with configurable symbol and type parameters"""
    try:
        print(f"=== CREATING QUOTE FOR {symbol} (TYPE: {quote_type}) ===")
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        quote_data = {
            "symbol": symbol, 
            "type": quote_type
        }
        
        print(f"Quote request data: {json.dumps(quote_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/quote",
            headers=headers,
            json=quote_data
        )
        
        print(f"Quote API response status: {response.status_code}")
        print(f"Quote API response: {response.text}")
        
        response.raise_for_status()
        quote_result = response.json()
        print(f"Successfully created quote: {json.dumps(quote_result, indent=2)}")
        
        return quote_result
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error creating quote: {e}")
        print(f"Response content: {e.response.text if e.response else 'No response'}")
        return None
    except Exception as e:
        print(f"Error creating quote: {str(e)}")
        return None

@app.route("/api/create-quote-new", methods=["POST", "OPTIONS"])
def create_quote_new_endpoint():
    """API endpoint for create_quote_new function"""
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        quote_type = data.get('quote_type')
        
        if not symbol or not quote_type:
            return jsonify({"error": "Missing symbol or quote_type"}), 400
        
        quote_result = create_quote_new(symbol, quote_type)
        
        if quote_result is None:
            return jsonify({"error": "Failed to create quote"}), 500
        
        return jsonify(quote_result), 200
        
    except Exception as e:
        print(f"Error in create_quote_new_endpoint: {e}")
        return jsonify({"error": str(e)}), 500

def send_slack_notification(transaction_data: Dict) -> bool:
    """Send transaction completion notification to Slack"""
    print(f"=== SLACK NOTIFICATION ATTEMPT ===")
    print(f"Transaction data: {json.dumps(transaction_data, indent=2)}")
    print(f"Slack webhook URL configured: {bool(SLACK_WEBHOOK_URL)}")
    
    if not SLACK_WEBHOOK_URL:
        print("ERROR: No Slack webhook URL configured, skipping notification")
        return False
        
    try:
        slack_payload = {
            "text": "🎓 New Tuition Payment Transaction Completed",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "🎓 Tuition Payment Transaction"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Student:* {transaction_data.get('student_full_name', 'N/A')}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*School:* {transaction_data.get('School', 'N/A')}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Payee:* {transaction_data.get('payee_name', 'N/A')}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Student ID:* {transaction_data.get('student_id', 'N/A')}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Term:* {transaction_data.get('term', 'N/A')}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Transaction ID:* {transaction_data.get('transaction_id', 'N/A')}"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Mailing Address:*\n{transaction_data.get('mailing_address', 'N/A')}\n{transaction_data.get('city', 'N/A')}, {transaction_data.get('state', 'N/A')} {transaction_data.get('zipcode', 'N/A')}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Delivery Instructions:*\n{transaction_data.get('deliver_instructions', 'N/A')}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Customer ID:* {transaction_data.get('cusomter_id', 'N/A')}\n*Email:* {transaction_data.get('email', 'N/A')}"
                    }
                }
            ]
        }
        
        response = requests.post(
            SLACK_WEBHOOK_URL,
            json=slack_payload,
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        print("Slack notification sent successfully")
        return True
        
    except Exception as e:
        print(f"Error sending Slack notification: {str(e)}")
        return False

def get_customer_wallet_address(customer_id: str) -> Optional[str]:
    """Get the customer's wallet address from UnblockPay API"""
    try:
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{BASE_URL}/customers/{customer_id}/wallets",
            headers=headers
        )
        response.raise_for_status()
        
        wallets = response.json()
        if wallets and len(wallets) > 0:
            # Get the first wallet's address (assuming one wallet per customer)
            wallet_address = wallets[0].get('address')
            print(f"Retrieved wallet address from API: {wallet_address}")
            return wallet_address
        return None
        
    except Exception as e:
        print(f"Error getting customer wallet address: {str(e)}")
        return None

def create_off_ramp_payout(amount: float, quote_id: str, customer_id: str, external_account_id: str) -> Optional[Dict]:
    """Create an off-ramp payout transaction"""
    try:
        print(f"=== CREATING OFF-RAMP PAYOUT ===")
        print(f"Amount: {amount}")
        print(f"Quote ID: {quote_id}")
        print(f"Customer ID: {customer_id}")
        print(f"External Account ID: {external_account_id}")
        
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        # Get customer's wallet_id
        wallet_id = get_customer_wallet_id(customer_id)
        if not wallet_id:
            print("ERROR: No wallet_id found for customer")
            return None
        
        print(f"Using wallet_id: {wallet_id}")


        try:
            wallet_address = get_customer_wallet_address(customer_id)
            create_wallet_transfer(10, "0199d13b-6e91-71cb-afba-30113108e359", "0199d386-a3e2-77ce-8402-877744f4eb1b", wallet_address)
            amount = amount + 10
        except Exception as e:
            print(f"Error getting customer wallet address: {str(e)}")
           
        
        payout_data = {
            "amount": amount,
            "quote_id": quote_id,
            "sender": {
                "currency": "USDC",
                "payment_rail": "solana",
                "wallet_id": wallet_id
            },
            "receiver": {
                "external_account_id": external_account_id
            }
        }
        
        print(f"Payout data: {json.dumps(payout_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/payout",
            headers=headers,
            json=payout_data
        )
        print(f"Payout API response status: {response.status_code}")
        print(f"Payout API response: {response.text}")
        
        response.raise_for_status()
        payout_result = response.json()
        print(f"Successfully created payout: {json.dumps(payout_result, indent=2)}")
        
        return payout_result
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error creating off-ramp payout: {e}")
        print(f"Response content: {e.response.text if e.response else 'No response'}")
        return None
    except Exception as e:
        print(f"Error creating off-ramp payout: {str(e)}")
        return None

# Endpoint to check transaction status
@app.route("/transaction-status/<transaction_id>", methods=["GET"])
def get_transaction_status(transaction_id: str):
    """Get the status of a transaction"""
    try:
        headers = {
            "Authorization": f"Bearer {AUTH_TOKEN}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{BASE_URL}/transactions/{transaction_id}",
            headers=headers
        )
        response.raise_for_status()
        
        transaction = response.json()
        transaction_data = {
            "status": transaction.get("status"),
            "id": transaction.get("id")
        }
        return jsonify({
            'success': True,
            'transaction': transaction_data
        })
    except Exception as e:
        print(f"Error getting transaction status: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to get transaction status: {str(e)}"
        }), 500

@app.route("/webhook/mock", methods=["POST"])
def mock_webhook():
    """Mock webhook endpoint for testing transaction events in sandbox"""
    try:
        data = request.get_json()
        event_type = data.get('event_type')
        transaction_id = data.get('transaction_id')
        
        if not event_type:
            return jsonify({'error': 'event_type is required'}), 400
        
        print(f"Mock webhook triggered: {event_type} for transaction {transaction_id}")
        
        # Create mock webhook event data for frontend
        mock_event = {
            "event": "payin" if "payin" in event_type else "payout",
            "event_id": f"mock-{uuid.uuid4()}",
            "event_type": event_type,
            "event_resource_id": transaction_id or f"mock-transaction-{uuid.uuid4()}",
            "event_resource_status": "completed" if "completed" in event_type else "processing",
            "event_resource": {
                "id": transaction_id or f"mock-transaction-{uuid.uuid4()}",
                "status": "completed" if "completed" in event_type else "processing",
                "amount": 1000,
                "currency": "BRL" if "payin" in event_type else "USD",
                "created_at": datetime.utcnow().isoformat() + "Z",
                "updated_at": datetime.utcnow().isoformat() + "Z"
            },
            "event_created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Create mock webhook payload that matches real UnblockPay format
        webhook_payload = {
            "event_type": event_type,
            "data": {
                "id": transaction_id or f"mock-transaction-{uuid.uuid4()}",
                "customer_id": session.get('customer_id'),
                "amount": 1000 if "payin" in event_type else 181.82,  # Mock amounts
                "currency": "BRL" if "payin" in event_type else "USD",
                "status": "completed" if "completed" in event_type else "processing"
            }
        }
        
        print(f"Calling real webhook handler with mock data: {json.dumps(webhook_payload, indent=2)}")
        
        # Call the real webhook handler with mock data
        with app.test_request_context('/webhook/unblockpay', method='POST', json=webhook_payload):
            result = handle_unblockpay_webhook()
            print(f"Mock webhook result: {result}")
        
        return jsonify({
            'success': True,
            'message': f'Mock webhook {event_type} processed successfully',
            'event': mock_event
        })
        
    except Exception as e:
        print(f"Error processing mock webhook: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/trigger-mock-webhook", methods=["POST"])
def trigger_mock_webhook():
    """API endpoint to trigger mock webhook events from frontend"""
    try:
        data = request.get_json()
        event_type = data.get('event_type', 'payin.completed')
        transaction_id = data.get('transaction_id')
        
        print(f"Triggering mock webhook: {event_type} for transaction: {transaction_id}")
        
        # Create mock webhook event data
        mock_event = {
            "event": "unblockpay.webhook",
            "event_id": f"evt_{transaction_id or 'mock'}",
            "event_type": event_type,
            "event_resource_id": transaction_id or "mock_transaction_id",
            "event_resource_status": "completed" if "completed" in event_type else "processing",
            "event_resource": {
                "id": transaction_id or "mock_transaction_id",
                "status": "completed" if "completed" in event_type else "processing",
                "amount": 98000.94,
                "currency": "BRL" if event_type == "payin.completed" else "USD",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            "event_created_at": datetime.now().isoformat()
        }
        
        print(f"Mock webhook event created: {mock_event}")
        
        # Create webhook payload that matches UnblockPay format
        webhook_payload = {
            "event_type": event_type,
            "data": {
                "id": transaction_id or "mock_transaction_id",
                "customer_id": session.get('customer_id'),
                "amount": 1000 if event_type == "payin.completed" else 181.82,
                "currency": "BRL" if event_type == "payin.completed" else "USD",
                "status": "completed" if "completed" in event_type else "processing"
            }
        }
        
        print(f"Calling real webhook handler with payload: {json.dumps(webhook_payload, indent=2)}")
        
        # Call the real webhook handler
        try:
            with app.test_request_context('/webhook/unblockpay', method='POST', json=webhook_payload):
                print("About to call handle_unblockpay_webhook()")
                webhook_result = handle_unblockpay_webhook()
                print(f"Webhook handler result: {webhook_result}")
                print(f"Webhook handler completed successfully")
        except Exception as e:
            print(f"ERROR calling webhook handler: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return jsonify({
            'success': True,
            'event': mock_event,
            'message': f'Mock webhook {event_type} triggered successfully',
            'webhook_processed': True
        })
        
    except Exception as e:
        print(f"Error triggering mock webhook: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/setup-webhook", methods=["POST"])
def setup_webhook():
    """Setup webhook configuration with UnblockPay"""
    try:
        data = request.get_json()
        webhook_url = data.get('webhook_url')
        
        if not webhook_url:
            return jsonify({'error': 'webhook_url is required'}), 400
        
        # Configure webhook with UnblockPay
        headers = {
            "Authorization": f"Bearer {AUTH_TOKEN}",
            "Content-Type": "application/json"
        }
        
        webhook_config = {
            "enabled": True,
            "subscriptions": [
                "payin.completed", 
                "payout.completed",
                "payin.processing",
                "payout.processing"
            ],
            "url": webhook_url
        }
        
        print(f"Setting up webhook with URL: {webhook_url}")
        print(f"Webhook config: {webhook_config}")
        
        response = requests.post(
            f"{BASE_URL}/webhooks",
            headers=headers,
            json=webhook_config
        )
        
        if response.status_code == 201 or response.status_code == 200:
            webhook_data = response.json()
            print(f"Webhook setup successful: {webhook_data}")
            
            return jsonify({
                'success': True,
                'webhook': webhook_data,
                'message': 'Webhook configured successfully'
            })
        else:
            error_data = response.json() if response.content else {'error': 'Unknown error'}
            print(f"Webhook setup failed: {response.status_code} - {error_data}")
            return jsonify({
                'success': False,
                'error': f"Failed to setup webhook: {error_data}"
            }), response.status_code
            
    except Exception as e:
        print(f"Error setting up webhook: {e}")
        return jsonify({'error': str(e)}), 500

def check_existing_external_account(routing_number: str, account_number: str) -> Optional[str]:
    """
    Check if an external account with the given routing and account number already exists.
    Returns the external account ID if found, None otherwise.
    """
    try:
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json"
        }
        
        # Get all external accounts
        response = requests.get(f"{BASE_URL}/external-accounts", headers=headers)
        response.raise_for_status()
        external_accounts = response.json()
        
        print(f"🔍 Checking {len(external_accounts)} external accounts for routing: {routing_number}, account: {account_number}")
        
        # Search through all external accounts for matching routing and account number
        for account in external_accounts:
            existing_routing = account.get("routing_number")
            existing_account_number = account.get("bank_account_number")
            
            if existing_routing == routing_number and existing_account_number == account_number:
                account_id = account.get("id")
                print(f"✅ Found matching external account: {account_id}")
                return account_id
        
        print(f"❌ No external account found with routing: {routing_number}, account: {account_number}")
        return None
        
    except requests.RequestException as e:
        print(f"❌ Error fetching external accounts: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"❌ Response: {e.response.text}")
        raise
    except Exception as e:
        print(f"❌ Error checking external accounts: {str(e)}")
        raise

@app.route("/api/check-external-account", methods=["POST", "OPTIONS"])
def check_external_account_endpoint():
    """Check if an external account exists with given routing and account number"""
    if request.method == "OPTIONS":
        return "", 200
    
    try:
        data = request.get_json()
        routing_number = data.get('routing_number')
        account_number = data.get('account_number')
        
        if not routing_number or not account_number:
            return jsonify({"error": "routing_number and account_number are required"}), 400
        
        existing_account_id = check_existing_external_account(routing_number, account_number)
        
        if existing_account_id:
            return jsonify({
                "account_exists": True,
                "external_account_id": existing_account_id,
                "message": f"External account found with routing: {routing_number}, account: {account_number}"
            }), 200
        else:
            return jsonify({
                "account_exists": False,
                "message": f"No external account found with routing: {routing_number}, account: {account_number}"
            }), 200
            
    except Exception as e:
        error_msg = f"Error checking external account: {str(e)}"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 500

if __name__ == "__main__":
    print(f"Starting Flask app on host: {HOST}, port: {PORT}")
    print(f"Debug mode: {FLASK_DEBUG}")
    app.run(debug=FLASK_DEBUG, host='0.0.0.0', port=PORT)