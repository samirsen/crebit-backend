import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Icon components
const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SparklesIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const PhoneIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CTASection = () => {
  return (
    <section className="py-12 seamless-gradient-bottom">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-effect p-12 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
              Ready to Pay Your Tuition?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" style={{fontFamily: "'Inter', sans-serif !important"}}>
              Join students worldwide who trust us with their U.S. tuition payments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="min-w-48" style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}} asChild>
              <a href="/country-selection">Get Started Now</a>
            </Button>
            <Button variant="outline" size="xl" className="min-w-48" style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}} asChild>
              <a href="/quote">See Sample Quote</a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <LockIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Bank-Level Security</div>
                <div className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Your data is protected</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-yellow rounded-full flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-yellow-foreground" />
              </div>
              <div className="text-left">
                <div className="text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Fast Processing</div>
                <div className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>Approx. 1 hour</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                <PhoneIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>24/7 Support</div>
                <div className="text-xs text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>We're here to help</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default CTASection