import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Icon components
const BrazilFlagIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 16" fill="none">
    <rect width="24" height="16" fill="#009639"/>
    <path d="M12 2L20 8L12 14L4 8L12 2Z" fill="#FEDF00"/>
    <circle cx="12" cy="8" r="3.5" fill="#002776"/>
    <path d="M9.5 8C9.5 6.62 10.62 5.5 12 5.5C13.38 5.5 14.5 6.62 14.5 8" stroke="#FEDF00" strokeWidth="0.5" fill="none"/>
  </svg>
);

const CheckIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const InfoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SupportedCountries = () => {
  const countries = [
    {
      flag: BrazilFlagIcon,
      name: "Brazil",
      currency: "BRL (Real)",
      methods: ["PIX QR Code", "PIX Key Copy/Paste"],
      features: ["Instant transfers", "24/7 processing", "Bank-level security"],
      status: "Available"
    }
  ]

  return (
    <section id="countries" className="py-6 seamless-gradient-middle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            Supported Countries & Payment Methods
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" style={{fontFamily: "'Inter', sans-serif !important"}}>
            We support students from around the world with local payment methods you already use. Currently launching with Brazil.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {countries.map((country) => (
            <Card key={country.name} className="elevated-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <country.flag className="w-10 h-7" />
                    <div>
                      <CardTitle className="text-xl">{country.name}</CardTitle>
                      <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>{country.currency}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-success-muted text-success">
                    {country.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Payment Methods</h4>
                  <div className="space-y-2">
                    {country.methods.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Features</h4>
                  <div className="space-y-2">
                    {country.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}

export default SupportedCountries