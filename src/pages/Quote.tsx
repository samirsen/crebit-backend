import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { getApiUrl, API_CONFIG } from '@/config/api';
import { ArrowLeft } from "lucide-react"

// Icon components
const DiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const BrazilFlagIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 16" fill="none">
    <rect width="24" height="16" fill="#009639"/>
    <path d="M12 2L20 8L12 14L4 8L12 2Z" fill="#FEDF00"/>
    <circle cx="12" cy="8" r="3.5" fill="#002776"/>
    <path d="M9.5 8C9.5 6.62 10.62 5.5 12 5.5C13.38 5.5 14.5 6.62 14.5 8" stroke="#FEDF00" strokeWidth="0.5" fill="none"/>
  </svg>
);

const MexicoFlagIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 16" fill="none">
    <rect width="8" height="16" fill="#006847"/>
    <rect x="8" width="8" height="16" fill="#FFFFFF"/>
    <rect x="16" width="8" height="16" fill="#CE1126"/>
    <circle cx="12" cy="8" r="2" fill="#8B4513"/>
  </svg>
);

interface SingleQuote {
  id: string
  quotation: string | number
  flat_fee: number
  expires_at: number
  symbol: string
  type: string
}

interface QuoteData {
  on_ramp: SingleQuote
  off_ramp: SingleQuote
  amount_usd: number
  total_local_amount: number
  total_fees_usd: number
  effective_rate: number
  expires_at: number
  expires_at_readable: string
}

interface QuoteTotals {
  totalLocalAmount: number
  amountUSD: number
  exchangeRate: number
  effectiveRate: number
  fxMarkup: number
}

interface SampleQuote {
  amountUSD: number
  exchangeRate: number
  localCurrency: string
  fxMarkup: number
  networkFee: number
  deliveryFee: number
  totalLocalAmount: number
}

