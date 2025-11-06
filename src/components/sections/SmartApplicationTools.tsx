import React, { useEffect, useRef, useState } from 'react';

const SmartApplicationTools = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '-50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`flex justify-between items-end mb-16 transition-all duration-1000 ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        }`}>
          <div className="max-w-lg">
            <p className="text-sm text-[#17484A] mb-6 font-medium" style={{fontFamily: "'Inter', sans-serif !important", fontWeight: "700 !important"}}>
              Smart Features
            </p>
            <h2 className="text-4xl lg:text-5xl text-foreground mb-6" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
            Transparent. Fast. Borderless.
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-base text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
            The Future of Cross-Border Payments.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-6">
          {/* Top Row - Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mentorship Card */}
            <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform -translate-x-16'
            }`} style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
              <div className="h-32 bg-gray-50">
                <img 
                  src="/smartMentorship.png" 
                  alt="Mentorship illustration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-3" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
                Flexible Payment Methods
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                You don’t need a U.S. bank account to pay tuition or invoices—we’ll mail a check or process ACH directly on your behalf.

Already have a U.S. account? We can convert and send funds straight into it.
                </p>
              </div>
            </div>

            {/* Scholarship Search Card */}
            <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform -translate-y-16'
            }`} style={{ transitionDelay: isVisible ? '400ms' : '0ms' }}>
              <div className="h-32 bg-gray-50">
                <img 
                  src="/smartScholarship.png" 
                  alt="Scholarship search illustration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-3" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
                Localized Pay-Ins
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                Accept and send payments from anywhere using local methods like Brazil’s Pix or Mexico’s SPEI. Whether it’s tuition, invoices, or merchant transactions, customers can pay in their own currency, and we handle the conversion.
                </p>
              </div>
            </div>

            {/* Modern Dashboards Card */}
            <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform translate-x-16'
            }`} style={{ transitionDelay: isVisible ? '600ms' : '0ms' }}>
              <div className="h-32 bg-gray-50">
                <img 
                  src="/smartDashboard.png" 
                  alt="Modern dashboards illustration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-3" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
                  Smart Dashboards
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                Track every payment in one place with clear dashboards showing conversion rates, savings vs. banks, and settlement status. Full visibility from pay-in to payout.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row - Two Large Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crebit Academy Card */}
            <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 transform translate-x-0 scale-100' 
                : 'opacity-0 transform -translate-x-20 scale-95'
            }`} style={{ transitionDelay: isVisible ? '800ms' : '0ms' }}>
              <div className="h-48 bg-gray-50">
                <img 
                  src="/smartLesson.png" 
                  alt="Crebit Academy illustration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl mb-4" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
                  Settlement Speed
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                Where banks can take 5+ days for international transactions, Crebit settles funds within 1 business day.
                </p>
              </div>
            </div>

            {/* International Tuition Payments Card */}
            <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 transform translate-x-0 scale-100' 
                : 'opacity-0 transform translate-x-20 scale-95'
            }`} style={{ transitionDelay: isVisible ? '1000ms' : '0ms' }}>
              <div className="h-48 bg-gray-50">
                <img 
                  src="/smartPayment.png" 
                  alt="International tuition payments illustration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl mb-4" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
                Transparent FX Quotes
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                See live foreign exchange rates before you pay. Our platform shows you exactly how much USD your local currency delivers—no hidden markups, no surprise fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartApplicationTools;
