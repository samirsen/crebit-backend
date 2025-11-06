import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <Card className="shadow-card border-0">
              <CardContent className="space-y-8 p-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                  <p className="text-muted-foreground">
                    Crebit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                    explains how we collect, use, disclose, and safeguard your information when you use our 
                    tuition payment transmission services.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information We Process:</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                        <li>Full name and contact information</li>
                        <li>Date of birth and identity document details</li>
                        <li>Educational institution details and student ID</li>
                        <li>Banking or payment method information</li>
                        <li>Transaction amounts and payment instructions</li>
                        <li>Transaction logs and confirmation records</li>
                      </ul>
                    </div>
                    
                    <div className="bg-success/5 p-6 rounded-lg border border-success/20">
                      <h3 className="text-lg font-semibold text-foreground mb-3">What We Actually Store:</h3>
                      <p className="text-foreground font-medium">
                        <strong>Email address only</strong> - stored after successful transaction completion for 
                        communication purposes.
                      </p>
                      <p className="text-muted-foreground mt-2">
                        All other personal information is processed through our licensed payment partners and 
                        is not stored in Crebit's systems.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      We use your information exclusively for:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Processing and executing tuition payment transmissions</li>
                      <li>Identity verification and compliance with financial regulations</li>
                      <li>Communicating transaction status and confirmations</li>
                      <li>Customer support related to your payment</li>
                      <li>Fraud prevention and security monitoring</li>
                    </ul>
                    <p className="text-muted-foreground font-medium">
                      We do not use your information for marketing, advertising, or any purpose unrelated to 
                      payment transmission services.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">4. Information Sharing and Disclosure</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      We share your information only with:
                    </p>
                    <div className="bg-warning/5 p-6 rounded-lg border border-warning/20">
                      <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                        <li><strong>Payment Processors:</strong> Licensed partners who execute currency conversion and payment transmission</li>
                        <li><strong>Banking Partners:</strong> Financial institutions that facilitate the actual fund transfers</li>
                        <li><strong>Educational Institutions:</strong> The designated recipient of your tuition payment</li>
                        <li><strong>Regulatory Authorities:</strong> When required by law or legal process</li>
                      </ul>
                    </div>
                    <p className="text-muted-foreground">
                      We do not sell, rent, or share your personal information with third parties for their 
                      marketing purposes.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">5. Data Retention Policy</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Our data retention practices:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Email addresses:</strong> Retained for ongoing customer communication and support</li>
                      <li><strong>Transaction logs:</strong> Maintained only as long as required for regulatory, tax, and audit purposes</li>
                      <li><strong>Personal information:</strong> Not stored by Crebit; handled by licensed payment partners according to their retention policies</li>
                      <li><strong>Legal requirements:</strong> Some records may be retained longer to comply with applicable laws</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">6. Security Measures</h2>
                  <div className="bg-info/5 p-6 rounded-lg border border-info/20">
                    <p className="text-foreground">
                      We implement industry-standard security measures including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-foreground mt-2 ml-4">
                      <li>End-to-end encryption for all data transmission</li>
                      <li>Secure access controls and authentication protocols</li>
                      <li>Regular security audits and monitoring</li>
                      <li>Compliance with financial industry security standards</li>
                      <li>Limited data storage to minimize exposure risk</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">7. Your Rights</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      You have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Request access to your personal information</li>
                      <li>Request correction of inaccurate information</li>
                      <li>Request deletion of your email address from our records</li>
                      <li>Withdraw consent for processing (may affect service availability)</li>
                      <li>File complaints with relevant data protection authorities</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">8. International Data Transfers</h2>
                  <p className="text-muted-foreground">
                    As we facilitate international tuition payments, your information may be processed in 
                    different countries. We ensure appropriate safeguards are in place when transferring 
                    personal information across borders, in compliance with applicable data protection laws.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">9. Changes to This Privacy Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy periodically. We will notify you of any material changes 
                    by posting the new Privacy Policy on our website and updating the "Last updated" date.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">10. Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground">
                      Email: jensen@getcrebit.com<br />
                      Subject: Privacy Policy Inquiry
                    </p>
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

export default PrivacyPolicy