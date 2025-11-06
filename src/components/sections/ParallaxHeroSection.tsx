import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const ParallaxHeroSection = () => {
  const [scrollY, setScrollY] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // Preload the earth-parallax image
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    img.src = '/earth-parallax.png'
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Make header transparent when at top of page
      const header = document.querySelector('header')
      if (header) {
        if (window.scrollY < 100) {
          header.classList.add('transparent')
        } else {
          header.classList.remove('transparent')
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Set initial state
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Earth Background */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: imageLoaded ? 'url(/earth-parallax.png)' : 'none',
          transform: `translateY(${scrollY * 0.5}px)`,
          scale: '1.1',
          willChange: 'transform'
        }}
      />
      
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-green-900" />
      )}
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-0">
        {/* Main Content - Left Aligned */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white leading-tight mb-6 sm:mb-8" style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "700"}}>
            The <span className="italic font-light">universal</span> bridge between global payers and U.S. bills with stablecoins
          </h1>
          
          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed mb-8 sm:mb-12" style={{fontFamily: "'Inter', sans-serif"}}>
            No U.S. bank account needed — we'll mail a check directly on your behalf. Or if you have a U.S. bank account, we can convert and send USD in minutes for instant ACH payments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              variant="default" 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 font-semibold px-4 sm:px-6 py-3 rounded-lg group relative text-sm sm:text-base" 
              style={{fontFamily: "'Satoshi', sans-serif"}} 
              asChild
            >
              <a href="/country-selection" className="relative">
                Get Started
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none hidden sm:block">
                  Make your first payment in minutes.
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold px-4 sm:px-6 py-3 rounded-lg backdrop-blur-sm group relative text-sm sm:text-base" 
              style={{fontFamily: "'Satoshi', sans-serif"}} 
              asChild
            >
              <a href="https://calendly.com/simmisendesign/crebit" target="_blank" rel="noopener noreferrer" className="relative">
                Explore Partnerships
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none hidden sm:block">
                  Bring transparent FX and payments to your customers.
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 sm:w-6 h-8 sm:h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

export default ParallaxHeroSection
