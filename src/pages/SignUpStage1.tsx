import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface Stage1FormData {
  // Identity & mobility
  citizenshipCountries: string[];
  currentResidency: {
    countryCode: string;
    stateRegion?: string;
  };
  plannedCollegeCountry: string;
  audienceContext: 'INTERNATIONAL_IN_COUNTRY' | 'DOMESTIC_ONLY' | 'OUTBOUND_STUDY_ABROAD' | 'ANY_UNSURE' | '';
  visaStatus: 'F-1' | 'J-1' | 'Other' | 'None_NA' | '';
  
  // Education snapshot
  degreeLevel: string[];
  yearOfStudy: string[];
  homeInstitutionId?: string;
  intendedMajors: Array<{ cipCode: string; label: string }>;
  majorAreasOfInterest: string[];
  plannedDestination?: {
    hostCountry: string;
    hostInstitutionId?: string;
    terms: string[];
  };
  gpaCurrent: string;
  gpaScale: '4.0' | '10.0' | '';
  
  // Financial & access
  firstGen: boolean | null;
  lowIncome: boolean | null;
  fafsaStatus: 'Completed' | 'Will_file' | 'Not_applicable' | '';
  
  // Affinity & eligibility tags (self-identified; all optional)
  genderTags: string[];
  raceEthnicityTags: string[];
  lgbtq: boolean | null;
  sexualOrientationTags: string[];
  genderIdentityTags: string[];
  faithTags: string[];
  disabilityTags: string[];
}

