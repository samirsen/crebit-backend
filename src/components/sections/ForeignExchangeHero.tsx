import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getApiUrl, API_CONFIG } from '@/config/api'
import topBackground from "@/assets/topBackground.png"
import crebitLogo from "@/assets/crebit.png"
import wiseLogo from "@/assets/wise.png"
import remitlyLogo from "@/assets/flywire.png"
import brazilFlag from "@/assets/Brazil.png"
import usFlag from "@/assets/UnitedStates.png"
import mexicoFlag from "@/assets/Mexico.png"
import reloadIcon from "@/assets/reload.png"
import transferButton from "@/assets/transfer.png"
import frogOnCoinWhite from "@/assets/frogOnCoinWhite.png"

const ForeignExchangeHero: React.FC = () => {
  const [sendAmount, setSendAmount] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [sendPlaceholder, setSendPlaceholder] = useState("1000")
  const [receivePlaceholder, setReceivePlaceholder] = useState("1")
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("brazil")
  const [showUnsupportedMessage, setShowUnsupportedMessage] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState("crebit")
  const [isReversed, setIsReversed] = useState(false) // Track if currencies are swapped
  const [sendCurrency, setSendCurrency] = useState("BRL") // Send currency
  const [receiveCurrency, setReceiveCurrency] = useState("USD") // Receive currency
  const [providers, setProviders] = useState({
    crebit: { 
      brazil: { rate: 5.36, fee: "$0", time: "<1 hr Business Day" },
      mexico: { rate: 18.45, fee: "$0", time: "<1 hr Business Day" }
    },
    wise: { 
      brazil: { rate: 5.64, fee: "$15-20", time: "1-3 Business Days" },
      mexico: { rate: 19.28, fee: "$15-20", time: "1-3 Business Days" }
    },
    remitly: { 
      brazil: { rate: 5.88, fee: "$20-35", time: "2-5 Business Days" },
      mexico: { rate: 19.5, fee: "$20-35", time: "2-5 Business Days" }
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch rates on component mount and calculate initial 1 BRL conversion
  useEffect(() => {
    console.log('ForeignExchangeHero component mounted, fetching rates...')
    fetchExchangeRates()
  }, [])

  // Update placeholders when rates are loaded
  useEffect(() => {
    if (providers.crebit.brazil.rate > 0) {
      // Set placeholders only, keep inputs empty for true placeholder behavior
      const brlAmount = (1 * providers.crebit.brazil.rate).toFixed(2)
      setSendPlaceholder(brlAmount)
      setReceivePlaceholder("1.00")
      console.log('Placeholders updated - BRL:', brlAmount, 'USD: 1.00')
    }
  }, [providers.crebit.brazil.rate])

  // Debug effect to track state changes
  useEffect(() => {
    console.log('State changed - sendAmount:', sendAmount, 'receiveAmount:', receiveAmount, 'userHasInteracted:', userHasInteracted)
  }, [sendAmount, receiveAmount, userHasInteracted])

  const currentRate = providers[selectedProvider as keyof typeof providers][selectedCountry as keyof typeof providers.crebit].rate
  const currentCurrency = isReversed ? 'USD' : (selectedCountry === 'brazil' ? 'BRL' : 'MXN')
  const currentSymbol = isReversed ? '$' : (selectedCountry === 'brazil' ? 'R$' : '$')
  const receiveCurrencyDisplay = isReversed ? (selectedCountry === 'brazil' ? 'BRL' : 'MXN') : 'USD'
  const receiveSymbolDisplay = isReversed ? (selectedCountry === 'brazil' ? 'R$' : '$') : '$'

  // Get quote from new API endpoint using create_quote_new
  const getQuoteNew = async (symbol: string, quoteType: string) => {
    try {
      console.log(`Making API call for ${symbol} with type ${quoteType}`)
      const response = await fetch(getApiUrl('/api/create-quote-new'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          symbol,
          quote_type: quoteType
        })
      })
      
      console.log(`Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to get quote')
      }
      
      const quoteData = await response.json()
      console.log('Quote data received:', quoteData)
      return quoteData
    } catch (err) {
      console.error('getQuoteNew error:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to get quote')
    }
  }

  // Get quote from UnblockPay API - using production API (legacy)
  const getQuote = async (symbol: string, amount_usd: number) => {
    try {
      console.log(`Making API call to ${getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE)} for ${symbol} with amount ${amount_usd}`)
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          symbol,
          amount_usd
        })
      })
      
      console.log(`Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to get quote')
      }
      
      const quoteData = await response.json()
      console.log('Quote data received:', quoteData)
      return quoteData
    } catch (err) {
      console.error('getQuote error:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to get quote')
    }
  }

  // Function to fetch real exchange rates using create_quote_new
  const fetchExchangeRates = async () => {
    console.log('fetchExchangeRates called')
    setIsLoading(true)
    try {
      if (isReversed) {
        // When reversed, we're converting USD to BRL/MXN 
        console.log('Fetching reversed rates (USD to local currency)...')
        
        if (selectedCountry === 'brazil') {
          const brlQuote = await getQuoteNew("USDC/BRL", "off_ramp")
          console.log('USD to BRL quote received:', brlQuote)
          const usdToBrl = parseFloat(brlQuote.quotation)
          
          setProviders(prev => ({
            ...prev,
            crebit: { 
              ...prev.crebit,
              brazil: { rate: usdToBrl, fee: "$0", time: "<1 hr Business Day" }
            },
            wise: { 
              ...prev.wise,
              brazil: { rate: 5.64, fee: "$15-20", time: "1-3 Business Days" }
            },
            remitly: { 
              ...prev.remitly,
              brazil: { rate: 5.88, fee: "$20-35", time: "2-5 Business Days" }
            }
          }))
        } else {
          // Mexico or other unsupported combinations
          setShowUnsupportedMessage(true)
          setTimeout(() => setShowUnsupportedMessage(false), 3000)
          return
        }
      } else {
        // Normal direction - BRL/MXN to USD using create_quote_new
        console.log('About to fetch BRL quote using create_quote_new...')
        const brlQuote = await getQuoteNew("USDC/BRL", "on_ramp")
        console.log('BRL quote received:', brlQuote)
        const usdToBrl = parseFloat(brlQuote.quotation)

        console.log('About to fetch MXN quote using create_quote_new...')
        const mxnQuote = await getQuoteNew("USDC/MXN", "on_ramp")
        console.log('MXN quote received:', mxnQuote)
        const usdToMxn = parseFloat(mxnQuote.quotation)

        console.log('Updating providers with rates - BRL:', usdToBrl, 'MXN:', usdToMxn)
        setProviders({
          crebit: { 
            brazil: { rate: usdToBrl, fee: "$0", time: "<1 hr Business Day" },
            mexico: { rate: usdToMxn, fee: "$0", time: "<1 hr Business Day" }
          },
          wise: { 
            brazil: { rate: 5.83, fee: "$15-20", time: "1-3 Business Days" },
            mexico: { rate: 19.28, fee: "$15-20", time: "1-3 Business Days" }
          },
          remitly: { 
            brazil: { rate: 6.01, fee: "$20-35", time: "2-5 Business Days" },
            mexico: { rate: 19.5, fee: "$20-35", time: "2-5 Business Days" }
          }
        })
      }

      // Recalculate amounts with new rates only if user has entered a value
      const numValue = parseFloat(sendAmount) || 0
      const currentRateValue = providers[selectedProvider as keyof typeof providers][selectedCountry as keyof typeof providers.crebit].rate
      const adjustedRate = currentRateValue * (selectedProvider === 'crebit' ? 1.0 : selectedProvider === 'wise' ? 1.02 : 1.05)
      
      if (numValue > 0) {
        if (isReversed) {
          // USD to local currency
          setReceiveAmount((numValue * adjustedRate).toFixed(2))
        } else {
          // Local currency to USD
          setReceiveAmount((numValue / adjustedRate).toFixed(2))
        }
      }

      console.log('Exchange rates updated successfully')
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      // Fallback to static rates if API fails
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendAmountChange = (value: string) => {
    setUserHasInteracted(true)
    setSendAmount(value)
    const numValue = parseFloat(value) || 0
    if (numValue > 0) {
      // For BRL to USD: divide BRL amount by the USD to BRL rate
      const calculatedUSD = numValue / currentRate
      setReceiveAmount(calculatedUSD.toFixed(2))
    } else {
      setReceiveAmount("")
    }
  }

  const handleReceiveAmountChange = (value: string) => {
    setUserHasInteracted(true)
    setReceiveAmount(value)
    const numValue = parseFloat(value) || 0
    if (numValue > 0) {
      // For USD to BRL: multiply USD amount by the USD to BRL rate
      setSendAmount((numValue * currentRate).toFixed(2))
    } else {
      setSendAmount("")
    }
  }

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider)
    // Recalculate with new rate
    const numValue = parseFloat(sendAmount) || 0
    const newRate = providers[provider as keyof typeof providers][selectedCountry as keyof typeof providers.crebit].rate
    if (numValue > 0) {
      // For BRL to USD: divide BRL amount by the USD to BRL rate
      const calculatedUSD = numValue / newRate
      setReceiveAmount(calculatedUSD.toFixed(2))
    }
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    // When switching countries, maintain the USD amount and recalculate the local currency
    const usdValue = parseFloat(receiveAmount) || 0
    const newRate = providers[selectedProvider as keyof typeof providers][country as keyof typeof providers.crebit].rate
    
    if (usdValue > 0) {
      // Calculate the new local currency amount: USD * (USD to local rate)
      const newLocalAmount = (usdValue * newRate).toFixed(2)
      setSendAmount(newLocalAmount)
    }
  }

  const handleSwapCurrencies = () => {
    console.log('Swap currencies clicked')
    
    // Check if we're currently in BRL->USD mode and trying to swap to USD->BRL
    if (!isReversed && selectedCountry === 'brazil') {
      // This is supported - USD to BRL using USDC/BRL off-ramp
      setIsReversed(true)
      setSendAmount("")
      setReceiveAmount("")
      setUserHasInteracted(false)
      fetchExchangeRates()
    } else if (isReversed && selectedCountry === 'brazil') {
      // Going back to BRL to USD
      setIsReversed(false)
      setSendAmount("")
      setReceiveAmount("")
      setUserHasInteracted(false)
      fetchExchangeRates()
    } else {
      // Mexico or other unsupported combinations
      setShowUnsupportedMessage(true)
      setTimeout(() => setShowUnsupportedMessage(false), 3000)
    }
  }

  const handleReloadRates = () => {
    // Fetch fresh rates from API
    fetchExchangeRates()
  }

  return (
    <section className="pt-2 px-2 sm:px-4 lg:px-16 foreign-exchange-hero">
      <div className="bg-[#0C3E3F] rounded-2xl sm:rounded-3xl pt-3 pb-6 px-1 sm:px-4 lg:px-2 min-h-[480px] sm:min-h-[580px] lg:min-h-[900px] xl:min-h-[550px] hero-container">
        <div className="grid xl:grid-cols-2 gap-6 xl:gap-0 items-center h-full">
          
          {/* Left Side - Text Content */}
          <div className="order-1 xl:order-1 flex flex-col items-center justify-center pt-4 sm:pt-8 xl:pt-0 px-1 sm:px-4 xl:px-8 h-full" style={{transform: 'translateY(0%)'}}>
            {/* Main Headline - 2 lines with moderate spacing */}
            <div 
              className="text-center w-full max-w-2xl"
              style={{
                marginBottom: '32px'
              }}
            >
              <h1 
                className="text-center mb-6"
                style={{
                  fontFamily: "'Satoshi Variable', sans-serif",
                  fontSize: 'clamp(32px, 4.5vw, 70px)',
                  lineHeight: '100%',
                  letterSpacing: '-2.8px',
                  marginBottom: '8px'
                }}
              >
                {/* First Line - Fastest and Cheapest with moderate spacing */}
                <div>
                  <span 
                    style={{
                      color: '#FFEC7D',
                      textAlign: 'center',
                      fontFamily: "'Satoshi Variable', sans-serif",
                      fontSize: 'clamp(32px, 4.5vw, 70px)',
                      fontStyle: 'italic',
                      fontWeight: 900,
                      lineHeight: '100%',
                      letterSpacing: '-2.8px'
                    }}
                  >
                    Fastest
                  </span>
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: "'Satoshi Variable', sans-serif",
                      fontSize: 'clamp(20px, 3vw, 70px)',
                      fontStyle: 'normal',
                      fontWeight: 700,
                      lineHeight: '100%',
                      letterSpacing: '-2.8px',
                      marginLeft: '12px',
                      marginRight: '8px'
                    }}
                  >
                and
                  </span>
                  <span 
                    style={{
                      color: '#FFEC7D',
                      textAlign: 'center',
                      fontFamily: "'Satoshi Variable', sans-serif",
                      fontSize: 'clamp(32px, 4.5vw, 70px)',
                      fontStyle: 'italic',
                      fontWeight: 900,
                      lineHeight: '100%',
                      letterSpacing: '-2.8px'
                    }}
                  >
                Cheapest
                  </span>
                </div>
                
                {/* Second Line */}
                <div>
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: "'Satoshi Variable', sans-serif",
                      fontSize: 'clamp(32px, 5.5vw, 70px)',
                      fontStyle: 'normal',
                      fontWeight: 700,
                      lineHeight: '100%',
                      letterSpacing: '-2.8px'
                    }}
                  >
                    Foreign Exchange
                  </span>
                </div>
              </h1>
            </div>
            
            {/* Subtitle - moved above ratings image */}
            <p 
              style={{
                color: '#FFF',
                fontFamily: '"Satoshi Variable", "Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: 'clamp(12px, 3vw, 20px)',
                fontStyle: 'italic',
                fontWeight: 700,
                lineHeight: 'normal',
                letterSpacing: '-0.8px',
                textAlign: 'center',
                marginBottom: '24px'
              }}
            >
              Used by international students at 45+ universities in the U.S.
            </p>

            {/* Frog on Coin Image - Desktop Only (when side-by-side) */}
            <div className="hidden xl:flex justify-center mb-6">
              <img 
                src={frogOnCoinWhite} 
                alt="Frog on coin" 
                className="w-40 h-40 2xl:w-48 2xl:h-48 object-contain"
              />
            </div>
              
            
            
            {/* CTA Button - Positioned underneath the text */}
            <div className="flex justify-center w-full">
              <a 
                href="/country-selection" 
                className="inline-flex justify-center items-center flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity text-[#003233] font-bold mx-auto"
                style={{
                  width: 'clamp(260px, 45vw, 520px)',
                  height: 'clamp(56px, 10vw, 86px)',
                  padding: 'clamp(12px, 2vw, 20px) clamp(24px, 4vw, 40px)',
                  borderRadius: '20px',
                  background: 'radial-gradient(50% 50% at 50% 50%, #FFF6BF 0%, #FFEC7D 100%)',
                  boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                  fontFamily: "'Obviously', sans-serif",
                  fontWeight: '900',
                  fontSize: 'clamp(16px, 3.5vw, 20px)',
                  textAlign: 'center'
                }}
              >
                CONVERT CURRENCY
              </a>
            </div>
          </div>

          {/* Right Side - Exchange Rate Calculator */}
          <div className="order-2 xl:order-2 flex items-center justify-center h-full" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", transform: 'translateY(-2%)'}}>
            <div className="max-w-3xl w-full transform scale-[0.85] sm:scale-[0.92] xl:scale-[0.9] calculator-card">
            <Card className="bg-[#003233] text-gray-900 p-3 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border-[6px] sm:border-[14px] lg:border-[20px] border-[#003233]" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>
              <div className="space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-center relative">
                  <h3 className="text-lg sm:text-2xl lg:text-4xl font-bold text-white" style={{fontFamily: "'Obviously', sans-serif", fontWeight: '900'}}>Live Exchange Rate</h3>
                  <button 
                    onClick={handleReloadRates}
                    className="absolute -top-6 -right-6 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    title="Refresh exchange rates"
                  >
                    <img src={reloadIcon} alt="Reload" className="w-8 h-8" />
                  </button>
                </div>
                


                {/* Hint Section - Shows on hover */}
                {showHint && (
                  <div className="text-center py-3 mb-3 bg-[#FFEC7D]/20 rounded-xl border border-[#FFEC7D]/50 transition-all duration-200">
                    <p className="text-sm font-medium text-white" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                      Click on any amount below to start calculating your exchange
                    </p>
                    <p className="text-xs text-white/80 mt-1" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                      Example: Type {currentSymbol}5,400 to send or {receiveSymbolDisplay}1,000 to receive
                    </p>
                  </div>
                )}

                {/* Input Section with Dark Teal Background */}
                <div 
                  className="bg-[#003233] rounded-3xl p-6 relative"
                  onMouseEnter={() => setShowHint(false)}
                  onMouseLeave={() => setShowHint(false)}
                >
                  {/* YOU SEND Input */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 flex flex-col justify-center h-[120px] sm:h-[160px] md:h-[130px] input-card" style={{padding: '12px'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>YOU SEND</span>
                      <div className="flex items-center gap-3" style={{transform: 'translate(5px, 5px)'}}>
                        <Select value={isReversed ? 'usa' : selectedCountry} onValueChange={(value) => {
                          if (!isReversed) {
                            handleCountryChange(value)
                          } else {
                            // When reversed, only USD is available as send currency
                            // This dropdown is just for display consistency
                          }
                        }}>
                          <SelectTrigger className="inline-flex px-3 py-2 justify-center items-center gap-2 rounded-[31px] bg-[#F7F7F7] border-0 shadow-none focus:ring-0 h-auto text-[#111111]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <img src={isReversed ? usFlag : (selectedCountry === 'brazil' ? brazilFlag : mexicoFlag)} alt={isReversed ? 'United States' : (selectedCountry === 'brazil' ? 'Brazil' : 'Mexico')} className="w-8 h-8 rounded-full object-cover" />
                                <span className="text-lg font-bold text-[#111111]" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>{currentCurrency}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                            {isReversed ? (
                              <SelectItem value="usa">
                                <div className="flex items-center gap-3">
                                  <img src={usFlag} alt="United States" className="w-6 h-6 rounded-full object-cover" />
                                  <span className="text-sm font-semibold text-gray-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>USD</span>
                                </div>
                              </SelectItem>
                            ) : (
                              <>
                                <SelectItem value="brazil">
                                  <div className="flex items-center gap-3">
                                    <img src={brazilFlag} alt="Brazil" className="w-6 h-6 rounded-full object-cover" />
                                    <span className="text-sm font-semibold text-gray-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>BRL</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="mexico">
                                  <div className="flex items-center gap-3">
                                    <img src={mexicoFlag} alt="Mexico" className="w-6 h-6 rounded-full object-cover" />
                                    <span className="text-sm font-semibold text-gray-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>MXN</span>
                                  </div>
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-black input-text" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>{currentSymbol}</span>
                      <Input
                        id="sendAmountInput"
                        type="text"
                        value={sendAmount}
                        onChange={(e) => handleSendAmountChange(e.target.value)}
                        className="text-2xl sm:text-4xl md:text-5xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus:ring-0 focus:border-0 focus:outline-none focus:shadow-none flex-1 cursor-text placeholder:text-[#C9C9C9] input-text"
                        style={{ 
                          border: 'none', 
                          boxShadow: 'none', 
                          fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                          color: (userHasInteracted && sendAmount) ? '#000000' : '#C9C9C9'
                        }}
                        placeholder={sendPlaceholder}
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <button 
                      onClick={handleSwapCurrencies}
                      className="bg-white border-2 sm:border-4 border-[#003233] rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow swap-button"
                    >
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-[#003233] swap-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>

                  {/* Unsupported Message */}
                  {showUnsupportedMessage && (
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
                      {selectedCountry === 'mexico' ? 'USD to MXN not currently supported' : 'Feature not currently live'}
                    </div>
                  )}

                  {/* YOU RECEIVE Input */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl flex flex-col justify-center h-[120px] sm:h-[160px] md:h-[130px] input-card" style={{padding: '12px'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>YOU RECEIVE</span>
                      <div className="flex items-center gap-3" style={{transform: 'translate(5px, 5px)'}}>
                        <Select value={isReversed ? selectedCountry : 'usa'} onValueChange={(value) => {
                          if (isReversed) {
                            handleCountryChange(value)
                          } else {
                            // When not reversed, only USD is available as receive currency
                            // This dropdown is just for display consistency
                          }
                        }}>
                          <SelectTrigger className="inline-flex px-3 py-2 justify-center items-center gap-2 rounded-[31px] bg-[#F7F7F7] border-0 shadow-none focus:ring-0 h-auto text-[#111111]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <img src={isReversed ? (selectedCountry === 'brazil' ? brazilFlag : mexicoFlag) : usFlag} alt={isReversed ? (selectedCountry === 'brazil' ? 'Brazil' : 'Mexico') : 'United States'} className="w-8 h-8 rounded-full object-cover" />
                                <span className="text-lg font-bold text-[#111111]" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>{receiveCurrencyDisplay}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                            {isReversed ? (
                              <>
                                <SelectItem value="brazil">
                                  <div className="flex items-center gap-3">
                                    <img src={brazilFlag} alt="Brazil" className="w-6 h-6 rounded-full object-cover" />
                                    <span className="text-sm font-semibold text-gray-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>BRL</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="mexico">
                                  <div className="flex items-center gap-3">
                                    <img src={mexicoFlag} alt="Mexico" className="w-6 h-6 rounded-full object-cover" />
                                    <span className="text-sm font-semibold text-gray-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>MXN</span>
                                  </div>
                                </SelectItem>
                              </>
                            ) : (
                              <SelectItem value="usa">
                                <div className="flex items-center gap-3">
                                  <img src={usFlag} alt="United States" className="w-6 h-6 rounded-full object-cover" />
                                  <span className="text-sm font-semibold text-gray-800" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>USD</span>
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-black input-text" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>{receiveSymbolDisplay}</span>
                        <Input
                          id="receiveAmountInput"
                          type="text"
                          value={receiveAmount}
                          onChange={(e) => handleReceiveAmountChange(e.target.value)}
                          className="text-2xl sm:text-4xl md:text-5xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus:ring-0 focus:border-0 focus:outline-none focus:shadow-none flex-1 cursor-text placeholder:text-[#C9C9C9] input-text"
                          style={{ 
                            border: 'none', 
                            boxShadow: 'none', 
                            fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                            color: (userHasInteracted && receiveAmount) ? '#000000' : '#C9C9C9'
                          }}
                          placeholder={receivePlaceholder}
                        />
                      </div>
                      <div className="text-right hidden md:block">
                        <span className="text-2xl font-bold text-[#0C3E3F] italic" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>Best Rate</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Best Rate Text */}
                <div className="block md:hidden text-center mb-4">
                  <span className="text-2xl font-bold text-white italic" style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>Best Rate</span>
                </div>

                {/* Comparison Cards */}
                <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
                  <Card 
                    className={`flex flex-col items-center gap-[14px] rounded-lg cursor-pointer transition-all ${
                      selectedProvider === 'crebit' 
                        ? 'border-[0.75px] border-white/45' 
                        : 'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 p-4'
                    }`}
                    style={selectedProvider === 'crebit' ? {
                      padding: '13px 15px 18px 14px',
                      background: 'rgba(255, 255, 255, 0.27)',
                      backdropFilter: 'blur(6px)'
                    } : {}}
                    onClick={() => handleProviderSelect('crebit')}
                  >
                    <div className="text-center space-y-2">
                      {selectedProvider === 'crebit' ? (
                        <>
                          <div 
                            style={{
                              color: '#FFEC7D',
                              fontFamily: "'Obviously', sans-serif",
                              fontWeight: '900',
                              fontSize: '16px',
                              letterSpacing: '-1.28px'
                            }}
                          >
                            Crebit
                          </div>
                          <div 
                            style={{
                              color: '#FFEC7D',
                              textAlign: 'center',
                              fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '16px',
                              fontWeight: '900',
                              letterSpacing: '-0.32px'
                            }}
                          >
                            {(providers.crebit[selectedCountry as keyof typeof providers.crebit]?.rate || 0).toFixed(2)} {currentCurrency} = 1 USD
                          </div>
                          <div 
                            style={{
                              color: '#FFEC7D',
                              textAlign: 'center',
                              fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '14px',
                              fontWeight: '500',
                              letterSpacing: '-0.26px'
                            }}
                          >
                            Transfer Fee: {providers.crebit[selectedCountry as keyof typeof providers.crebit].fee}
                          </div>
                          <div 
                            style={{
                              color: '#FFEC7D',
                              textAlign: 'center',
                              fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '14px',
                              fontWeight: '500',
                              letterSpacing: '-0.26px'
                            }}
                          >
                            {providers.crebit[selectedCountry as keyof typeof providers.crebit].time}
                          </div>
                        </>
                      ) : (
                        <>
                          <div 
                            style={{
                              color: '#003233',
                              fontFamily: "'Obviously', sans-serif",
                              fontWeight: '900',
                              fontSize: '16px',
                              letterSpacing: '-1.28px'
                            }}
                          >
                            Crebit
                          </div>
                          <div 
                            style={{
                              color: '#003233',
                              textAlign: 'center',
                              fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '16px',
                              fontWeight: '900',
                              letterSpacing: '-0.32px'
                            }}
                          >
                            {providers.crebit[selectedCountry as keyof typeof providers.crebit].rate.toFixed(2)} {currentCurrency} = 1 USD
                          </div>
                          <div 
                            style={{
                              color: '#003233',
                              textAlign: 'center',
                              fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '14px',
                              fontWeight: '500',
                              letterSpacing: '-0.26px'
                            }}
                          >
                            Transfer Fee: {providers.crebit[selectedCountry as keyof typeof providers.crebit].fee}
                          </div>
                          <div 
                            style={{
                              color: '#003233',
                              textAlign: 'center',
                              fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '14px',
                              fontWeight: '500',
                              letterSpacing: '-0.26px'
                            }}
                          >
                            {providers.crebit[selectedCountry as keyof typeof providers.crebit].time}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                  
                  <Card 
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedProvider === 'wise' 
                        ? 'bg-[#E1F1F1] border-2 border-[#C3DEDE]' 
                        : 'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={() => handleProviderSelect('wise')}
                  >
                    <div className="text-center space-y-2">
                      <img src={wiseLogo} alt="Wise" className="h-6 mx-auto" />
                      <div className={`text-sm font-semibold ${
                        selectedProvider === 'wise' ? 'text-teal-700' : 'text-gray-700'
                      }`} style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>{(providers.wise[selectedCountry as keyof typeof providers.wise]?.rate || 0).toFixed(2)} {currentCurrency} = 1 USD</div>
                      <div className={`text-sm ${
                        selectedProvider === 'wise' ? 'text-teal-600' : 'text-gray-600'
                      }`} style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>Transfer Fee: $15-20</div>
                      <div className={`text-sm ${
                        selectedProvider === 'wise' ? 'text-teal-600' : 'text-gray-600'
                      }`} style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>1-3 Business Days</div>
                    </div>
                  </Card>
                  
                  <Card 
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedProvider === 'remitly' 
                        ? 'bg-[#E1F1F1] border-2 border-[#C3DEDE]' 
                        : 'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={() => handleProviderSelect('remitly')}
                  >
                    <div className="text-center space-y-2">
                      <img src={remitlyLogo} alt="Remitly" className="h-6 mx-auto" />
                      <div className={`text-sm font-semibold ${
                        selectedProvider === 'remitly' ? 'text-teal-700' : 'text-gray-700'
                      }`} style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>{(providers.remitly[selectedCountry as keyof typeof providers.remitly]?.rate || 0).toFixed(2)} {currentCurrency} = 1 USD</div>
                      <div className={`text-sm ${
                        selectedProvider === 'remitly' ? 'text-teal-600' : 'text-gray-600'
                      }`} style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>Transfer Fee: $20-35</div>
                      <div className={`text-sm ${
                        selectedProvider === 'remitly' ? 'text-teal-600' : 'text-gray-600'
                      }`} style={{fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"}}>2-5 Business Days</div>
                    </div>
                  </Card>
                </div>

              </div>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForeignExchangeHero