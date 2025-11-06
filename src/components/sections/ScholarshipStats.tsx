const ScholarshipStats = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-success/3 to-primary/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border">
              <div className="text-4xl lg:text-5xl text-primary mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                $100M+
              </div>
              <p className="text-lg text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                in scholarships go unclaimed every year
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border">
              <div className="text-4xl lg:text-5xl text-primary mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                Billions
              </div>
              <p className="text-lg text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                in student grants remain unused annually
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl text-foreground mb-8" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            The Hidden Scholarship Crisis
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground mb-8" style={{fontFamily: "'Inter', sans-serif !important"}}>
            <p>
              As the cost of education climbs, over $100 million in scholarships and billions in grants go unclaimed every year. The reason? Thousands of students chase the same national scholarships, while countless local awards from community businesses and organizations remain hidden and overlooked.
            </p>
            <p>
              <strong className="text-foreground">We're changing that.</strong> Our agentic search algorithms surface hyper-localized scholarships students would never otherwise discover, alongside state and national opportunities. By unlocking access to these underutilized funds, we ensure that any student—not just the top few—has a real chance to win.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border">
            <p className="text-xl text-primary font-semibold" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
              Ready to discover scholarships others miss?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipStats;
