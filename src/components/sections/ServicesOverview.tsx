import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, DollarSign, FileText, Users } from "lucide-react"

const ServicesOverview = () => {
  const services = [
    {
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      title: "Scholarship Guidance",
      description: "Expert assistance finding and applying for scholarships specifically available to Latin American students.",
      features: ["Merit-based scholarships", "Need-based aid", "Country-specific programs", "Application support"],
      cta: "Find Scholarships"
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "Admissions Support", 
      description: "We work with students in grades 6+ to prepare them for college admissions. Comprehensive mentorship & college admissions consulting from extracurriculars, to application strategy, to acceptance.",
      features: ["Extracurriculars", "Application strategy", "Essay review", "Interview prep", "School selection"],
      cta: "Get Admissions Help"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: "Tuition Payments",
      description: "The best FX rates for BRL to USD with secure, fast tuition payment processing.",
      features: ["Best exchange rates", "PIX payments", "Direct to school", "5-minute processing"],
      cta: "Pay Tuition Now",
      link: "/tuition-payments"
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl text-foreground mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            Complete Support for Your U.S. Education Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" style={{fontFamily: "'Inter', sans-serif !important"}}>
            We provide end-to-end support for Brazilian and Mexican students pursuing higher education in the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="h-full flex flex-col glass-effect hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4 p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  {service.icon}
                </div>
                <CardTitle className="text-xl mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-3 mb-6 flex-grow">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm text-muted-foreground" style={{fontFamily: "'Inter', sans-serif !important"}}>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200" 
                  style={{fontFamily: "'Satoshi', sans-serif !important", fontWeight: "600 !important"}}
                  asChild
                >
                  {service.link ? (
                    <a href={service.link}>{service.cta}</a>
                  ) : (
                    <a href="https://calendly.com/simmisendesign/crebit" target="_blank" rel="noopener noreferrer">
                      {service.cta}
                    </a>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
