import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const ScholarshipHero = () => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const fullText = "Without Debt";
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Keep cursor blinking for a bit after typing is done
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 100);

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);
  return (
    <section className="relative py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl text-foreground leading-tight font-bold">
                <div style={{fontFamily: "'Test Tiempos Fine', 'Times New Roman Local', 'Times New Roman', serif !important", fontWeight: "700 !important"}}>
                  The Platform for
                </div>
                <div style={{fontFamily: "'Test Tiempos Fine', 'Times New Roman Local', 'Times New Roman', serif !important", fontWeight: "700 !important"}}>
                  College Success
                </div>
                <div className="times-new-roman-italic">
                  {typedText}
                  {showCursor && <span className="animate-pulse">|</span>}
                </div>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl" style={{fontFamily: "'Inter', sans-serif !important"}}>
              Crebit helps students uncover hidden scholarships, boost applications, and save on international tuition payments. Our smart algorithms find unclaimed awards, counselors offer personalized guidance, and AI fills repetitive forms—cutting hours of work.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="flex-1 sm:flex-none bg-primary text-white hover:bg-primary/90" 
                style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
                asChild
              >
                <a href="https://calendly.com/simmisendesign/crebit" target="_blank" rel="noopener noreferrer">
                  Find Scholarships
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="flex-1 sm:flex-none border-primary text-primary hover:bg-primary hover:text-white" 
                style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
                asChild
              >
                <a href="#services">
                  Tuition Payments
                </a>
              </Button>
             
            </div>
          </div>

          {/* Right Visual Elements */}
          <div className="relative max-w-md mx-auto">
            <img 
              src="/crebit-home-right.png" 
              alt="Scholarship Platform Dashboard"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipHero;
