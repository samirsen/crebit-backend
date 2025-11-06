import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ForeignExchangeHero from "@/components/sections/ForeignExchangeHero"
import SupportedCountries from "@/components/sections/SupportedCountries"
import CTASection from "@/components/sections/CTASection"
import ContactSection from "@/components/sections/ContactSection"
import ScholarshipHero from "@/components/sections/ScholarshipHero"
import WhyCrebitDifferent from "@/components/sections/WhyCrebitDifferent"
import SmartApplicationTools from "@/components/sections/SmartApplicationTools"
import CollegeLogosSlider from "@/components/sections/CollegeLogosSlider"
import ScholarshipStats from "@/components/sections/ScholarshipStats"
import FounderStory from "@/components/sections/FounderStory"
import ServicesOverview from "@/components/sections/ServicesOverview"
import CollegeJourneyCTA from "@/components/sections/CollegeJourneyCTA"
import StartAnywhereSection from "@/components/sections/StartAnywhereSection"
import FeaturesSection from "@/components/sections/FeaturesSection"
import AmbassadorsSection from "@/components/sections/AmbassadorsSection"
import SendMoneyStepsSection from "@/components/sections/SendMoneyStepsSection"
import ComplianceSection from "@/components/sections/ComplianceSection"
import PayTuitionAbroad from "@/components/sections/PayTuitionAbroad"
import TestimonialSection from "@/components/sections/TestimonialSection"

const TuitionPayments = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ForeignExchangeHero />
        <CollegeLogosSlider />
        <StartAnywhereSection />
        <FeaturesSection />
        <PayTuitionAbroad />
        <TestimonialSection />
        
        <FounderStory />
        
        <SendMoneyStepsSection />
        
       
        
      </main>
      <Footer />
    </div>
  );
};

export default TuitionPayments;
