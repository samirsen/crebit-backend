import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Icon components
const SchoolIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CurrencyExchangeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m4-4v8" />
  </svg>
);

const PhoneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const TargetIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const MailIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BankIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1H21v4H3V3h7.5z" />
  </svg>
);

const DiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const SparklesIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Enter School Information",
      description: "Provide your school's mailing address exactly as shown on their payment page, plus your student ID and full name.",
      icon: SchoolIcon,
      details: ["School name & address", "Student ID number", "Full name (must match records)", "Payment term/reference"]
    },
    {
      number: "2", 
      title: "Get Guaranteed Quote",
      description: "See the exact amount in your local currency with transparent fees. Lock your rate for 5 minutes.",
      icon: CurrencyExchangeIcon,
      details: ["Real-time exchange rate", "Transparent fee breakdown", "5-minute rate lock", "Local currency total"]
    },
    {
      number: "3",
      title: "Pay Locally",
      description: "Use PIX from Brazil. Our partner UnblockPay handles the conversion securely.",
      icon: PhoneIcon,
      details: ["PIX QR code or key", "UnblockPay stablecoin bridge", "Real-time confirmation"]
    },
    {
      number: "4",
      title: "Choose Your Delivery Method",
      description: "Select between two convenient options: we can mail a check directly to your school or send USD to your US bank account.",
      icon: TargetIcon,
      details: ["Mail check option (5-7 days)", "USD bank transfer option (<1 hour)", "Your choice during setup", "Full tracking for both methods"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-3xl lg:text-4xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four simple steps to pay your U.S. tuition with two convenient delivery options
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0" />
                )}
                
                <Card className="relative z-10 shadow-card border-0 hover:shadow-soft transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center space-y-4">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary text-white rounded-full font-bold text-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-12 h-12 mx-auto text-primary">
                      <step.icon className="w-12 h-12" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>{step.title}</h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                    
                    {/* Details */}
                    <div className="space-y-2 pt-2">
                      {step.details.map((detail) => (
                        <div key={detail} className="flex items-center justify-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-xs text-muted-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="xl" asChild>
              <a href="/country-selection">Start Your Payment</a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Complete process typically takes 2-3 business days
            </p>
          </div>

          {/* Payment Method Options */}
          <div className="mt-20">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-2xl lg:text-3xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                Choose Your Delivery Method
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select how you want us to deliver the payment to your school
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Check to School Method */}
              <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <MailIcon className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl text-foreground mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                        Mail Check to School
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Perfect if you don't have a US bank account
                      </p>
                      
                      <div className="space-y-2 text-left">
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">We mail a physical check directly to your school</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Check includes your name and student ID</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Processing time: 5-7 business days</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Tracking number provided</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* USD Bank Transfer Method */}
              <Card className="shadow-card border-0 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                      <BankIcon className="w-8 h-8 text-success" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl text-foreground mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                        USD to Your US Bank Account
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        For those who have a US bank account
                      </p>
                      
                      <div className="space-y-2 text-left">
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">We send USD directly to your US bank account</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Your school can pull funds via ACH</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Processing time: Less than 1 hour</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Faster than check delivery</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stablecoin Technology Advantage */}
          <div className="mt-20">
            <Card className="shadow-card border-0 bg-primary-muted/10 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <SparklesIcon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl text-foreground mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                      Why We Beat Every Provider Including Flywire
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      Traditional services like Flywire and others use outdated banking infrastructure. We leverage cutting-edge stablecoin 
                      technology through UnblockPay to deliver the best exchange rates and lowest fees in the market.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DiamondIcon className="w-6 h-6 text-success" />
                      </div>
                      <h3 className="text-foreground mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Better Exchange Rates</h3>
                      <p className="text-sm text-muted-foreground">
                        Stablecoin technology eliminates banking intermediaries for real-time market rates
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <SparklesIcon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-foreground mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Lower Fees</h3>
                      <p className="text-sm text-muted-foreground">
                        Reduced processing costs thanks to blockchain efficiency vs traditional wire transfers
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <SparklesIcon className="w-6 h-6 text-warning" />
                      </div>
                      <h3 className="text-foreground mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Faster Settlement</h3>
                      <p className="text-sm text-muted-foreground">
                        Instant conversion and processing instead of multi-day banking delays
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default HowItWorks