import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QuoteResult } from "@/types/payment"

interface QuoteDisplayProps {
  quote: QuoteResult | null;
  deliveryMethod: string;
  studentFullName?: string;
  studentId?: string;
  schoolName?: string;
  amountUSD?: string;
}

export const QuoteDisplay = ({
  quote,
  deliveryMethod,
  studentFullName,
  studentId,
  schoolName,
  amountUSD
}: QuoteDisplayProps) => {
  if (!quote) return null;

  const totals = {
    fxMarkup: quote.total_fees_usd,
    totalLocalAmount: quote.total_local_amount,
    amountUSD: quote.amount_usd,
    exchangeRate: quote.effective_rate,
    onRampRate: parseFloat(quote.on_ramp.quotation.toString()),
    offRampRate: parseFloat(quote.off_ramp.quotation.toString()),
    effectiveRate: quote.effective_rate,
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Your Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveryMethod === 'check-to-school' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Student Name:</span>
                <span>{studentFullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Student ID:</span>
                <span>{studentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>School Name:</span>
                <span>{schoolName || 'N/A'}</span>
              </div>
              <Separator className="my-2" />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount to Send (USD):</span>
              <span>${parseFloat(amountUSD || '0').toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>FX Rate (BRL/USD):</span>
              <span>{totals.effectiveRate.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>FX Markup:</span>
              <span>${totals.fxMarkup.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Amount in BRL:</span>
              <span>R$ {totals.totalLocalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>Quote expires on: {quote.expires_at_readable}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteDisplay;