const Quote = () => {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = useState("5000")
  const [selectedMethod, setSelectedMethod] = useState<string | null>("pix")
  const [selectedCountry, setSelectedCountry] = useState("BR")
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get quote from UnblockPay API
  const getQuote = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!selectedMethod) {
        throw new Error('Please select a payment method first')
      }
      const symbol = selectedCountry === 'BR' ? "USDC/BRL" : "USDC/MXN"
      const amountUSD = parseFloat(selectedAmount)
      
      if (isNaN(amountUSD) || amountUSD <= 0) {
        throw new Error('Please enter a valid USD amount')
      }
      
      // Get quote with USD amount
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Add this to handle CORS with credentials
        body: JSON.stringify({ 
          symbol,
          amount_usd: amountUSD
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get quote')
      }
      
      const quoteData = await response.json()
      setQuote(quoteData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote')
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals from quote response
  const calculateTotals = (amount: string) => {
    const amountUSD = parseFloat(amount) || 0
    
    if (!quote) {
      return {
        fxMarkup: 0,
        totalLocalAmount: 0,
        amountUSD,
        exchangeRate: 0,
        onRampRate: 0,
        offRampRate: 0,
        effectiveRate: 0
      }
    }
    
    // Get rates from quote
    const onRampRate = parseFloat(quote.on_ramp.quotation.toString())
    const offRampRate = parseFloat(quote.off_ramp.quotation.toString())
    
    return {
      fxMarkup: quote.total_fees_usd,
      totalLocalAmount: quote.total_local_amount,
      amountUSD,
      exchangeRate: quote.effective_rate,
      onRampRate,
      offRampRate,
      effectiveRate: quote.effective_rate
    }
  }

  // Reset quote when method or country changes
  useEffect(() => {
    setQuote(null)
    setError(null)
  }, [selectedMethod, selectedCountry])

  const getSampleQuote = (amount: string, method: string): SampleQuote => {
    const amountUSD = parseFloat(amount)
    
    const exchangeRate = 5.23
    const localCurrency = "BRL"
    const networkFee = 15
    const deliveryFee = 45
    const fxMarkup = amountUSD * 0.02
    
    const totalLocalAmount = (amountUSD * 5.23) + (amountUSD * 0.02 * 5.23) + 15 + (45 * 5.23)
    
    return {
      amountUSD,
      exchangeRate,
      localCurrency,
      fxMarkup,
      networkFee,
      deliveryFee,
      totalLocalAmount
    }
  }

  const sampleQuote = getSampleQuote(selectedAmount, selectedMethod)
  const totals = calculateTotals(selectedAmount)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Arrow Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-white/90 hover:bg-white shadow-lg rounded-full p-3"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
      </div>
      
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Quote Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Live Exchange Rate to US Dollars</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get real-time exchange rates from your local currency to US Dollars for international payments
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Country (Source Currency)
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    // Update payment method based on country
                    setSelectedMethod(e.target.value === 'BR' ? 'pix' : 'spei');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#17484A] focus:border-transparent"
                >
                  <option value="BR">Brazil (BRL to USD)</option>
                  <option value="MX">Mexico (MXN to USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount & Currency
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#17484A] focus:border-transparent"
                  />
                  <select
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#17484A] focus:border-transparent bg-gray-50"
                  >
                    <option value="USD">USD</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How much USD you want to receive
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 invisible">
                  Button
                </label>
                <button
                  onClick={getQuote}
                  disabled={loading || !selectedAmount || parseFloat(selectedAmount) === 0}
                  className="w-full bg-[#17484A] text-white py-2 px-4 rounded-md hover:bg-[#17484A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Getting Quote...' : 'Get Live Rate'}
                </button>
              </div>
            </div>

            {/* Live Quote Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {quote && (
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Live Rate: {selectedCountry === 'BR' ? 'BRL' : 'MXN'} to USD
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Effective Rate:</span>
                        <span className="font-medium">
                          {quote.effective_rate?.toFixed(4)} {selectedCountry === 'BR' ? 'BRL' : 'MXN'} = 1 USD
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">On-Ramp Rate:</span>
                        <span className="text-sm">
                          {parseFloat(quote.on_ramp?.quotation?.toString() || '0').toFixed(4)} {selectedCountry === 'BR' ? 'BRL' : 'MXN'} = 1 USDC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Off-Ramp Rate:</span>
                        <span className="text-sm">
                          1 USDC = {parseFloat(quote.off_ramp?.quotation?.toString() || '0').toFixed(4)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">USD Amount:</span>
                        <span className="font-medium">${parseFloat(selectedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">You need to send:</span>
                        <span className="font-medium text-green-600">
                          {quote.total_local_amount?.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCountry === 'BR' ? 'BRL' : 'MXN'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Fees:</span>
                        <span className="text-sm">${quote.total_fees_usd} USD</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Quote expires at: {quote.expires_at_readable || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rate Comparison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Rate Comparison for US Payments</h3>
              <p className="text-sm text-gray-600 mt-1">Compare costs when sending money to the United States</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Wise</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Exchange Rate:</span>
                      <span>{selectedCountry === 'BR' ? '6.06 BRL' : '19.28 MXN'} = 1 USD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transfer Fee:</span>
                      <span>$15 - $25 USD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Time:</span>
                      <span>1-3 business days</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Flywire</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Exchange Rate:</span>
                      <span>{selectedCountry === 'BR' ? '5.88 BRL' : '19.50 MXN'} = 1 USD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transfer Fee:</span>
                      <span>$20 - $35 USD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Time:</span>
                      <span>2-4 business days</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-[#17484A] bg-[#17484A]/5 rounded-lg">
                  <h4 className="font-medium text-[#17484A] mb-2">Crebit</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Exchange Rate:</span>
                      <span className="text-[#17484A] font-medium">
                        {quote ? 
                          `${quote.effective_rate?.toFixed(2)} ${selectedCountry === 'BR' ? 'BRL' : 'MXN'} = 1 USD` :
                          `${selectedCountry === 'BR' ? '5.12 BRL' : '17.89 MXN'} = 1 USD`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transfer Fee:</span>
                      <span className="text-[#17484A] font-medium">
                        ${quote?.total_fees_usd || '5-15'} USD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Time:</span>
                      <span className="text-[#17484A] font-medium">1 business day</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium text-center">
                  Better rates than any other fiat provider. Find a better rate? Contact us and we'll beat it.
                </p>
              </div>

              {/* Savings Calculation - Only show after quote is generated */}
              {quote && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 text-center">Your Savings with Crebit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Wise Comparison */}
                    <div className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">vs Wise:</span>
                        <span className="text-sm text-green-600 font-medium">
                          {(() => {
                            const wiseRate = selectedCountry === 'BR' ? 6.06 : 19.28;
                            const crebitRate = quote.effective_rate || 0;
                            const inputAmount = parseFloat(selectedAmount) || 0;
                            const wiseFee = 20; // Average Wise fee in USD
                            
                            // Calculate total cost with each provider
                            const wiseTotalLocal = (inputAmount * wiseRate) + (wiseFee * wiseRate);
                            const crebitTotalLocal = quote.total_local_amount || 0;
                            const savings = wiseTotalLocal - crebitTotalLocal;
                            
                            const currency = selectedCountry === 'BR' ? 'BRL' : 'MXN';
                            const locale = selectedCountry === 'BR' ? 'pt-BR' : 'es-MX';
                            
                            return `Save ${savings.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">You save money with Crebit</p>
                    </div>

                    {/* Flywire Comparison */}
                    <div className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">vs Flywire:</span>
                        <span className="text-sm text-green-600 font-medium">
                          {(() => {
                            const flywireRate = selectedCountry === 'BR' ? 5.88 : 19.50;
                            const crebitRate = quote.effective_rate || 0;
                            const inputAmount = parseFloat(selectedAmount) || 0;
                            const flywireFee = 27.5; // Average Flywire fee in USD
                            
                            // Calculate total cost with each provider
                            const flywireTotalLocal = (inputAmount * flywireRate) + (flywireFee * flywireRate);
                            const crebitTotalLocal = quote.total_local_amount || 0;
                            const savings = flywireTotalLocal - crebitTotalLocal;
                            
                            const currency = selectedCountry === 'BR' ? 'BRL' : 'MXN';
                            const locale = selectedCountry === 'BR' ? 'pt-BR' : 'es-MX';
                            
                            return `Save ${savings.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">You save money with Crebit</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-blue-700 font-medium">
                      Choose Crebit and keep more money in your pocket!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ready to Start */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to make your payment?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Click continue to proceed with your payment. You'll be able to review all details before confirming.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#17484A] text-white font-medium rounded-md hover:bg-[#17484A]/90 transition-colors"
            >
              Continue to Payment
            </Link>
          </div>

          
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quote;