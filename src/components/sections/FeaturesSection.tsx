import moveIcon from '@/assets/move.png';
import rateIcon from '@/assets/rate.png';
import clockIcon from '@/assets/clock.png';
import ambassadorsImage from '@/assets/ambassadors.png';
import AnimatedSection from '@/components/ui/AnimatedSection';

const FeaturesSection = () => {
  return (
    <section className="pt-16 pb-16 px-4 sm:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Fast, reliable transfers */}
          <AnimatedSection animation="scaleUp" delay={0.1}>
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <img src={moveIcon} alt="Fast transfers" className="w-16 h-16" />
              </div>
              <h3 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'Satoshi',
                  fontSize: '30px',
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  lineHeight: '120%',
                  letterSpacing: '-2.4px'
                }}
              >
                Fast, reliable transfers
              </h3>
              <p className="text-gray-600 text-lg" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                Most payments take 1 hour on a business day, even large tuition and invoices, so you never miss a deadline.
              </p>
            </div>
          </AnimatedSection>

          {/* Best rates, every time */}
          <AnimatedSection animation="scaleUp" delay={0.3}>
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <img src={rateIcon} alt="Best rates" className="w-16 h-16" />
              </div>
              <h3 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'Satoshi',
                  fontSize: '30px',
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  lineHeight: '120%',
                  letterSpacing: '-2.4px'
                }}
              >
                Best rates, every time
              </h3>
              <p className="text-gray-600 text-lg" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                Near-perfect exchange rates, reducing costs up to 7% compared to traditional providers.
              </p>
            </div>
          </AnimatedSection>

          {/* 24/7/365 Support */}
          <AnimatedSection animation="scaleUp" delay={0.5}>
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <img src={clockIcon} alt="24/7 Support" className="w-16 h-16" />
              </div>
              <h3 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'Satoshi',
                  fontSize: '30px',
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  lineHeight: '120%',
                  letterSpacing: '-2.4px'
                }}
              >
                24/7/365 Support
              </h3>
              <p className="text-gray-600 text-lg" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                Our team is available by SMS, email, or phone. We can even setup a live video call during your transaction!
              </p>
            </div>
          </AnimatedSection>

        </div>
        
       
        
      </div>
    </section>
  );
};

export default FeaturesSection;
