import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Calendar, Target, ChevronDown, ChevronUp, ExternalLink, DollarSign, Clock, Users, Award } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  description: string;
  requirements: string[];
  eligibility: string[];
  tags: string[];
  relevanceScore: number;
  applicants: number;
  awarded: number;
  website: string;
}

const ScholarshipSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [sortBy, setSortBy] = useState<'relevancy' | 'deadline' | 'magic'>('relevancy');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    deadline: '',
    category: '',
    gpa: '',
    year: ''
  });

  // Mock scholarship data
  const [scholarships] = useState<Scholarship[]>([
    {
      id: '1',
      title: 'Future Leaders in Technology Scholarship',
      provider: 'Tech Innovation Foundation',
      amount: '$5,000',
      deadline: '2024-03-15',
      description: 'Supporting the next generation of technology leaders and innovators in STEM fields.',
      requirements: ['3.5+ GPA', 'STEM Major', 'Leadership Experience'],
      eligibility: ['Undergraduate Students', 'US Citizens', 'Full-time Enrollment'],
      tags: ['Technology', 'STEM', 'Leadership'],
      relevanceScore: 95,
      applicants: 1250,
      awarded: 25,
      website: 'https://techfoundation.org/scholarships'
    },
    {
      id: '2',
      title: 'Diversity in Business Excellence Award',
      provider: 'Global Business Council',
      amount: '$7,500',
      deadline: '2024-04-01',
      description: 'Empowering underrepresented students pursuing business and entrepreneurship degrees.',
      requirements: ['2.8+ GPA', 'Business Major', 'Diversity Essay'],
      eligibility: ['Undergraduate/Graduate', 'Underrepresented Groups', 'Business Focus'],
      tags: ['Business', 'Diversity', 'Entrepreneurship'],
      relevanceScore: 88,
      applicants: 890,
      awarded: 15,
      website: 'https://globalbusiness.org/awards'
    },
    {
      id: '3',
      title: 'Environmental Sustainability Research Grant',
      provider: 'Green Future Institute',
      amount: '$3,000',
      deadline: '2024-02-28',
      description: 'Supporting research and innovation in environmental science and sustainability.',
      requirements: ['Research Proposal', 'Environmental Focus', 'Faculty Recommendation'],
      eligibility: ['Graduate Students', 'Environmental Science', 'Research Experience'],
      tags: ['Environment', 'Research', 'Sustainability'],
      relevanceScore: 82,
      applicants: 456,
      awarded: 10,
      website: 'https://greenfuture.org/grants'
    }
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const toggleSemanticSearch = () => {
    setIsSemanticSearch(!isSemanticSearch);
  };

  const handleCardExpand = (scholarshipId: string) => {
    setExpandedCard(expandedCard === scholarshipId ? null : scholarshipId);
  };

  const getSortIcon = (sortType: string) => {
    switch (sortType) {
      case 'relevancy':
        return <Target className="w-4 h-4" />;
      case 'deadline':
        return <Calendar className="w-4 h-4" />;
      case 'magic':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout activeTab="Scholarship Search">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                  Scholarship Search
                </h1>
                <p className="text-gray-600 mt-1" style={{fontFamily: "'Inter', sans-serif !important"}}>
                Leap ahead with scholarships tailored to you
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Search Section */}
          <div className="mb-8">
            {/* Search Mode Toggle with Frog Image */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                      Search Mode
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setIsSemanticSearch(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        !isSemanticSearch 
                          ? 'bg-[#17484A] text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
                    >
                      <Search className="w-4 h-4 inline mr-2" />
                      Keyword Search
                    </button>
                    <button
                      onClick={() => setIsSemanticSearch(true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        isSemanticSearch 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      AI Semantic Search
                    </button>
                    </div>
                  </div>
                  
                </div>
                <div className="text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
                  {isSemanticSearch ? 'AI understands natural language' : 'Traditional keyword matching'}
                </div>
              </div>
              
             
             
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isSemanticSearch ? (
                  <Sparkles className="h-5 w-5 text-[#17484A]" />
                ) : (
                  <Search className="h-5 w-5 text-[#17484A]" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={isSemanticSearch 
                  ? "Describe your ideal scholarship in natural language..." 
                  : "Enter keywords: STEM, merit-based, engineering, etc."
                }
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-lg ${
                  isSemanticSearch 
                    ? 'border-purple-300 focus:ring-purple-500 bg-purple-50/30' 
                    : 'border-[#17484A]/30 focus:ring-[#17484A] bg-[#17484A]/5'
                }`}
                style={{fontFamily: "'Inter', sans-serif !important"}}
              />
              {isSemanticSearch && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="text-xs text-[#17484A] bg-[#17484A]/10 px-2 py-1 rounded-full animate-pulse">
                    AI Active
                  </div>
                </div>
              )}
            </div>

            {/* Filters and Sorting Row */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors border-2 border-gray-200"
                style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
              >
                <Filter className="w-5 h-5" />
                Advanced Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Sort Options - More Prominent */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                  Sort by:
                </span>
                <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1">
                  {(['relevancy', 'deadline', 'magic'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        sortBy === option
                          ? 'bg-[#17484A] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
                    >
                      {getSortIcon(option)}
                      {option === 'relevancy' ? 'Best Match' : option === 'deadline' ? 'Deadline' : 'Magic'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Filters Dropdown */}
            {showFilters && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                  Scholarship Criteria Filters
                </h4>
                
                {/* Financial Criteria */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                    <DollarSign className="w-4 h-4 text-[#17484A]" />
                    Financial Criteria
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Award Amount Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min ($)"
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none"
                          style={{fontFamily: "'Inter', sans-serif !important"}}
                        />
                        <input
                          type="number"
                          placeholder="Max ($)"
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none"
                          style={{fontFamily: "'Inter', sans-serif !important"}}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Award Type
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>All types</option>
                        <option>Merit-based</option>
                        <option>Need-based</option>
                        <option>Athletic</option>
                        <option>Creative/Arts</option>
                        <option>Community Service</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Renewable
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>Any</option>
                        <option>Renewable only</option>
                        <option>One-time only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Academic Criteria */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                    <Award className="w-4 h-4 text-[#17484A]" />
                    Academic Criteria
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Field of Study
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>All fields</option>
                        <option>STEM</option>
                        <option>Engineering</option>
                        <option>Computer Science</option>
                        <option>Business</option>
                        <option>Medicine/Health</option>
                        <option>Arts & Humanities</option>
                        <option>Social Sciences</option>
                        <option>Education</option>
                        <option>Law</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Academic Level
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>All levels</option>
                        <option>High School</option>
                        <option>Undergraduate</option>
                        <option>Graduate</option>
                        <option>Doctoral</option>
                        <option>Trade/Vocational</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Year of Study
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>Any year</option>
                        <option>Freshman</option>
                        <option>Sophomore</option>
                        <option>Junior</option>
                        <option>Senior</option>
                        <option>Graduate Student</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Minimum GPA
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>No minimum</option>
                        <option>2.0+</option>
                        <option>2.5+</option>
                        <option>3.0+</option>
                        <option>3.25+</option>
                        <option>3.5+</option>
                        <option>3.75+</option>
                        <option>3.9+</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Timing & Eligibility */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Timing & Eligibility
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Application Deadline
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>Any time</option>
                        <option>Next 2 weeks</option>
                        <option>Next month</option>
                        <option>Next 3 months</option>
                        <option>Next 6 months</option>
                        <option>This academic year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Residency Status
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>Any status</option>
                        <option>US Citizens only</option>
                        <option>Permanent Residents</option>
                        <option>International Students</option>
                        <option>State Residents</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                        Special Categories
                      </label>
                      <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17484A] focus:border-[#17484A]/20 outline-none" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        <option>All students</option>
                        <option>First-generation college</option>
                        <option>Underrepresented minorities</option>
                        <option>Women in STEM</option>
                        <option>Military/Veterans</option>
                        <option>Students with disabilities</option>
                        <option>LGBTQ+ students</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" style={{fontFamily: "'Satoshi Variable', sans-serif !important"}}>
                    Clear All Filters
                  </button>
                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                      Save Filter Set
                    </button>
                    <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-[#17484A]/90 transition-colors" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
              {scholarships.length} Scholarships Found
            </h2>
            <div className="text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
              Showing results sorted by {sortBy}
            </div>
          </div>

          {/* Scholarship Cards */}
          <div className="grid gap-6">
            {scholarships.map((scholarship, index) => (
              <div
                key={scholarship.id}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl cursor-pointer ${
                  expandedCard === scholarship.id ? 'ring-2 ring-[#17484A]' : ''
                }`}
                onClick={() => handleCardExpand(scholarship.id)}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                        {scholarship.title}
                      </h3>
                      <p className="text-[#17484A] font-medium mb-2" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        {scholarship.provider}
                      </p>
                      <p className="text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        {scholarship.description}
                      </p>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-[#17484A] mb-1" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                        {scholarship.amount}
                      </div>
                      <div className="text-sm text-gray-500" style={{fontFamily: "'Inter', sans-serif !important"}}>
                        Due: {new Date(scholarship.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4 text-[#17484A]" />
                      <span style={{fontFamily: "'Inter', sans-serif !important"}}>
                        {scholarship.relevanceScore}% match
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-[#17484A]" />
                      <span style={{fontFamily: "'Inter', sans-serif !important"}}>
                        {scholarship.applicants} applicants
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-[#17484A]" />
                      <span style={{fontFamily: "'Inter', sans-serif !important"}}>
                        {scholarship.awarded} awarded
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scholarship.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-[#17484A]/10 text-[#17484A] rounded-full text-sm font-medium"
                        style={{fontFamily: "'Inter', sans-serif !important"}}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Expand/Collapse Indicator */}
                  <div className="flex items-center justify-center">
                    {expandedCard === scholarship.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCard === scholarship.id && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Requirements */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                          Requirements
                        </h4>
                        <ul className="space-y-2">
                          {scholarship.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-center gap-2 text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              <div className="w-2 h-2 bg-[#17484A] rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Eligibility */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                          Eligibility
                        </h4>
                        <ul className="space-y-2">
                          {scholarship.eligibility.map((elig, eligIndex) => (
                            <li key={eligIndex} className="flex items-center gap-2 text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {elig}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                      <button className="flex-1 bg-[#17484A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#17484A]/90 transition-colors" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                        Apply Now
                      </button>
                      <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScholarshipSearch;
