import transferBRL from '../../assets/transferBRL.png';
import transferMXN from '../../assets/transferMXN.png';
import moreSoon from '../../assets/moreSoon.png';
import AnimatedSection from '@/components/ui/AnimatedSection';

const SendMoneyStepsSection = () => {
  return (
    <section className="pt-4 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-8 lg:p-12" style={{backgroundColor: '#138889', border: '8px solid white'}}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Side - Title */}
          <AnimatedSection animation="slideRight" delay={0.1}>
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                Send money to<br />the U.S. in 3 steps
              </h2>
            </div>
          </AnimatedSection>

          {/* Right Side - Steps */}
          <div className="space-y-6">
            
            {/* Step 1 */}
            <AnimatedSection animation="slideLeft" delay={0.2}>
              <div className="bg-[#0F6B6C] rounded-2xl p-6 border-2 border-[#FFD700]">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-white" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                    1
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                      Start with Crebit
                    </h3>
                    <p className="text-sm leading-relaxed" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400", color: "#FFF7CA"}}>
                      Open Crebit, choose "Send Money," and enter the amount. You can pay as a guest, or create an account to track history and unlock more features.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Step 2 */}
            <AnimatedSection animation="slideLeft" delay={0.4}>
              <div className="bg-[#0F6B6C] rounded-2xl p-6 border-2 border-[#FFD700]">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-white" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                    2
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                      Pay in your local currency
                    </h3>
                    <p className="text-sm leading-relaxed" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400", color: "#FFF7CA"}}>
                      Send the funds using the method you already use — Pix in Brazil, Mobile Money in Ghana/Nigeria, SPEI in Mexico, or a bank transfer in Colombia.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Step 3 */}
            <AnimatedSection animation="slideLeft" delay={0.6}>
              <div className="bg-[#0F6B6C] rounded-2xl p-6 border-2 border-[#FFD700]">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-white" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                    3
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
                      Receive USD in the U.S.
                    </h3>
                    <p className="text-sm leading-relaxed" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "400", color: "#FFF7CA"}}>
                      Crebit delivers your money in U.S. dollars, whether paying a biller by check, funding a loan, or sending to a U.S. bank account. Transfers arrive in 1 hour or by the next business day.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>

        {/* Currency Transfer Buttons */}
        <div className="mt-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Brazil */}
            <a href="/get-started" className="hover:opacity-80 transition-opacity block">
              <img src={transferBRL} alt="Transfer BRL" className="w-full h-auto rounded-2xl" />
            </a>

            {/* Mexico */}
            <a href="/get-started-mexico" className="hover:opacity-80 transition-opacity block">
              <img src={transferMXN} alt="Transfer MXN" className="w-full h-auto rounded-2xl" />
            </a>

            {/* Coming Soon */}
            <div className="opacity-60">
              <img src={moreSoon} alt="More coming soon" className="w-full h-auto rounded-2xl" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SendMoneyStepsSection;
