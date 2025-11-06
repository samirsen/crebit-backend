import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const fullText = "Without The Markups";
  
  useEffect(() => {
    // Wait for slide-in animation to complete (1.2s) before starting typing
    const animationDelay = setTimeout(() => {
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

      return () => clearInterval(typingInterval);
    }, 1200);

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(animationDelay);
      clearInterval(cursorInterval);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = () => {
    // Navigate to dashboard after sign in
    window.location.href = '/dashboard';
  };

  const handleGoBack = () => {
    // Navigate back to home page
    window.location.href = '/';
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
    console.log('Forgot password clicked');
  };

  const handleSignUp = () => {
    // Navigate to sign up page
    window.location.href = '/signup';
  };

  return (
    <div className="h-[95vh] bg-gray-50 flex">
      {/* Left Side - Crebit Branding */}
      <div className="flex-1 bg-[#17484A] flex flex-col justify-between text-white relative overflow-hidden m-6 rounded-2xl p-12 animate-slide-in-left">
        {/* Logo */}
        <div className="flex items-center gap-2 z-10 relative">
          <img src="/crebit_logo.png" alt="Crebit" className="h-8" style={{filter: 'brightness(0) invert(1)'}} />
        </div>

        {/* Main Content */}
        <div className="z-10 relative">
          <h1 className="text-5xl font-bold mb-6 leading-tight" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
            Welcome back to the future of payments
          </h1>
          <p className="text-xl mb-8 opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            Continue To Your U.S Payment—<span className="font-semibold">
              {typedText}
              {showCursor && <span className="animate-pulse">|</span>}
            </span>
          </p>
        </div>

        {/* Bottom Quote */}
        <div className="z-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <p className="text-lg italic opacity-90" style={{fontFamily: "'Inter', sans-serif !important"}}>
            "Crossing Borders, Not Budgets."
          </p>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-stretch justify-center p-6 animate-slide-in-right">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "700 !important"}}>
                Sign In
              </h2>
              <p className="text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
                Welcome back! Please sign in to your account.
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {/* Dynamic form container */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                <form className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      style={{fontFamily: "'Inter', sans-serif !important"}}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        style={{fontFamily: "'Inter', sans-serif !important"}}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#17484A] hover:text-[#17484A]/80 transition-colors"
                      style={{fontFamily: "'Inter', sans-serif !important"}}
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Section - Action Buttons */}
          <div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mb-6">
              <button
                type="button"
                onClick={handleSignIn}
                className="w-full px-6 py-3 bg-[#17484A] text-white rounded-lg hover:bg-[#17484A]/90 transition-colors"
                style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
              >
                Go Back
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600" style={{fontFamily: "'Inter', sans-serif !important"}}>
                Don't have an account?{' '}
                <button
                  onClick={handleSignUp}
                  className="text-[#17484A] hover:text-[#17484A]/80 font-medium transition-colors"
                  style={{fontFamily: "'Satoshi Variable', sans-serif !important", fontWeight: "600 !important"}}
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
