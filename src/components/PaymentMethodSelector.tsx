import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: 'check' | 'bank-account', data?: any) => void;
  existingBankAccounts?: BankAccount[];
  showExistingAccounts?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onMethodSelect,
  existingBankAccounts = [],
  showExistingAccounts = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'check' | 'bank-account' | null>(null);
  const [bankAccountOption, setBankAccountOption] = useState<'existing' | 'new' | null>(null);
  const [selectedExistingAccount, setSelectedExistingAccount] = useState<string>('');
  const [newBankData, setNewBankData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    bankStreetAddress: '',
    bankCity: '',
    bankState: '',
    bankZipCode: ''
  });

  const handleMethodSelection = (method: 'check' | 'bank-account') => {
    setSelectedMethod(method);
    if (method === 'check') {
      onMethodSelect('check');
    }
  };

  const handleBankAccountContinue = () => {
    if (bankAccountOption === 'existing' && selectedExistingAccount) {
      const account = existingBankAccounts.find(acc => acc.id === selectedExistingAccount);
      onMethodSelect('bank-account', { type: 'existing', account });
    } else if (bankAccountOption === 'new') {
      onMethodSelect('bank-account', { type: 'new', data: newBankData });
    }
  };

  const isNewBankDataValid = () => {
    return newBankData.accountHolderName && 
           newBankData.bankName && 
           newBankData.accountNumber && 
           newBankData.routingNumber &&
           newBankData.bankStreetAddress &&
           newBankData.bankCity &&
           newBankData.bankState &&
           newBankData.bankZipCode;
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Choose Payment Method</CardTitle>
        <p className="text-sm text-gray-600">
          Select how you'd like us to deliver your payment
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Method Selection - Single Option */}
          <div className="max-w-md mx-auto">
            {/* Bank Account Transfer */}
            <div 
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === "bank-account" 
                  ? "border-[#17484A] bg-[#17484A]/5" 
                  : "border-muted hover:border-[#17484A]/50"
              }`}
              onClick={() => handleMethodSelection("bank-account")}
            >
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg text-foreground mb-2 font-semibold">
                    USD to Your US Bank Account
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Fast and secure payment to your US bank account
                  </p>
                  <div className="space-y-2 text-left text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#17484A] rounded-full" />
                      <span>USD sent directly to your bank account</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#17484A] rounded-full" />
                      <span>Processing time: Less than 1 hour</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#17484A] rounded-full" />
                      <span>You can then pay the school via ACH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Options */}
          {selectedMethod === "bank-account" && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg text-foreground font-semibold">Bank Account Options</h3>
              
              <div className="space-y-4">
                {/* Existing Account Option */}
                {showExistingAccounts && existingBankAccounts.length > 0 && (
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      bankAccountOption === "existing" 
                        ? "border-[#17484A] bg-[#17484A]/5" 
                        : "border-gray-200 hover:border-[#17484A]/50"
                    }`}
                    onClick={() => setBankAccountOption("existing")}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        checked={bankAccountOption === "existing"} 
                        onChange={() => setBankAccountOption("existing")}
                        className="text-[#17484A]"
                      />
                      <div>
                        <h4 className="font-medium">Use Existing Bank Account</h4>
                        <p className="text-sm text-gray-600">Select from your saved bank accounts</p>
                      </div>
                    </div>
                    
                    {bankAccountOption === "existing" && (
                      <div className="mt-4">
                        <Label htmlFor="existingAccount">Select Bank Account</Label>
                        <Select value={selectedExistingAccount} onValueChange={setSelectedExistingAccount}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Choose an existing account" />
                          </SelectTrigger>
                          <SelectContent>
                            {existingBankAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.bankName} - {account.accountHolderName} (****{account.accountNumber.slice(-4)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* New Account Option */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    bankAccountOption === "new" 
                      ? "border-[#17484A] bg-[#17484A]/5" 
                      : "border-gray-200 hover:border-[#17484A]/50"
                  }`}
                  onClick={() => setBankAccountOption("new")}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      checked={bankAccountOption === "new"} 
                      onChange={() => setBankAccountOption("new")}
                      className="text-[#17484A]"
                    />
                    <div>
                      <h4 className="font-medium">Add New Bank Account</h4>
                      <p className="text-sm text-gray-600">Enter new bank account details</p>
                    </div>
                  </div>
                  
                  {bankAccountOption === "new" && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="accountHolderName">Account Holder Name</Label>
                          <Input
                            id="accountHolderName"
                            value={newBankData.accountHolderName}
                            onChange={(e) => setNewBankData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                            placeholder="Enter account holder's full name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={newBankData.bankName}
                            onChange={(e) => setNewBankData(prev => ({ ...prev, bankName: e.target.value }))}
                            placeholder="Enter bank name (e.g. Chase, Bank of America)"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            value={newBankData.routingNumber}
                            onChange={(e) => setNewBankData(prev => ({ ...prev, routingNumber: e.target.value }))}
                            placeholder="9-digit routing number"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={newBankData.accountNumber}
                            onChange={(e) => setNewBankData(prev => ({ ...prev, accountNumber: e.target.value }))}
                            placeholder="Enter account number"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Bank Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="bankStreetAddress">Street Address</Label>
                            <Input
                              id="bankStreetAddress"
                              value={newBankData.bankStreetAddress}
                              onChange={(e) => setNewBankData(prev => ({ ...prev, bankStreetAddress: e.target.value }))}
                              placeholder="Enter bank's street address"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bankCity">City</Label>
                            <Input
                              id="bankCity"
                              value={newBankData.bankCity}
                              onChange={(e) => setNewBankData(prev => ({ ...prev, bankCity: e.target.value }))}
                              placeholder="Enter city"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bankState">State</Label>
                            <Input
                              id="bankState"
                              value={newBankData.bankState}
                              onChange={(e) => setNewBankData(prev => ({ ...prev, bankState: e.target.value }))}
                              placeholder="Enter state"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bankZipCode">ZIP Code</Label>
                            <Input
                              id="bankZipCode"
                              value={newBankData.bankZipCode}
                              onChange={(e) => setNewBankData(prev => ({ ...prev, bankZipCode: e.target.value }))}
                              placeholder="Enter ZIP code"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              {bankAccountOption && (
                <div className="pt-4">
                  <Button 
                    onClick={handleBankAccountContinue}
                    disabled={
                      (bankAccountOption === 'existing' && !selectedExistingAccount) ||
                      (bankAccountOption === 'new' && !isNewBankDataValid())
                    }
                    className="w-full bg-[#17484A] hover:bg-[#17484A]/90 text-white"
                  >
                    Continue with Bank Account
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
