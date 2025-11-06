import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

// Icon component
const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PaymentAuthorization = () => {
  const [acknowledged, setAcknowledged] = useState(false)
  const [timestamp] = useState(new Date().toISOString())

  const handleAuthorization = () => {
    if (acknowledged) {
      // Log the digital signature with timestamp
      console.log("Payment Authorization Agreed:", {
        timestamp,
        userAgent: navigator.userAgent,
        acknowledged: true
      })
      
      // Redirect to payment flow or next step
      window.location.href = "/country-selection"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Payment Authorization Agreement</h1>
              <p className="text-muted-foreground">
                Please review and confirm your authorization before proceeding
              </p>
            </div>

            <Card className="shadow-card border-0 border-l-4 border-l-primary">
              <CardContent className="space-y-6 p-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Authorization Statement</h2>
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                    <p className="text-foreground text-lg leading-relaxed">
                      By clicking confirm below, I authorize <strong>Crebit</strong> to act as my limited-purpose 
                      agent and transmit the specified payment amount to my designated educational institution 
                      using the payment instructions I have provided.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">I understand and agree that:</h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="w-3 h-3 text-success" />
                      </div>
                      <p className="text-muted-foreground">
                        This payment is for any expense billed by my designated educational institution
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="w-3 h-3 text-success" />
                      </div>
                      <p className="text-muted-foreground">
                        Crebit acts only as my agent for payment transmission and is not a bank or money transmitter
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="w-3 h-3 text-success" />
                      </div>
                      <p className="text-muted-foreground">
                        I cannot withdraw or redirect funds once the payment process has begun
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="w-3 h-3 text-success" />
                      </div>
                      <p className="text-muted-foreground">
                        All payment information I have provided is accurate and complete
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="w-3 h-3 text-success" />
                      </div>
                      <p className="text-muted-foreground">
                        I have the legal authority to authorize this payment
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Important Information</h2>
                  <div className="bg-warning/5 p-6 rounded-lg border border-warning/20">
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>No Refunds:</strong> Funds can only be returned to your original payment method in case of transmission failure</li>
                      <li>• <strong>No Stored Value:</strong> We do not maintain account balances or store funds on your behalf</li>
                      <li>• <strong>Limited Scope:</strong> Our responsibility ends upon successful transmission to your educational institution</li>
                      <li>• <strong>Data Privacy:</strong> Only your email is stored after transaction completion</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Legal References</h2>
                  <div className="bg-info/5 p-4 rounded-lg border border-info/20">
                    <p className="text-sm text-muted-foreground">
                      This authorization is governed by our{" "}
                      <a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a>{" "}
                      and{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
                      Please review these documents before proceeding.
                    </p>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="authorization-agreement"
                      checked={acknowledged}
                      onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                    />
                    <label 
                      htmlFor="authorization-agreement" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I have read, understood, and agree to the above authorization terms
                    </label>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Digital Signature Timestamp: {new Date(timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      variant="hero" 
                      size="lg"
                      onClick={handleAuthorization}
                      disabled={!acknowledged}
                      className="min-w-[200px]"
                    >
                      Confirm Authorization & Proceed
                    </Button>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default PaymentAuthorization