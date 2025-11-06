import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

// Icon components
const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CurrencyExchangeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m4-4v8" />
  </svg>
);

const MailboxIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const TruckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const EmailIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SparklesIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const WarningIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const LightbulbIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

interface NotificationStep {
  title: string
  description: string
  emailContent: string
  icon: React.ComponentType<{ className?: string }>
  timing: string
}

const Track = () => {
  const notificationSteps: NotificationStep[] = [
    {
      title: "Payment Confirmed",
      description: "We confirm receipt of your local currency payment",
      emailContent: "Your payment has been successfully received and confirmed. We're now converting your funds to USD.",
      icon: CheckIcon,
      timing: "Within 5 minutes of payment"
    },
    {
      title: "Currency Converted",
      description: "Your funds have been converted to USD via UnblockPay",
      emailContent: "Your payment has been converted to USD through our partner UnblockPay. Your check is being prepared.",
      icon: CurrencyExchangeIcon,
      timing: "Within 30 minutes"
    },
    {
      title: "Check Approved & Mailed",
      description: "Your check has been printed and sent to your school",
      emailContent: "Your check has been approved, printed with your student details, and mailed to your school via overnight delivery.",
      icon: MailboxIcon,
      timing: "Next business day"
    },
    {
      title: "Delivery Updates",
      description: "Real-time updates on your check's delivery status",
      emailContent: "Your payment is out for delivery / has been delivered to your school's bursar office.",
      icon: TruckIcon,
      timing: "Real-time tracking updates"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Payment Status Updates
            </h1>
            <p className="text-xl text-muted-foreground">
              We'll keep you informed via email throughout your payment journey
            </p>
          </div>

          {/* How Email Notifications Work */}
          <Card className="shadow-card border-0 mb-8 bg-primary-muted/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <EmailIcon className="w-8 h-8 text-primary" />
                <div>
                  <span className="text-2xl">Stay Updated via Email</span>
                  <Badge variant="secondary" className="ml-3 bg-success-muted text-success">
                    No tracking needed
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="bg-background/80 p-6 rounded-lg border border-primary/10">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Automatic Email Updates</h3>
                    <p className="text-muted-foreground">
                      Once you complete your payment, we'll automatically send you email notifications at each stage 
                      of the process. No need to track anything manually - we'll keep you informed every step of the way.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Notification Timeline */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <EmailIcon className="w-6 h-6 text-primary" />
                <span>Email Notification Timeline</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Here's when you can expect to hear from us throughout your payment process
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-8">
                {notificationSteps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Timeline line */}
                    {index < notificationSteps.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-20 bg-primary/30" />
                    )}
                    
                    <div className="flex items-start space-x-6">
                      {/* Timeline icon */}
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {step.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {step.timing}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                        
                        {/* Email preview */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-muted">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1">
                              <EmailIcon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Email Preview</span>
                            </div>
                          </div>
                          <p className="text-sm text-foreground italic">
                            "{step.emailContent}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Setup Reminder */}
          <Card className="shadow-card border-0 mt-8 bg-warning-muted/10 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                  <WarningIcon className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important: Check Your Email</h3>
                  <p className="text-muted-foreground mb-4">
                    Please ensure you provide a valid email address during payment and check your spam folder. 
                    All important updates will be sent to the email you provide during the payment process.
                  </p>
                  <div className="bg-background/60 p-3 rounded border">
                    <p className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <LightbulbIcon className="w-4 h-4 text-muted-foreground" />
                        <span><strong>Tip:</strong> Add our email domain to your contacts to ensure you receive all notifications.</span>
                      </div>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="shadow-card border-0 bg-muted/30 mt-8" id="contact">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Contact Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is available 24/7 to help with any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:jensen@getcrebit.com">
                    Email Us
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:+16308066837">
                    Call +1 (630) 806-6837
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default Track