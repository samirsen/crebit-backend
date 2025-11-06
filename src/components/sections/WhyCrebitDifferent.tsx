import { Button } from "@/components/ui/button"
import { Eye, MapPin, Shield, TrendingDown } from "lucide-react"
import React, { useEffect, useRef, useState } from 'react'

const WhyCrebitDifferent = () => {
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
  const features = [
    {
      id: 1,
      title: "Transparent FX",
      description: "We provide live exchange rates and guaranteed conversions, eliminating hidden spreads and surprise markups that banks and processors often charge.",
      bgColor: "bg-[#17484A]",
      textColor: "text-white",
      icon: Eye
    },
    {
      id: 2,
      title: "Start Anywhere",
      description: "Our platform supports localized pay-ins like Brazil's Pix, Mexico's SPEI, and India's UPI — so families and businesses can fund payments directly in their own currency.",
      bgColor: "bg-gray-200",
      textColor: "text-gray-800",
      icon: MapPin
    },
    {
      id: 3,
      title: "Built for Trust",
      description: "No prop trading, no hidden fees, no surprises. Crebit is engineered for clarity and compliance, ensuring every transaction is safe and auditable. We are avaliable 24/7 at our support line to answer any questions or concerns.",
      bgColor: "bg-[#17484A]",
      textColor: "text-white",
      icon: Shield
    },
    {
      id: 4,
      title: "Best Rates",
      description: "From tuition bills to merchant invoices, Crebit uses stablecoin rails to reduce FX costs by ~4% per payment — while enabling payouts even to non-G12 countries like Israel, Nigeria, and the Philippines.",
      bgColor: "bg-gray-200",
      textColor: "text-gray-800",
      icon: TrendingDown
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        }`}>
          <p className="text-sm text-gray-600 mb-4" style={{fontFamily: "'Inter', sans-serif !important", fontWeight: "700 !important"}}>
            Go Further
          </p>
          <h2 className="text-4xl lg:text-5xl text-foreground mb-6" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
            Why Crebit is Different
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" style={{fontFamily: "'Inter', sans-serif !important"}}>
            Traditional options fall short. Crebit helps users save thousands of dollars on their international payments.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`${feature.bgColor} ${feature.textColor} p-8 rounded-2xl relative overflow-hidden min-h-[280px] flex flex-col justify-between transition-all duration-1000 ease-in-out hover:scale-105 cursor-pointer ${
                isVisible 
                  ? 'opacity-100 transform translate-y-0 scale-100' 
                  : 'opacity-0 transform translate-y-16 scale-95'
              }`}
              style={{ 
                transitionDelay: isVisible ? `${200 + index * 150}ms` : '0ms'
              }}
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                  <feature.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  {feature.description}
                </p>
              </div>

              {/* Bottom Icon */}
              <div className="mt-6">
                <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCrebitDifferent;
