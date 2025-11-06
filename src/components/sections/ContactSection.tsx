import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const ContactSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                Get in Touch
              </h2>
              <p className="text-lg text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                Have questions about our service? We're here to help with your tuition payments and currency conversion needs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="inline-flex items-center space-x-3 bg-background p-6 rounded-lg border shadow-sm">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-muted-foreground mb-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                    Email us at
                  </div>
                  <a 
                    href="mailto:jensen@getcrebit.com"
                    className="text-lg text-foreground hover:text-primary transition-colors"
                    style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}
                  >
                    jensen@getcrebit.com
                  </a>
                </div>
              </div>
              
              <Button 
                variant="hero" 
                size="lg" 
                className="flex-shrink-0" 
                style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
                asChild
              >
                <a href="https://calendly.com/simmisendesign/crebit" target="_blank" rel="noopener noreferrer">
                  Book a Call With Us
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
              We typically respond within an hour
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
