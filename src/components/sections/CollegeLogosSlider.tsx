import { InfiniteSlider } from '@/components/ui/infinite-slider';
import mitLogo from '@/assets/logos/MIT-Logo.png';
import harvardLogo from '@/assets/logos/harvard.png';
import stanfordLogo from '@/assets/logos/stanford.png';
import columbiaLogo from '@/assets/logos/columbia.png';
import northwesternLogo from '@/assets/logos/northwestern.svg';
import nyuLogo from '@/assets/logos/nyu.png';
import fsuLogo from '@/assets/logos/fsu.png';
import dartmouthLogo from '@/assets/logos/dartmouth.png';

const CollegeLogosSlider = () => {
  const colleges = [
    {
      name: 'MIT',
      logo: mitLogo
    },
    {
      name: 'FSU',
      logo: fsuLogo
    },
    {
      name: 'Northwestern',
      logo: northwesternLogo
    },
    {
      name: 'Columbia',
      logo: columbiaLogo
    },
    {
      name: 'Stanford',
      logo: stanfordLogo
    },
    {
      name: 'NYU',
      logo: nyuLogo
    },
    {
      name: 'Harvard',
      logo: harvardLogo
    },
    {
      name: 'Dartmouth',
      logo: dartmouthLogo
    }
  ];

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-6 bg-white">
      <div className="text-center mb-2">
        <p className="text-2xl font-semibold text-[#17484A]" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
        Trusted by students and families at
        </p>
      </div>
      
      <div className="bg-white py-2">
        <InfiniteSlider
          gap={120}
          duration={60}
          durationOnHover={100}
          className="w-full"
        >
          {colleges.map((college, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-fit"
            >
              <img 
                src={college.logo} 
                alt={`${college.name} logo`}
                className={`h-24 w-32 object-contain transition-all duration-300 ${
                  college.name === 'NYU' ? 'object-cover scale-110' : ''
                }`}
              />
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </div>
  );
};

export default CollegeLogosSlider;
