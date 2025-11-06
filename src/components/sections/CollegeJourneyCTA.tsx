const CollegeJourneyCTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 relative overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Gradient Background */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 z-0"
        style={{
          width: '1200px',
          height: '431px',
          top: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          background: 'linear-gradient(270deg, rgba(32, 152, 153, 0.24) 0%, rgba(153, 226, 227, 0.24) 34.13%, rgba(25, 131, 132, 0.24) 67.31%, rgba(111, 207, 208, 0.24) 100%)',
          filter: 'blur(82.85px)',
        }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center">
        <div className="text-center">
          {/* CTA Content */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 sm:mb-6 leading-tight px-2" style={{fontFamily: "'Times New Roman', serif !important", fontWeight: "700 !important"}}>
          Your global payments journey begins here.
            <br className="hidden sm:block" />
            <span className="block sm:inline">Built for the future of payments.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4" style={{fontFamily: "'Inter', sans-serif !important"}}>
            A team that will go to the end of the earth to help you win.
          </p>
          
          {/* Email Signup */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto mb-8 sm:mb-12 px-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17484A] focus:border-transparent text-sm sm:text-base"
              style={{fontFamily: "'Inter', sans-serif !important"}}
            />
            <button className="px-4 sm:px-6 py-2 sm:py-3 bg-[#17484A] text-white rounded-lg hover:bg-[#17484A]/90 transition-colors font-medium text-sm sm:text-base whitespace-nowrap" style={{fontFamily: "'Inter', sans-serif !important"}}>
              Sign Up
            </button>
          </div>

          {/* App Preview Image */}
          <div className="relative px-4">
            <img 
              src="/signOnScreen.png" 
              alt="College application platform preview"
              className="w-full max-w-4xl mx-auto rounded-xl sm:rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollegeJourneyCTA;
