import React from 'react';
import teamPhoto from '@/assets/team-photo.png';
import AnimatedSection from '@/components/ui/AnimatedSection';

const FounderStory = () => {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-16" style={{
      borderRadius: '20px',
      border: '4px solid #F1F1F1',
      background: 'radial-gradient(107.22% 107.22% at 50% -3.38%, #0F989B 0%, #054E50 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Team Photo with Caption */}
          <AnimatedSection animation="flipIn" delay={0.3}>
            <div className="order-2 lg:order-1">
              <div className="relative">
                <img 
                  src={teamPhoto} 
                  alt="Crebit Founders: Jensen Coonradt and Simmi Sen"
                  className="w-full h-auto"
                  style={{
                    borderRadius: '17.328px',
                    background: `url(${teamPhoto}) lightgray 50% / cover no-repeat`
                  }}
                />
                <div className="text-center mt-4">
                  <p className="text-sm text-white" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
                    <strong>Crebit Founders:</strong> Jensen Coonradt and Simmi Sen
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Side - Content */}
          <AnimatedSection animation="slideRight" delay={0.1}>
            <div className="order-1 lg:order-2 space-y-6 text-left">
              <h2 style={{
                color: '#FFF',
                fontFamily: 'Obviously',
                fontSize: '42px',
                fontStyle: 'normal',
                fontWeight: 560,
                lineHeight: '100%',
                letterSpacing: '-0.84px',
                textAlign: 'left'
              }}>
                Why we started Crebit
              </h2>
              
              <div className="space-y-6" style={{
                color: '#FFF',
                fontFamily: "'Satoshi Variable', sans-serif",
                fontSize: '21px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                letterSpacing: '-0.42px'
              }}>
                <p>
                  We saw our classmates at Stanford and MIT paying thousands in hidden fees to pay their tuition. We built Crebit to make foreign exchange cheaper, faster, and easier.
                </p>
                <p>
                  Backed by $450K in funding, we're on a mission to help students keep more of their money.
                </p>
              </div>
              
              <button 
                className="bg-[#0C3E3F] text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-[#0A3334] transition-colors"
                style={{fontFamily: "'Satoshi Variable', sans-serif"}}
                onClick={() => window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ', '_blank')}
              >
                Book a Call With Us
              </button>
            </div>
          </AnimatedSection>
          
        </div>
      </div>
    </section>
  );
};

export default FounderStory;
