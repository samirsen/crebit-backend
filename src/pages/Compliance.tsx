import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Icon components
const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Compliance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">How Crebit Works</h1>
              <p className="text-xl text-muted-foreground">
                A transparent approach to international tuition payments
              </p>
            </div>

            <Card className="shadow-card border-0">
              <CardContent className="space-y-8 p-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">What We Are</h2>
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                    <p className="text-foreground text-lg leading-relaxed">
                      <strong>Crebit is not a bank or money transmitter.</strong> We act solely as a software agent 
                      helping international students pay tuition directly to their college using publicly available 
                      payment methods.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl font-bold text-primary">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">You Authorize</h3>
                      <p className="text-sm text-muted-foreground">
                        You provide payment instructions and authorize us to act as your agent for this specific tuition payment
                      </p>
                    </div>
                    
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl font-bold text-primary">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">We Process</h3>
                      <p className="text-sm text-muted-foreground">
                        We convert your local currency to USD through licensed partners and prepare payment delivery
                      </p>
                    </div>
                    
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl font-bold text-success">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">School Receives</h3>
                      <p className="text-sm text-muted-foreground">
                        USD payment is delivered directly to your educational institution via check or ACH transfer
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Fund Usage and Security</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border border-success/20 bg-success/5">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground flex items-center">
                          <CheckIcon className="w-5 h-5 text-success mr-2" />
                          What We Do
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">• Convert funds to USD at competitive rates</p>
                        <p className="text-sm text-muted-foreground">• Send USD directly to your school</p>
                        <p className="text-sm text-muted-foreground">• Provide full payment tracking</p>
                        <p className="text-sm text-muted-foreground">• Store only your email for communication</p>
                        <p className="text-sm text-muted-foreground">• Process payments within 5-7 business days</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-warning/20 bg-warning/5">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground flex items-center">
                          <XIcon className="w-5 h-5 text-warning mr-2" />
                          What We Don't Do
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">• Hold or invest your funds</p>
                        <p className="text-sm text-muted-foreground">• Allow withdrawals or fund redirection</p>
                        <p className="text-sm text-muted-foreground">• Maintain account balances</p>
                        <p className="text-sm text-muted-foreground">• Store personal financial information</p>
                        <p className="text-sm text-muted-foreground">• Offer general banking services</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Regulatory Compliance</h2>
                  <div className="bg-info/5 p-6 rounded-lg border border-info/20">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Licensed Partner Network</h3>
                      <p className="text-muted-foreground">
                        We work exclusively with licensed financial institutions and payment processors to ensure 
                        all transactions comply with applicable financial regulations, including:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Anti-Money Laundering (AML) requirements</li>
                        <li>Know Your Customer (KYC) verification</li>
                        <li>Cross-border payment regulations</li>
                        <li>Educational payment compliance standards</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Data Privacy</h2>
                  <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Minimal Data Storage Policy</h3>
                    <p className="text-muted-foreground mb-3">
                      Unlike traditional financial services, Crebit minimizes data storage:
                    </p>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        <strong>What we store:</strong> Only your email address (for transaction updates and support)
                      </p>
                      <p className="text-muted-foreground">
                        <strong>What we don't store:</strong> Personal information, payment details, or identity documents 
                        (processed by licensed partners only)
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Why Choose Crebit?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">For Students</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center">
                          <span className="text-primary mr-2">•</span>
                          No US bank account required
                        </li>
                        <li className="flex items-center">
                          <span className="text-primary mr-2">•</span>
                          Competitive exchange rates
                        </li>
                        <li className="flex items-center">
                          <span className="text-primary mr-2">•</span>
                          Full payment tracking
                        </li>
                        <li className="flex items-center">
                          <span className="text-primary mr-2">•</span>
                          Minimal personal data exposure
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">For Institutions</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center">
                          <span className="text-success mr-2">•</span>
                          Receive payments in USD
                        </li>
                        <li className="flex items-center">
                          <span className="text-success mr-2">•</span>
                          Standard payment processing
                        </li>
                        <li className="flex items-center">
                          <span className="text-success mr-2">•</span>
                          Full transaction documentation
                        </li>
                        <li className="flex items-center">
                          <span className="text-success mr-2">•</span>
                          Regulatory compliance assurance
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Legal Framework</h2>
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <p className="text-muted-foreground">
                      Our services operate under a limited-purpose agent model, authorized by each user for specific 
                      tuition payment transactions. This approach ensures transparency, compliance, and protection 
                      for all parties involved.
                    </p>
                    <div className="mt-4 space-x-4">
                      <a href="/terms-of-service" className="text-primary hover:underline">
                        Terms of Service
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a href="/privacy-policy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a href="/payment-authorization" className="text-primary hover:underline">
                        Payment Authorization
                      </a>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 text-center">
                  <h2 className="text-2xl font-bold text-foreground">Ready to Get Started?</h2>
                  <p className="text-muted-foreground">
                    Experience transparent, secure international tuition payments
                  </p>
                  <Button variant="hero" size="lg" asChild>
                    <a href="/country-selection">Start Your Payment</a>
                  </Button>
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

export default Compliance