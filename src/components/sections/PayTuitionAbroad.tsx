import React from 'react'
import momKidsImage from "@/assets/momKids.png"
import AnimatedSection from '@/components/ui/AnimatedSection'

const PayTuitionAbroad: React.FC = () => {
  return (
    <section 
      className="py-16 px-4"
      style={{
        background: '#003233',
        boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <AnimatedSection animation="slideLeft" delay={0.2}>
            <div className="relative">
              <div className="relative ">
                <img 
                  src={momKidsImage} 
                  alt="Family paying tuition abroad" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Content Section */}
          <AnimatedSection animation="fadeIn" delay={0.4}>
            <div className="space-y-6 text-center">
              <h2 className="text-4xl lg:text-5xl font-bold" style={{fontFamily: "'Obviously', sans-serif", fontWeight: '900', color: '#FFFFF6'}}>
                Pay Tuition Abroad
              </h2>
              
              <div className="space-y-4 text-2xl lg:text-3xl" style={{fontFamily: "'Satoshi Variable', sans-serif", color: '#FFFFF6'}}>
                <p>
                  Families around the world use Crebit to pay their child's university tuition.
                </p>
                
                <p>
                  With faster transfers and better rates than Wise and Flywire, Crebit makes paying for education abroad simple and affordable.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

export default PayTuitionAbroad
