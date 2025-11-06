import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <Card className="shadow-card border-0">
              <CardContent className="space-y-8 p-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By using Crebit's services, you agree to these Terms of Service and our Privacy Policy. 
                    These terms constitute a legally binding agreement between you and Crebit.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">2. Agent of the Payor Authorization</h2>
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                    <p className="text-foreground font-medium">
                      You authorize Crebit to act as your limited-purpose agent for transmitting funds to your 
                      designated educational institution. This authorization is solely for the purpose of facilitating 
                      tuition and related educational fee payments as specified in your payment instructions.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">3. Scope of Services</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Crebit is not a bank, money transmitter, or financial institution. We provide limited software services that:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Act as your agent to transmit tuition payments to educational institutions</li>
                      <li>Convert currency and facilitate payment delivery through licensed partners</li>
                      <li>Provide tracking and confirmation of payment transmission</li>
                    </ul>
                    <p className="text-muted-foreground font-medium">
                      We do NOT offer custodial accounts, general-purpose financial services, peer-to-peer transfers, 
                      or any form of banking services.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">4. Payment Authorization</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      By using our services, you acknowledge and agree that:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Any payments made via Crebit are initiated at your explicit request</li>
                      <li>Funds are for any expense billed by your educational institution</li>
                      <li>You have the legal authority to authorize such payments</li>
                      <li>Payment instructions provided by you are accurate and complete</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">5. No Withdrawals or Stored Value</h2>
                  <div className="bg-warning/5 p-6 rounded-lg border border-warning/20">
                    <p className="text-foreground font-medium">
                      You understand and agree that once funds are deposited for transmission:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-foreground mt-2 ml-4">
                      <li>Funds cannot be withdrawn by you</li>
                      <li>All funds are locked to the specific payment instruction provided</li>
                      <li>Funds cannot be redirected to any recipient other than the designated educational institution</li>
                      <li>No stored value or balance is maintained on your behalf</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">6. Refund Policy</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Refunds are subject to the following conditions:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Funds are only refunded to the original sender's account</li>
                      <li>Refunds are processed only if payment transmission fails due to technical errors</li>
                      <li>We do not handle disputes between you and the educational institution</li>
                      <li>Our responsibility ends upon successful transmission to the designated recipient</li>
                      <li>Refund requests must be made within 30 days of the original transaction</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">7. Data and Privacy</h2>
                  <div className="bg-info/5 p-6 rounded-lg border border-info/20">
                    <p className="text-foreground">
                      <strong>Important:</strong> Crebit only stores your email address after transaction completion. 
                      All other personal information is used solely with our licensed payment partners for transaction 
                      processing and is not stored by Crebit. Please review our Privacy Policy for complete details.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">8. Limitations and Disclaimers</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Crebit disclaims responsibility for:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Delays in payment processing by third-party institutions</li>
                      <li>Misapplied payments due to incorrect recipient information</li>
                      <li>Educational institution processing errors or policies</li>
                      <li>Currency exchange rate fluctuations during processing</li>
                      <li>Technical issues with recipient institution systems</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">9. Governing Law and Jurisdiction</h2>
                  <p className="text-muted-foreground">
                    These Terms of Service are governed by the laws of the State of Delaware, United States. 
                    Any disputes arising from these terms or your use of Crebit's services shall be resolved 
                    in the appropriate courts of Delaware.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">10. Contact Information</h2>
                  <p className="text-muted-foreground">
                    If you have questions about these Terms of Service, please contact us at jensen@getcrebit.com
                  </p>
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

export default TermsOfService