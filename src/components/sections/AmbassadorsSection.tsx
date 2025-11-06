import ambassadorsImage from '@/assets/ambassadors.png';

const AmbassadorsSection = () => {
  return (
    <section className="hidden lg:block w-screen h-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] m-0 p-0">
      <img 
        src={ambassadorsImage} 
        alt="Crebit Ambassadors"
        className="w-full h-full object-contain object-center"
      />
    </section>
  );
};

export default AmbassadorsSection;
