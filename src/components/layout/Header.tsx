import { Button } from "@/components/ui/button"
import { useLocation, useNavigate } from "react-router-dom"
import crebitLogo from "@/assets/crebit-logo.png"
import brazilFlag from "@/assets/Brazil.png"
import mexicoFlag from "@/assets/Mexico.png"
import { ChevronDown, Menu, X, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { getApiUrl, API_CONFIG } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'

const Header = () => {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOverWhiteSection, setIsOverWhiteSection] = useState(false)
  const [sendMoneyDropdown, setSendMoneyDropdown] = useState(false)
  const [payTuitionDropdown, setPayTuitionDropdown] = useState(false)
  const [accountsDropdown, setAccountsDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [exchangeRates, setExchangeRates] = useState({ BRL: 5.42, MXN: 18.56 })
  const location = useLocation()
  
  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
  
  // Hide header on specific pages
  const hideHeaderPages = ['/get-started', '/quote']
  const shouldHideHeader = hideHeaderPages.includes(location.pathname)

  // Pages that should always have white navbar
  const alwaysWhitePages = ['/privacy', '/terms']
  const shouldAlwaysBeWhite = alwaysWhitePages.includes(location.pathname)

  // Fetch live exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Fetch BRL rate
        const brlResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            symbol: "USDC/BRL",
            amount_usd: 1
          })
        })
        
        // Fetch MXN rate
        const mxnResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_QUOTE), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            symbol: "USDC/MXN",
            amount_usd: 1
          })
        })
        
        if (brlResponse.ok && mxnResponse.ok) {
          const brlData = await brlResponse.json()
          const mxnData = await mxnResponse.json()
          
          setExchangeRates({
            BRL: brlData.effective_rate || 5.42,
            MXN: mxnData.effective_rate || 18.56
          })
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error)
        // Keep default rates if API fails
      }
    }

    fetchExchangeRates()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're past the hero section (90vh)
      const heroHeight = window.innerHeight * 0.9
      const scrollY = window.scrollY
      
      // If we've scrolled past the hero section, assume we're over white content
      setIsOverWhiteSection(scrollY > heroHeight - 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't render header on specific pages
  if (shouldHideHeader) {
    return null
  }

  return (
    <>
      {/* Yellow banner - only show on home page */}
      {(location.pathname === '/' || location.pathname === '/tuition-payments') && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#FFEC7D] text-black text-center py-2 text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.location.href = '/country-selection'}>
          <span style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
            Lowest fees. Fastest Foreign Exchange. Guaranteed →
          </span>
        </div>
      )}
      
      <header className="relative bg-gray-50 py-4 px-8 mt-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="46" height="61" viewBox="0 0 46 61" fill="none" style={{minWidth: '46px', minHeight: '61px', flexShrink: 0}} className="h-8 sm:h-12 w-auto">
                <path d="M0.00556087 50.9902C0.00556087 46.6772 15.4361 42.1411 17.2579 47.4734C18.1966 50.2214 14.9879 53.336 13.6258 53.9413C14.8365 53.8656 17.5303 53.8505 18.6199 54.3953C19.7096 54.9401 19.1929 55.7573 18.6199 55.7573C18.047 55.7573 14.7609 55.7573 14.7609 55.7573C15.8959 55.9843 18.6199 56.6654 20.436 57.5734C21.7924 58.5527 20.7331 58.8597 19.7494 58.9354C18.7657 59.0111 15.4148 57.4164 15.4148 57.4164C15.8457 57.5961 16.7226 58.0981 17.9389 59.1624C19.2954 60.3493 17.6225 60.8228 17.2579 60.5244C14.7609 58.4814 7.95072 57.1194 3.86464 55.3033C0.595843 53.8505 -0.0700808 51.8226 0.00556087 50.9902Z" fill="#0C3E3F"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M20.8847 20.9139C21.9441 16.6765 26.0151 9.51836 33.8239 14.7848C36.4724 13.2715 41.7236 12.1519 41.5421 18.8709L44.9471 20.9139C45.6281 21.2923 46.6721 22.594 45.4012 24.773C44.2262 26.7872 44.24 34.536 34.7825 42.5813C34.6353 42.7059 33.7068 45.9344 35.413 49.2456C35.7867 49.9706 41.5417 50.3807 40.8611 51.9696C40.4719 52.8776 36.0942 50.8788 36.094 51.7426C36.094 52.4236 38.5908 54.0126 37.91 54.9207C37.1452 55.9409 33.2421 51.6094 32.0079 51.7426C30.3615 51.9212 28.9616 53.7624 27.9218 52.8777C26.8343 51.9521 30.4833 49.4839 30.8631 49.2474C30.6989 49.223 30.1152 46.1942 29.9648 46.2945C28.3736 47.3838 27.7451 47.535 25.9085 48.4631C25.6518 48.5928 25.337 48.472 25.2379 48.202L25.1069 47.8446C25.0279 47.6293 25.1154 47.3875 25.3109 47.2678C34.0267 41.9318 38.5987 33.9036 40.5343 28.4489C41.1499 26.7141 39.5919 25.1624 37.8561 25.7754C28.5486 29.0624 24.6443 36.6631 23.8357 40.4363C23.079 43.5387 23.1093 51.8529 27.4678 54.3953H32.0079C32.4617 54.3953 33.6873 55.2126 32.2349 55.7573C30.419 56.4383 28.603 55.8289 28.3758 56.5097C28.1488 57.1908 29.2838 57.4178 30.8729 58.3258C32.4616 59.2337 30.6457 60.1417 28.6028 58.9354C28.3508 58.7866 26.3808 57.1793 25.6515 57.5734C25.2235 57.8047 25.8785 59.6877 25.4245 60.1417C25.1645 60.4017 24.5165 60.5244 24.2895 59.6877C23.9694 58.5079 23.4419 56.7042 22.7007 56.0557C21.5956 55.0889 21.6713 53.1598 20.8847 50.8785C20.8788 50.8577 19.9839 47.1841 17.5248 44.6067C15.0994 42.0645 8.54814 43.9395 6.14956 44.6067C5.77277 44.7115 5.4362 44.362 5.57769 43.9974C7.95065 37.8824 13.7964 25.7547 20.8847 20.9139ZM29.0568 17.919C27.0509 17.919 25.4248 19.5451 25.4248 21.551C25.4248 23.557 27.0509 25.1831 29.0568 25.1831C31.0627 25.183 32.6889 23.5569 32.6889 21.551C32.6889 19.5452 31.0626 17.9191 29.0568 17.919Z" fill="#0C3E3F"/>
                <path d="M31.3267 21.5511C31.3267 22.1888 31.0637 22.765 30.6404 23.1774C30.2314 23.5757 29.6726 23.8211 29.0566 23.8211C27.8029 23.8211 26.7045 23.0974 26.7045 21.5084C26.7045 20.7316 26.9429 20.197 27.4198 19.7201C27.9092 19.2307 28.4794 19.124 29.0888 19.124C29.8418 19.124 28.9306 20.3471 29.3272 20.9139C29.6213 21.3342 31.3267 21.0173 31.3267 21.5511Z" fill="#0C3E3F"/>
                <path d="M33.9167 13.4868C33.88 13.5077 33.834 13.505 33.7988 13.4816C27.4662 9.26672 22.4781 13.2776 21.0108 17.5239C20.9739 17.6308 20.8145 17.6255 20.7881 17.5155L18.4165 7.60318C18.2814 7.03889 18.7911 6.53157 19.3548 6.66923L23.6893 7.72783C23.7403 7.74029 23.793 7.71509 23.8153 7.66757L27.0053 0.881595C27.2174 0.43044 27.7939 0.293639 28.1861 0.60141L34.166 5.29434L37.7968 1.87753C38.2491 1.45193 38.9932 1.70395 39.0937 2.31677L40.9277 13.4934C40.9469 13.6106 40.7778 13.6812 40.6992 13.5922C38.9556 11.6184 35.7952 12.4186 33.9167 13.4868Z" fill="#0C3E3F"/>
              </svg>
              <span style={{
                color: '#0C3E3F',
                fontFamily: 'Obviously, sans-serif',
                fontSize: '40px',
                fontStyle: 'normal',
                fontWeight: '650',
                lineHeight: 'normal',
                letterSpacing: '-3.2px'
              }}>
                Crebit
              </span>
            </a>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <a 
                href="/"
                className="transition-colors font-medium cursor-pointer text-[#0C3E3F] hover:text-[#0A3234]" 
                style={{fontFamily: "'Satoshi Variable', sans-serif"}}
              >
                HOME
              </a>
            </div>
            <div className="relative group">
              <span 
                className="transition-colors font-medium cursor-pointer text-[#0C3E3F] hover:text-[#0A3234]" 
                style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                onClick={() => window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ', '_blank')}
              >
                LEARN
              </span>
            </div>
            <div className="relative group">
              <span 
                className="transition-colors font-medium cursor-pointer text-[#0C3E3F] hover:text-[#0A3234]" 
                style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                onClick={() => window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ', '_blank')}
              >
                PARTNER
              </span>
            </div>
            {/* SEND MONEY Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setSendMoneyDropdown(true)}
              onMouseLeave={() => setSendMoneyDropdown(false)}
            >
              <button
                className="flex items-center gap-1 px-4 py-2 bg-[#D4C5A9] text-[#0C3E3F] font-medium rounded-full hover:bg-[#C9B896] transition-colors"
                style={{fontFamily: "'Satoshi Variable', sans-serif"}}
              >
                SEND MONEY
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {sendMoneyDropdown && (
                <div 
                  className="absolute top-full left-0 w-96 bg-gray-100 rounded-2xl shadow-lg border border-gray-200 z-50 p-4"
                  onMouseEnter={() => setSendMoneyDropdown(true)}
                  onMouseLeave={() => setSendMoneyDropdown(false)}
                >
                  <div className="space-y-3">
                    <a 
                      href="/get-started"
                      className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <img src={brazilFlag} alt="Brazil" className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-semibold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Send money from Brazil
                          </div>
                          <div className="text-sm text-gray-600" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Pay with Pix
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-500" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          {exchangeRates.BRL.toFixed(2)} BRL =  1 USD
                        </div>
                      </div>
                    </a>
                    
                    <a 
                      href="/get-started-mexico"
                      className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <img src={mexicoFlag} alt="Mexico" className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-semibold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Send money from Mexico
                          </div>
                          <div className="text-sm text-gray-600" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Pay with SPEI
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-500" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          {exchangeRates.MXN.toFixed(2)} MXN = 1 USD
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User Account Dropdown - Far Right */}
            <div 
              className="relative group ml-auto"
              onMouseEnter={() => setAccountsDropdown(true)}
              onMouseLeave={() => setAccountsDropdown(false)}
            >
              {user && userProfile ? (
                <>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-[#0C3E3F] font-medium hover:bg-gray-100 rounded-full transition-colors"
                    style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                  >
                    <User className="w-4 h-4" />
                    {userProfile.first_name}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {accountsDropdown && (
                    <div 
                      className="absolute top-full right-0 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 p-4"
                      onMouseEnter={() => setAccountsDropdown(true)}
                      onMouseLeave={() => setAccountsDropdown(false)}
                    >
                      <div className="space-y-2">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <div className="font-semibold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            {userProfile.first_name} {userProfile.last_name}
                          </div>
                          <div className="text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif"}}>
                            {userProfile.email}
                          </div>
                        </div>
                        
                        <a
                          href="/dashboard"
                          className="block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#0C3E3F]" />
                            <div className="font-semibold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                              Dashboard
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 ml-6" style={{fontFamily: "'Inter', sans-serif"}}>
                            View transaction history
                          </div>
                        </a>
                       
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left block bg-red-50 rounded-xl p-4 hover:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-red-600" />
                            <div className="font-semibold text-red-600" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                              Sign Out
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="flex items-center gap-1 px-4 py-2 text-[#0C3E3F] font-medium hover:bg-gray-100 rounded-full transition-colors"
                    style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                  >
                    ACCOUNTS
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {accountsDropdown && (
                    <div 
                      className="absolute top-full right-0 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 p-4"
                      onMouseEnter={() => setAccountsDropdown(true)}
                      onMouseLeave={() => setAccountsDropdown(false)}
                    >
                      <div className="space-y-2">
                        <a 
                          href="/login"
                          className="block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-semibold text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Log In
                          </div>
                          <div className="text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif"}}>
                            Access your account
                          </div>
                        </a>
                        
                        <a 
                          href="/signup"
                          className="block bg-[#0C3E3F] rounded-xl p-4 hover:bg-[#0C3E3F]/90 transition-colors"
                        >
                          <div className="font-semibold text-white" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                            Sign Up
                          </div>
                          <div className="text-sm text-white/80" style={{fontFamily: "'Inter', sans-serif"}}>
                            Create a new account
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </nav>
  
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[#0C3E3F] hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-50 border-t border-gray-200 shadow-lg z-50">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <a 
                  href="/"
                  className="block w-full text-left py-2 px-4 text-[#0C3E3F] font-medium hover:bg-gray-100 rounded-lg"
                  style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  HOME
                </a>
                <button 
                  className="w-full text-left py-2 px-4 text-[#0C3E3F] font-medium hover:bg-gray-100 rounded-lg"
                  style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                  onClick={() => window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ', '_blank')}
                >
                  LEARN
                </button>
                <button 
                  className="w-full text-left py-2 px-4 text-[#0C3E3F] font-medium hover:bg-gray-100 rounded-lg"
                  style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                  onClick={() => window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ', '_blank')}
                >
                  PARTNER
                </button>
              </div>
              
              {/* Mobile Send Money Section */}
              <div className="border-t pt-4">
                <div className="text-sm font-semibold text-[#0C3E3F] mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                  SEND MONEY
                </div>
                <div className="space-y-2">
                  <a 
                    href="/get-started"
                    className="block bg-white rounded-xl p-3 hover:shadow-md transition-shadow"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <img src={brazilFlag} alt="Brazil" className="w-8 h-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold text-[#0C3E3F] text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          Send from Brazil
                        </div>
                        <div className="text-xs text-gray-600" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          Pay with Pix
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-500" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        {exchangeRates.BRL.toFixed(2)} BRL = 1 USD
                      </div>
                    </div>
                  </a>
                  
                  <a 
                    href="/get-started-mexico"
                    className="block bg-white rounded-xl p-3 hover:shadow-md transition-shadow"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <img src={mexicoFlag} alt="Mexico" className="w-8 h-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold text-[#0C3E3F] text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          Send from Mexico
                        </div>
                        <div className="text-xs text-gray-600" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          Pay with SPEI
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-500" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        {exchangeRates.MXN.toFixed(2)} MXN = 1 USD
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              
              {/* Mobile Account Section */}
              <div className="border-t pt-4">
                <div className="text-sm font-semibold text-[#0C3E3F] mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                  ACCOUNT
                </div>
                {user && userProfile ? (
                  <>
                    <div className="bg-white rounded-xl p-3 mb-2">
                      <div className="font-semibold text-[#0C3E3F] text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        {userProfile.first_name} {userProfile.last_name}
                      </div>
                      <div className="text-xs text-gray-600" style={{fontFamily: "'Inter', sans-serif"}}>
                        {userProfile.email}
                      </div>
                    </div>
                    <a
                      href="/dashboard"
                      className="block bg-gray-50 rounded-xl p-3 mb-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0C3E3F]" />
                        <div className="font-semibold text-[#0C3E3F] text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          Dashboard
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 ml-6" style={{fontFamily: "'Inter', sans-serif"}}>
                        View transaction history
                      </div>
                    </a>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full bg-red-50 rounded-xl p-3 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-600" />
                        <div className="font-semibold text-red-600 text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                          Sign Out
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <a
                      href="/signup"
                      className="block bg-[#0C3E3F] text-white rounded-xl p-3 hover:bg-[#0C3E3F]/90 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-semibold text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        Sign Up
                      </div>
                    </a>
                    <a
                      href="/login"
                      className="block bg-white border-2 border-[#0C3E3F] text-[#0C3E3F] rounded-xl p-3 hover:bg-gray-50 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-semibold text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                        Log In
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header