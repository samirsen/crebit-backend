import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useState } from "react";
import { X } from "lucide-react";
import Index from "./pages/Index";
import TuitionPayments from "./pages/TuitionPayments";
import Quote from "./pages/Quote";
import GetStarted from "./pages/GetStarted";
import GetStartedMexico from "./pages/GetStarted Mexico";
import CountrySelection from "./pages/CountrySelection";
import Track from "./pages/Track";
import HowItWorks from "./pages/HowItWorks";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PaymentAuthorization from "./pages/PaymentAuthorization";
import PaymentComplete from "./pages/PaymentComplete";
import Compliance from "./pages/Compliance";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SignUpStage1 from "./pages/SignUpStage1";
import ScholarshipEligibility from "./pages/ScholarshipEligibility";
import ScholarshipSearch from "./pages/ScholarshipSearch";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignupNew from "./pages/SignupNew";

const queryClient = new QueryClient();

// Payment completion and referral page route
const App = () => {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-white">
            <Toaster />
            <Sonner />
            
            {/* AWS Downtime Banner */}
            {showBanner && (
              <div className="fixed top-16 left-0 right-0 z-40 bg-red-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <h3 className="font-bold text-lg">Service Temporarily Unavailable</h3>
                      </div>
                      <p className="text-sm mb-1">
                        We're currently experiencing technical difficulties due to an AWS outage. Transactions are temporarily paused.
                      </p>
                      <p className="text-sm font-semibold">
                        ✓ Any transactions already in progress will be completed automatically once AWS services are restored.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBanner(false)}
                      className="flex-shrink-0 p-1 hover:bg-red-700 rounded transition-colors"
                      aria-label="Close banner"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <BrowserRouter>
          <Routes>
          <Route path="/" element={<TuitionPayments />} />
          <Route path="/tuition-payments" element={<TuitionPayments />} />
          <Route path="/scholarships" element={<Index />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/country-selection" element={<CountrySelection />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/get-started-mexico" element={<GetStartedMexico />} />
          <Route path="/track" element={<Track />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/payment-authorization" element={<PaymentAuthorization />} />
          <Route path="/payment-complete" element={<PaymentComplete />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/signup" element={<SignupNew />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup-old" element={<SignUp />} />
          <Route path="/signup-stage1" element={<SignUpStage1 />} />
          <Route path="/scholarship-eligibility" element={<ScholarshipEligibility />} />
          <Route path="/scholarship-search" element={<ScholarshipSearch />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </div>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
