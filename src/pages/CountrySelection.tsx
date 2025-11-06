import { Button } from "@/components/ui/button"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useNavigate } from "react-router-dom"
import transferBRL from '@/assets/transferBRL.png';
import transferMXN from '@/assets/transferMXN.png';
import moreSoon from '@/assets/moreSoon.png';

const CountrySelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{backgroundColor: '#138889'}}>
      <Header />
      
      <main className="pt-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
              Send money to the U.S. in 3 steps
            </h1>
            <p className="text-lg text-[#FFF7CA] max-w-3xl mx-auto" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400"}}>
              Choose your country to get started with the fastest and cheapest way to send money to the United States.
            </p>
          </div>

          {/* Horizontal Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Step 1 */}
            <div className="bg-[#0F6B6C] rounded-2xl p-6 border-2 border-[#FFD700]">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                  Start with Crebit
                </h3>
                <p className="text-sm leading-relaxed" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400", color: "#FFF7CA"}}>
                  Open Crebit, choose "Send Money," and enter the amount. You can pay as a guest, or create an account to track history and unlock more features.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0F6B6C] rounded-2xl p-6 border-2 border-[#FFD700]">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                  2
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                  Pay in your local currency
                </h3>
                <p className="text-sm leading-relaxed" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400", color: "#FFF7CA"}}>
                  Send the funds using the method you already use — Pix in Brazil, Mobile Money in Ghana/Nigeria, SPEI in Mexico, or a bank transfer in Colombia.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0F6B6C] rounded-2xl p-6 border-2 border-[#FFD700]">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                  3
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                  Receive USD in the U.S.
                </h3>
                <p className="text-sm leading-relaxed" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400", color: "#FFF7CA"}}>
                  Crebit delivers your money in U.S. dollars, whether paying a biller by check, funding a loan, or sending to a U.S. bank account. Transfers arrive in 1 hour or by the next business day.
                </p>
              </div>
            </div>

          </div>

          {/* Country Selection Section - Integrated */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
              Select Your Country
            </h2>
            <p className="text-lg text-[#FFF7CA] mb-8" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400"}}>
              Choose your country to start sending money with the best rates and fastest delivery times.
            </p>

            {/* Country Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-3xl mx-auto">
              
              {/* Brazil */}
              <div 
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => navigate('/get-started')}
              >
                <img src={transferBRL} alt="Send money from Brazil" className="w-full h-auto rounded-2xl shadow-lg" />
              </div>

              {/* Mexico */}
              <div 
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => navigate('/get-started-mexico')}
              >
                <img src={transferMXN} alt="Send money from Mexico" className="w-full h-auto rounded-2xl shadow-lg" />
              </div>

              {/* Coming Soon */}
              <div className="opacity-60">
                <img src={moreSoon} alt="More countries coming soon" className="w-full h-auto rounded-2xl shadow-lg" />
              </div>

            </div>

            {/* Additional Info - Simplified */}
            <div className="mt-8 text-center">
              <p className="text-[#FFF7CA]" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400"}}>
                Don't see your country? More payment methods coming soon!
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CountrySelection;