const SignUpStage1: React.FC = () => {
  const [formData, setFormData] = useState<Stage1FormData>({
    citizenshipCountries: [],
    currentResidency: { countryCode: '' },
    plannedCollegeCountry: '',
    audienceContext: '',
    visaStatus: '',
    degreeLevel: [],
    yearOfStudy: [],
    intendedMajors: [],
    majorAreasOfInterest: [],
    gpaCurrent: '',
    gpaScale: '',
    firstGen: null,
    lowIncome: null,
    fafsaStatus: '',
    genderTags: [],
    raceEthnicityTags: [],
    lgbtq: null,
    sexualOrientationTags: [],
    genderIdentityTags: [],
    faithTags: [],
    disabilityTags: []
  });

  const [currentSection, setCurrentSection] = useState(0);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: keyof Stage1FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter((item: string) => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleGoBack = () => {
    if (currentSection > 0) {
      // Go back to previous section within Stage 1
      setCurrentSection(currentSection - 1);
    } else {
      // Go back to Stage 0 - Basic signup
      window.location.href = '/signup';
    }
  };

  const handleContinue = () => {
    if (currentSection < sections.length - 1) {
      // Move to next section within Stage 1
      setCurrentSection(currentSection + 1);
    } else {
      // All sections completed, navigate to dashboard
      console.log('Quick Match profile completed', formData);
      window.location.href = '/dashboard';
    }
  };

  const sections = [
    'Identity & Mobility',
    'Education Snapshot', 
    'Financial & Access',
    'Affinity & Eligibility'
  ];

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'CA', name: 'Canada' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'CL', name: 'Chile' }
  ];

  const degreeLevels = [
    { value: 'HS_SENIOR', label: 'High School Senior' },
    { value: 'UNDERGRAD', label: 'Undergraduate' },
    { value: 'MASTERS', label: 'Masters' },
    { value: 'PHD', label: 'PhD' },
    { value: 'POSTDOC', label: 'Postdoc' },
    { value: 'NONDEGREE', label: 'Non-degree' }
  ];

  const yearsOfStudy = [
    { value: 'INCOMING_FROSH', label: 'Incoming Freshman' },
    { value: 'FRESHMAN', label: 'Freshman' },
    { value: 'SOPHOMORE', label: 'Sophomore' },
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'SENIOR', label: 'Senior' },
    { value: 'GRAD', label: 'Graduate Student' }
  ];

  const majorAreas = [
    'Business & Management',
    'Engineering & Technology',
    'Computer Science & IT',
    'Health Sciences & Medicine',
    'Natural Sciences',
    'Social Sciences',
    'Arts & Humanities',
    'Education',
    'Law & Legal Studies',
    'Communications & Media',
    'Psychology',
    'Mathematics & Statistics',
    'Environmental Studies',
    'Public Policy & Administration',
    'International Relations',
    'Economics & Finance',
    'Architecture & Design',
    'Agriculture & Life Sciences',
    'Other'
  ];

  const raceEthnicityOptions = [
    'African American/Black',
    'Hispanic/Latino',
    'Asian American',
    'Native American/Indigenous',
    'Pacific Islander',
    'White/Caucasian',
    'Middle Eastern/North African',
    'Multiracial',
    'Other'
  ];

  const genderOptions = [
    'Female',
    'Male',
    'Non-binary',
    'Transgender',
    'Gender fluid',
    'Other',
    'Prefer not to say'
  ];

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Identity & Mobility
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
              Identity & Mobility
            </h3>
            
            {/* Citizenship Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Citizenship Countries
              </label>
              <div className="grid grid-cols-2 gap-2">
                {countries.map(country => (
                  <label key={country.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.citizenshipCountries.includes(country.code)}
                      onChange={() => handleArrayToggle('citizenshipCountries', country.code)}
                      className="rounded border-gray-300 text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{country.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Residency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Current Country of Residency
              </label>
              <select
                value={formData.currentResidency.countryCode}
                onChange={(e) => handleInputChange('currentResidency', { ...formData.currentResidency, countryCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>

            {/* Audience Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Study Context
              </label>
              <select
                value={formData.audienceContext}
                onChange={(e) => handleInputChange('audienceContext', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select context</option>
                <option value="INTERNATIONAL_IN_COUNTRY">International student in country</option>
                <option value="DOMESTIC_ONLY">Domestic student only</option>
                <option value="OUTBOUND_STUDY_ABROAD">Planning to study abroad</option>
                <option value="ANY_UNSURE">Any/Unsure</option>
              </select>
            </div>

            {/* Planned College Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                What country do you plan to attend college in?
              </label>
              <select
                value={formData.plannedCollegeCountry}
                onChange={(e) => handleInputChange('plannedCollegeCountry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>

            {/* Visa Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Visa Status (if applicable)
              </label>
              <select
                value={formData.visaStatus}
                onChange={(e) => handleInputChange('visaStatus', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select visa status</option>
                <option value="F-1">F-1 Student Visa</option>
                <option value="J-1">J-1 Exchange Visitor</option>
                <option value="Other">Other</option>
                <option value="None_NA">None/Not Applicable</option>
              </select>
            </div>
          </div>
        );

      case 1: // Education Snapshot
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
              Education Snapshot
            </h3>
            
            {/* Degree Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Degree Level (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {degreeLevels.map(level => (
                  <label key={level.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.degreeLevel.includes(level.value)}
                      onChange={() => handleArrayToggle('degreeLevel', level.value)}
                      className="rounded border-gray-300 text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Year of Study (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {yearsOfStudy.map(year => (
                  <label key={year.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.yearOfStudy.includes(year.value)}
                      onChange={() => handleArrayToggle('yearOfStudy', year.value)}
                      className="rounded border-gray-300 text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{year.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Major Areas of Interest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Major Areas of Interest (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {majorAreas.map(area => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.majorAreasOfInterest.includes(area)}
                      onChange={() => handleArrayToggle('majorAreasOfInterest', area)}
                      className="rounded border-gray-300 text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current GPA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                  Current GPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gpaCurrent}
                  onChange={(e) => handleInputChange('gpaCurrent', e.target.value)}
                  placeholder="3.75"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  style={{fontFamily: "'Inter', sans-serif !important"}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                  GPA Scale
                </label>
                <select
                  value={formData.gpaScale}
                  onChange={(e) => handleInputChange('gpaScale', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  style={{fontFamily: "'Inter', sans-serif !important"}}
                >
                  <option value="">Select scale</option>
                  <option value="4.0">4.0 Scale</option>
                  <option value="10.0">10.0 Scale</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2: // Financial & Access
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
              Financial & Access
            </h3>
            
            {/* First Generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Are you a first-generation college student?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="firstGen"
                    checked={formData.firstGen === true}
                    onChange={() => handleInputChange('firstGen', true)}
                    className="text-[#17484A] focus:ring-[#17484A]"
                  />
                  <span style={{fontFamily: "'Inter', sans-serif !important"}}>Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="firstGen"
                    checked={formData.firstGen === false}
                    onChange={() => handleInputChange('firstGen', false)}
                    className="text-[#17484A] focus:ring-[#17484A]"
                  />
                  <span style={{fontFamily: "'Inter', sans-serif !important"}}>No</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="firstGen"
                    checked={formData.firstGen === null}
                    onChange={() => handleInputChange('firstGen', null)}
                    className="text-[#17484A] focus:ring-[#17484A]"
                  />
                  <span style={{fontFamily: "'Inter', sans-serif !important"}}>Prefer not to say</span>
                </label>
              </div>
            </div>

            {/* Low Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Do you consider yourself from a low-income background?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="lowIncome"
                    checked={formData.lowIncome === true}
                    onChange={() => handleInputChange('lowIncome', true)}
                    className="text-[#17484A] focus:ring-[#17484A]"
                  />
                  <span style={{fontFamily: "'Inter', sans-serif !important"}}>Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="lowIncome"
                    checked={formData.lowIncome === false}
                    onChange={() => handleInputChange('lowIncome', false)}
                    className="text-[#17484A] focus:ring-[#17484A]"
                  />
                  <span style={{fontFamily: "'Inter', sans-serif !important"}}>No</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="lowIncome"
                    checked={formData.lowIncome === null}
                    onChange={() => handleInputChange('lowIncome', null)}
                    className="text-[#17484A] focus:ring-[#17484A]"
                  />
                  <span style={{fontFamily: "'Inter', sans-serif !important"}}>Prefer not to say</span>
                </label>
              </div>
            </div>

            {/* FAFSA Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                FAFSA Status
              </label>
              <select
                value={formData.fafsaStatus}
                onChange={(e) => handleInputChange('fafsaStatus', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                style={{fontFamily: "'Inter', sans-serif !important"}}
              >
                <option value="">Select FAFSA status</option>
                <option value="Completed">Completed</option>
                <option value="Will_file">Will file</option>
                <option value="Not_applicable">Not applicable</option>
              </select>
            </div>
          </div>
        );

      case 3: // Affinity & Eligibility
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
              Affinity & Eligibility
            </h3>
            <p className="text-sm text-gray-600 mb-4" style={{fontFamily: "'Inter', sans-serif !important"}}>
              All fields in this section are optional and self-identified to help match you with relevant scholarships.
            </p>
            
            {/* Race/Ethnicity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Race/Ethnicity (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {raceEthnicityOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.raceEthnicityTags.includes(option)}
                      onChange={() => handleArrayToggle('raceEthnicityTags', option)}
                      className="rounded border-gray-300 text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Identity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                Gender Identity (optional - select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Male', 'Female', 'Non-binary', 'Transgender', 'Other', 'Prefer not to say'].map(identity => (
                  <label key={identity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.genderIdentityTags.includes(identity)}
                      onChange={() => handleArrayToggle('genderIdentityTags', identity)}
                      className="rounded border-gray-300 text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{identity}</span>
                  </label>
                ))}
              </div>
            </div>


            {/* LGBTQ+ Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                LGBTQ+ Identity
              </h4>
              
              {/* LGBTQ+ Identification */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                  Do you identify as LGBTQ+?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="lgbtq"
                      checked={formData.lgbtq === true}
                      onChange={() => handleInputChange('lgbtq', true)}
                      className="text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span style={{fontFamily: "'Inter', sans-serif !important"}}>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="lgbtq"
                      checked={formData.lgbtq === false}
                      onChange={() => handleInputChange('lgbtq', false)}
                      className="text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span style={{fontFamily: "'Inter', sans-serif !important"}}>No</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="lgbtq"
                      checked={formData.lgbtq === null}
                      onChange={() => handleInputChange('lgbtq', null)}
                      className="text-[#17484A] focus:ring-[#17484A]"
                    />
                    <span style={{fontFamily: "'Inter', sans-serif !important"}}>Prefer not to say</span>
                  </label>
                </div>
              </div>

              {/* Sexual Orientation (optional) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                  Sexual Orientation (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Heterosexual/Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Questioning', 'Other'].map(orientation => (
                    <label key={orientation} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.sexualOrientationTags.includes(orientation)}
                        onChange={() => handleArrayToggle('sexualOrientationTags', orientation)}
                        className="rounded border-gray-300 text-[#17484A] focus:ring-[#17484A]"
                      />
                      <span className="text-sm" style={{fontFamily: "'Inter', sans-serif !important"}}>{orientation}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex h-[95vh]">
      {/* Left Side - Crebit Branding */}
      <div className="flex-1 bg-[#17484A] flex flex-col justify-between text-white relative overflow-hidden m-6 rounded-2xl p-12">
        {/* Logo */}
        <div className="flex items-center gap-2 z-10 relative">
          <img src="/crebit_logo.png" alt="Crebit" className="h-8" style={{filter: 'brightness(0) invert(1)'}} />
        </div>

        {/* Main Content */}
        <div className="z-10 relative">
          <h1 className="text-5xl font-bold mb-6 leading-tight" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            Quick Match Profile
          </h1>
          <p className="text-xl mb-8 opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            Help us find the perfect scholarships for you in <span className="font-semibold">under 60 seconds</span>
          </p>
        </div>

        {/* Bottom Quote */}
        <div className="z-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">2</span>
            </div>
          </div>
          <p className="text-lg italic opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            "Step 2 - Building Your Profile"
          </p>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-stretch justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Section Navigation */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-6">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      currentSection === index 
                        ? 'bg-[#17484A]/10 text-[#17484A]' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content - Dynamic height */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-gray-100 hover:scrollbar-thumb-teal-500 pr-2">
              {renderSection()}
            </div>
          </div>

          {/* Bottom Section */}
          <div>
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-2 h-2 bg-[#17484A] rounded-full"></div>
              <div className={`w-2 h-2 rounded-full ${currentSection >= 0 ? 'bg-[#17484A]' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentSection >= 1 ? 'bg-[#17484A]' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentSection >= 2 ? 'bg-[#17484A]' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentSection >= 3 ? 'bg-[#17484A]' : 'bg-gray-300'}`}></div>
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
                {currentSection > 0 ? 'Previous' : 'Go Back'}
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="flex-1 px-6 py-3 bg-[#17484A] text-white rounded-lg hover:bg-[#17484A]/90 transition-colors"
                style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
              >
                {currentSection < sections.length - 1 ? 'Continue' : 'Complete Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpStage1;
