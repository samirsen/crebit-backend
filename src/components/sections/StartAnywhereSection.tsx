import mariaImage from '@/assets/Maria.png';
import AnimatedSection from '@/components/ui/AnimatedSection';

const StartAnywhereSection = () => {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-16" style={{backgroundColor: '#fffbe5'}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <AnimatedSection animation="slideRight" delay={0.2}>
            <div className="space-y-6 text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-[#0C3E3F]" style={{fontFamily: "'Obviously', sans-serif", fontWeight: '900'}}>
                Start Anywhere
              </h2>
              
              <div className="space-y-4 text-2xl lg:text-3xl text-[#0C3E3F]" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                <p>
                  Crebit supports localized pay-ins like Brazil's Pix, Mexico's SPEI, Colombia's PSE, Ghana's Mobile Money, and Nigeria's NIP.
                </p>
                
                <p>
                  Families and businesses can fund payments in their own currency.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Side - Maria Image */}
          <AnimatedSection animation="slideLeft" delay={0.4}>
            <div className="flex justify-center lg:justify-end">
              <img 
                src={mariaImage} 
                alt="Maria using Crebit for textbook payment"
                className="w-full max-w-lg lg:max-w-xl h-auto object-contain"
              />
            </div>
          </AnimatedSection>
          
        </div>
      </div>
    </section>
  );
};

export default StartAnywhereSection;
