import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import heroImage from "@/assets/hero-students.jpg"
import teamPhoto from "@/assets/team-photo.png"
import CollegeLogosSlider from "./CollegeLogosSlider"


const HeroSection = () => {
  return (
    <section className="relative overflow-hidden seamless-gradient-top py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-yellow/30 bg-yellow/20 px-3 py-1 text-sm text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                Launching pilot program
              </div>
              
              <h1 className="text-4xl lg:text-6xl text-foreground leading-tight" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                Pay your <span className="bg-gradient-hero bg-clip-text text-transparent">U.S. college tuition</span> from anywhere
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                <strong>No U.S. bank account needed</strong> — we'll mail a check directly on your behalf. Or <strong>if you have a U.S. bank account</strong>, we can convert and send USD in minutes for instant ACH payments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="flex-1 sm:flex-none" style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}} asChild>
                <a href="/country-selection">Get Started Now</a>
              </Button>
              <Button variant="outline" size="xl" className="flex-1 sm:flex-none" style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}} asChild>
                <a href="/quote">See Quote Estimate</a>
              </Button>
              <Button variant="outline" size="xl" className="flex-1 sm:flex-none" style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}} asChild>
                <a href="/how-it-works">How It Works</a>
              </Button>
            </div>

            {/* College Logos Slider */}
            <CollegeLogosSlider />
          </div>
        </div>
      </div>

      {/* Why we started Crebit Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img 
              src={teamPhoto} 
              alt="Crebit Founders: Jensen Coonradt and Simmi Sen"
              className="w-full h-auto rounded-2xl"
            />
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                <strong style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Crebit Founders:</strong> Jensen Coonradt and Simmi Sen
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl text-foreground" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
              Why we started Crebit
            </h2>
            <div className="space-y-4 text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
              <p>
                We saw our international classmates at Stanford and MIT paying thousands in hidden fees for their tuition. We launched Crebit to fix that for all students, both domestic and international.
              </p>
              <p>
                Backed by $450k in funding, we're making tuition payments cheaper, faster, and easier than providers like Flywire and Convera.
              </p>
            </div>
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto" 
              style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
              asChild
            >
              <a href="https://calendly.com/simmisendesign/crebit" target="_blank" rel="noopener noreferrer">
                Book a Call With Us
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* How Crebit Compares Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl text-foreground mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            How Crebit Compares
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Provider</th>
                  <th className="text-left py-4 px-6 text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Fees</th>
                  <th className="text-left py-4 px-6 text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Speed</th>
                  <th className="text-left py-4 px-6 text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Transparency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-l-4 border-[#17484A] bg-[#17484A]/5">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-[#17484A]" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Crebit</span>
                      <span className="bg-[#17484A] text-white px-2 py-1 rounded-full text-xs font-bold">BEST</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#17484A]">✓</span>
                      <div className="text-[#17484A] font-semibold">
                        <div>0% + No IOF Tax</div>
                        <div className="text-xs text-[#17484A]/70">Avoid Brazil's 0.38-3.5% IOF</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#17484A]">✓</span>
                      <span className="text-[#17484A] font-semibold">Same day</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-[#17484A]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-[#17484A] font-semibold">Live quote</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">
                    <span className="text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Flywire</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <div className="text-red-500 font-semibold">
                        <div>Hidden fees + IOF Tax</div>
                        <div className="text-xs text-red-400">Plus Brazil's 0.38-3.5% IOF</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-red-500 font-semibold">2-5 days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                      </svg>
                      <span className="text-red-500 font-semibold">Hidden spread</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">
                    <span className="text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Banks</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <div className="text-red-500 font-semibold">
                        <div>2-5% + IOF Tax</div>
                        <div className="text-xs text-red-400">Plus Brazil's 0.38-3.5% IOF</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-red-500 font-semibold">3-7 days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                      </svg>
                      <span className="text-red-500 font-semibold">Hidden spread</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">
                    <span className="text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Business FX Services</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <div className="text-red-500 font-semibold">
                        <div>2-5% + IOF Tax</div>
                        <div className="text-xs text-red-400">Plus Brazil's 0.38-3.5% IOF</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-red-500 font-semibold">3-7 days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                      </svg>
                      <span className="text-red-500 font-semibold">Hidden spread</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6">
                    <span className="text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>Shopping / Card Networks</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <div className="text-red-500 font-semibold">
                        <div>3-7% + IOF Tax</div>
                        <div className="text-xs text-red-400">Plus Brazil's 0.38-3.5% IOF</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">✗</span>
                      <span className="text-red-500 font-semibold">3-7 days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                      </svg>
                      <span className="text-red-500 font-semibold">Hidden spread</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground max-w-3xl mx-auto" style={{fontFamily: "'Inter', sans-serif !important"}}>
            <strong style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>Avoid Brazil's IOF Tax:</strong> Our stablecoin technology bypasses Brazil's IOF (Imposto sobre Operações Financeiras) tax of 0.38-3.5% that applies to traditional foreign exchange transactions. Combined with our superior exchange rates and zero fees, you save significantly more than any traditional payment service including Flywire.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HeroSection