import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

export interface PixPaymentProps {
  pixCode: string;
  qrCodeUrl: string;
  amountBrl: number;
  expirationTime: string;
  onBack: () => void;
  onPaymentComplete: () => void;
}

export const PixPayment = ({
  pixCode,
  qrCodeUrl,
  amountBrl,
  expirationTime,
  onBack,
  onPaymentComplete
}: PixPaymentProps) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  // Format the expiration time for display
  const formatExpirationTime = (expirationTime: string) => {
    const date = new Date(expirationTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle copy to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "PIX code copied to clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Update countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiration = new Date(expirationTime).getTime();
      const now = new Date().getTime();
      const difference = expiration - now;
      
      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(minutes * 60 + seconds);
      } else {
        setTimeLeft(0);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    
    return () => clearInterval(timer);
  }, [expirationTime]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">PIX Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg font-medium">Amount to pay:</p>
          <p className="text-3xl font-bold text-primary">R$ {amountBrl.toFixed(2)}</p>
          
          {timeLeft > 0 ? (
            <p className="text-sm text-muted-foreground mt-2">
              Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          ) : (
            <p className="text-sm text-destructive font-medium mt-2">This PIX code has expired</p>
          )}
        </div>

        <div className="flex flex-col items-center space-y-4">
          {qrCodeUrl ? (
            <div className="p-4 border rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="PIX QR Code" 
                className="w-64 h-64 object-contain"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted/50 flex items-center justify-center rounded-lg">
              <p className="text-muted-foreground text-center p-4">
                Scan the QR code with your banking app to complete the payment
              </p>
            </div>
          )}

          <div className="w-full max-w-md">
            <p className="text-sm font-medium mb-2">Or copy the PIX code:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted/50 rounded-md font-mono text-sm overflow-x-auto">
                {pixCode}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyCode}
                className="font-satoshi font-medium"
                style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[#17484A]/10 p-4 rounded-lg text-sm text-[#17484A]">
          <h4 className="font-medium mb-2">How to pay with PIX:</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Open your banking app and select PIX payment</li>
            <li>Choose to pay by copying the code or scanning the QR code</li>
            <li>Confirm the payment details and complete the transaction</li>
            <li>Your payment will be processed automatically</li>
          </ol>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}>
            Back
          </Button>
          <Button onClick={onPaymentComplete} style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}>
            I've completed the payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixPayment;
