import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

// Icon components
const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EmailIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GiftIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const PaymentComplete = () => {
  const [referralEmails, setReferralEmails] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addEmailField = () => {
    setReferralEmails([...referralEmails, ''])
  }

  const updateEmail = (index: number, email: string) => {
    const updated = [...referralEmails]
    updated[index] = email
    setReferralEmails(updated)
  }

  const removeEmail = (index: number) => {
    if (referralEmails.length > 1) {
      const updated = referralEmails.filter((_, i) => i !== index)
      setReferralEmails(updated)
    }
  }

  const handleSubmitReferrals = async () => {
    const validEmails = referralEmails.filter(email => 
      email.trim() && email.includes('@') && email.includes('.')
    )
    
    if (validEmails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter at least one valid email address to refer someone.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call to submit referrals
    setTimeout(() => {
      toast({
        title: "Referrals submitted!",
        description: `Thank you! We've sent invites to ${validEmails.length} email${validEmails.length > 1 ? 's' : ''}. You'll earn a $100 gift card for each person who completes their first payment.`,
      })
      setIsSubmitting(false)
      setReferralEmails([''])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
              <CheckIcon className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Payment Submitted Successfully!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Thank you for using Crebit! We've received your payment notification and will update you via email on the status of your transfer.
            </p>
          </div>

          {/* Status Updates Info */}
          <Card className="mb-8 shadow-card border-0 border-l-4 border-l-success">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <EmailIcon className="w-6 h-6 text-primary" />
                <span>What Happens Next?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <EmailIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Email Updates</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Payment received confirmation</li>
                    <li>• Processing status updates</li>
                    <li>• Delivery confirmation</li>
                    <li>• Tracking information</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <ClockIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Timeline</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Payment verification: 1-2 hours</li>
                    <li>• Processing: 2-4 hours</li>
                    <li>• Check delivery: 5-7 business days</li>
                    <li>• Bank transfer: Within 3 hours</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Referral Program */}
          <Card className="shadow-card border-0 border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GiftIcon className="w-6 h-6 text-primary" />
                <span>Earn $100 Gift Cards - Refer Friends!</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Help other students save on tuition payments and earn $100 gift cards for each successful referral
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* How it works */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-3">How it works:</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-bold">1.</span>
                    <p className="text-muted-foreground">Enter your friends' email addresses below</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-bold">2.</span>
                    <p className="text-muted-foreground">They receive an invite to try Crebit</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-bold">3.</span>
                    <p className="text-muted-foreground">You get a $100 gift card when they complete their first payment</p>
                  </div>
                </div>
              </div>

              {/* Email inputs */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Refer Friends & Family</Label>
                {referralEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="friend@email.com"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="flex-1"
                    />
                    {referralEmails.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeEmail(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addEmailField}>
                    + Add Another Email
                  </Button>
                  <Button 
                    onClick={handleSubmitReferrals}
                    disabled={isSubmitting}
                    className="ml-auto"
                  >
                    {isSubmitting ? "Sending Invites..." : "Send Referral Invites"}
                  </Button>
                </div>
              </div>

              {/* Gift card options */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Gift Card Options:</strong> Amazon, Apple, Google Play, Visa, Target, Starbucks, and many more!
                  You'll choose your preferred gift card when your referral completes their first payment.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/track">Track My Payment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Make Another Payment</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:jensen@getcrebit.com">Contact Support</a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentComplete