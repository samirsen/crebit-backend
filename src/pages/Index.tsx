import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ScholarshipHero from "@/components/sections/ScholarshipHero"
import WhyCrebitDifferent from "@/components/sections/WhyCrebitDifferent"
import SmartApplicationTools from "@/components/sections/SmartApplicationTools"
import CollegeLogosSlider from "@/components/sections/CollegeLogosSlider"
import ScholarshipStats from "@/components/sections/ScholarshipStats"
import FounderStory from "@/components/sections/FounderStory"
import ServicesOverview from "@/components/sections/ServicesOverview"
import ContactSection from "@/components/sections/ContactSection"
import CollegeJourneyCTA from "@/components/sections/CollegeJourneyCTA"
import PayTuitionAbroad from "@/components/sections/PayTuitionAbroad"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
     
        
        
      <SmartApplicationTools />
      
        
        
        <WhyCrebitDifferent />
        <CollegeLogosSlider />
        <PayTuitionAbroad />
        <FounderStory />
        <CollegeJourneyCTA/>
        
      
      <Footer />
    </div>
  );
};

export default Index;
