import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { formatCountdown } from "@/services/paymentService"

interface PaymentAuthorizationProps {
  onAuthorize: () => Promise<void>;
  onBack: () => void;
  countdownSeconds: number;
  setCountdownSeconds: (seconds: number) => void;
  paymentMethod: string;
  schoolName?: string;
  studentFullName?: string;
  amountUSD?: string;
}

export const PaymentAuthorization = ({
  onAuthorize,
  onBack,
  countdownSeconds,
  setCountdownSeconds,
  paymentMethod,
  schoolName,
  studentFullName,
  amountUSD
}: PaymentAuthorizationProps) => {
  const [authorizationAgreed, setAuthorizationAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (countdownSeconds > 0) {
      interval = setInterval(() => {
        setCountdownSeconds(prev => prev - 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [countdownSeconds, setCountdownSeconds])

  const handleAuthorization = async () => {
    if (!authorizationAgreed) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must agree to the authorization to proceed.",
      })
      return
    }

    setIsLoading(true)
    try {
      await onAuthorize()
    } catch (error) {
      console.error('Authorization error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process authorization',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Payment Authorization</h2>
        
        <div className="space-y-2">
          <p className="font-medium">You are authorizing the following payment:</p>
          <div className="pl-4 space-y-1">
            {schoolName && studentFullName && (
              <p>School: {schoolName} (Student: {studentFullName})</p>
            )}
            <p>Amount: ${parseFloat(amountUSD || '0').toFixed(2)} USD</p>
            <p>Payment Method: {paymentMethod === 'pix' ? 'PIX' : 'Bank Transfer'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium">By checking this box, you authorize:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Us to process your payment according to the quoted exchange rate and fees</li>
            <li>The debiting of your account for the specified amount</li>
            <li>Us to share your information with our payment processors as needed</li>
          </ul>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="authorization" 
            checked={authorizationAgreed}
            onCheckedChange={(checked) => setAuthorizationAgreed(checked === true)}
          />
          <Label htmlFor="authorization" className="text-sm font-medium">
            I authorize this payment and agree to the terms above
          </Label>
        </div>

        <div className="pt-2 text-sm text-muted-foreground">
          <p>Quote expires in: <span className="font-mono">{formatCountdown(countdownSeconds)}</span></p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button 
          onClick={handleAuthorization} 
          disabled={!authorizationAgreed || isLoading}
        >
          {isLoading ? 'Processing...' : 'Authorize Payment'}
        </Button>
      </div>
    </div>
  )
}

export default PaymentAuthorization
