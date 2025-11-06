import React, { useState } from 'react';

const ScholarshipEligibility = () => {
  const [formData, setFormData] = useState({
    race: '',
    gender: '',
    firstGeneration: '',
    householdIncome: '',
    gpa: '',
    extracurriculars: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContinue = () => {
    console.log('Continue to next step');
  };

  const handleGoBack = () => {
    console.log('Go back to personal information');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Crebit Branding */}
      <div className="flex-1 bg-[#17484A] flex flex-col justify-between text-white relative overflow-hidden m-6 rounded-2xl p-12">
        {/* Logo */}
        <div className="flex items-center gap-2 z-10 relative">
          <img src="/crebit_logo.png" alt="Crebit" className="h-8" />
        </div>

        {/* Main Content */}
        <div className="z-10 relative">
          <h1 className="text-5xl font-bold mb-6 leading-tight" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            Scholarship Eligibility
          </h1>
          <p className="text-xl mb-8 opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            Help us find the <span className="font-semibold">perfect scholarships</span> for your unique background
          </p>
        </div>

        {/* Bottom Quote */}
        <div className="z-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💰</span>
            </div>
          </div>
          <p className="text-lg italic opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            " Unlock Your Full Scholarship Potential"
          </p>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Right Side - Eligibility Form */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
              Scholarship Eligibility
            </h2>
            <p className="text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
              This information helps us match you with relevant scholarships and opportunities.
            </p>
          </div>

          <form className="space-y-6">
            {/* Race/Ethnicity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Race/Ethnicity
              </label>
              <select
                name="race"
                value={formData.race}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select your race/ethnicity</option>
                <option value="american-indian">American Indian or Alaska Native</option>
                <option value="asian">Asian</option>
                <option value="black">Black or African American</option>
                <option value="hispanic">Hispanic or Latino</option>
                <option value="pacific-islander">Native Hawaiian or Other Pacific Islander</option>
                <option value="white">White</option>
                <option value="two-or-more">Two or More Races</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select your gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* First Generation College Student */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                First Generation College Student
              </label>
              <select
                name="firstGeneration"
                value={formData.firstGeneration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select an option</option>
                <option value="yes">Yes, I am the first in my family to attend college</option>
                <option value="no">No, my parents/guardians attended college</option>
                <option value="unsure">I'm not sure</option>
              </select>
            </div>

            {/* Household Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Annual Household Income
              </label>
              <select
                name="householdIncome"
                value={formData.householdIncome}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select income range</option>
                <option value="under-25k">Under $25,000</option>
                <option value="25k-50k">$25,000 - $50,000</option>
                <option value="50k-75k">$50,000 - $75,000</option>
                <option value="75k-100k">$75,000 - $100,000</option>
                <option value="100k-150k">$100,000 - $150,000</option>
                <option value="over-150k">Over $150,000</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Current GPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Current GPA (if applicable)
              </label>
              <input
                type="text"
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                placeholder="e.g., 3.5 or N/A if not applicable"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              />
            </div>

            {/* Extracurricular Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Primary Extracurricular Interest
              </label>
              <select
                name="extracurriculars"
                value={formData.extracurriculars}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select your main interest</option>
                <option value="athletics">Athletics/Sports</option>
                <option value="arts">Arts (Music, Theater, Visual Arts)</option>
                <option value="stem">STEM Activities</option>
                <option value="community-service">Community Service/Volunteering</option>
                <option value="leadership">Leadership/Student Government</option>
                <option value="academic-clubs">Academic Clubs/Competitions</option>
                <option value="work-experience">Work Experience/Internships</option>
                <option value="other">Other</option>
              </select>
            </div>
          </form>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8 mb-6">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-[#17484A] rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleGoBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 px-6 py-3 bg-[#17484A] text-white rounded-lg hover:bg-[#17484A]/90 transition-colors"
              style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipEligibility;
