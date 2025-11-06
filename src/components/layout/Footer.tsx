
import emailIcon from '../../assets/email.png';
import callIcon from '../../assets/call.png';

const Footer = () => {
  return (
    <footer className="py-16 px-4 sm:px-8 lg:px-16 relative overflow-hidden" style={{backgroundColor: '#FFEF93', height: '515px'}}>
      {/* Background Frog SVG */}
      <div className="absolute -bottom-8 left-0 opacity-70 pointer-events-none" style={{width: '367px', height: '483.573px'}}>
        <svg width="303" height="452" viewBox="0 0 303 452" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M-63.9556 406.813C-63.9556 372.403 59.1529 336.212 73.6881 378.756C81.1773 400.68 55.5771 425.528 44.7105 430.358C54.3697 429.754 75.8613 429.633 84.5547 433.98C93.248 438.327 89.1258 444.847 84.5547 444.847C79.9836 444.847 53.766 444.847 53.766 444.847C62.8215 446.658 84.5547 452.091 99.0435 459.335C109.866 467.149 101.414 469.598 93.5659 470.202C85.7177 470.806 58.9835 458.083 58.9835 458.083C62.4211 459.517 69.4172 463.522 79.1214 472.013C89.9436 481.483 76.597 485.26 73.6881 482.88C53.766 466.58 -0.567081 455.713 -33.1669 441.224C-59.2462 429.634 -64.5591 413.454 -63.9556 406.813Z" fill="#3D9697" fillOpacity="0.07"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M102.623 166.857C111.076 133.049 143.555 75.9399 205.856 117.957C226.986 105.883 268.882 96.9511 267.434 150.557L294.6 166.857C300.033 169.876 308.362 180.261 298.222 197.645C288.848 213.716 288.958 275.537 213.504 339.725C212.33 340.718 204.921 366.477 218.534 392.894C221.516 398.678 267.431 401.951 262 414.627C258.896 421.872 223.969 405.924 223.967 412.816C223.967 418.249 243.887 430.927 238.456 438.172C232.354 446.311 201.214 411.753 191.367 412.816C178.232 414.241 167.063 428.93 158.767 421.872C150.091 414.487 179.204 394.796 182.234 392.908C180.924 392.714 176.267 368.549 175.067 369.35C162.372 378.041 157.357 379.247 142.705 386.651C140.657 387.686 138.145 386.723 137.355 384.568L136.309 381.716C135.679 379.999 136.377 378.07 137.937 377.115C207.474 334.542 243.951 270.492 259.393 226.973C264.304 213.132 251.874 200.752 238.026 205.643C163.768 231.868 132.619 292.508 126.168 322.611C120.131 347.363 120.372 413.696 155.145 433.98H191.367C194.988 433.98 204.766 440.501 193.178 444.847C178.69 450.28 164.202 445.418 162.39 450.849C160.579 456.283 169.634 458.094 182.312 465.338C194.987 472.582 180.5 479.826 164.201 470.202C162.19 469.014 146.473 456.191 140.655 459.335C137.24 461.181 142.466 476.204 138.843 479.826C136.769 481.901 131.599 482.88 129.788 476.204C127.234 466.791 123.026 452.401 117.112 447.227C108.295 439.513 108.899 424.123 102.623 405.922C102.576 405.756 95.4368 376.447 75.8175 355.884C56.4668 335.602 4.19932 350.561 -14.9372 355.884C-17.9434 356.72 -20.6286 353.931 -19.4997 351.022C-0.567673 302.235 46.0713 205.477 102.623 166.857ZM167.823 142.962C151.819 142.962 138.846 155.936 138.845 171.94C138.845 187.944 151.819 200.917 167.823 200.917C183.826 200.916 196.801 187.943 196.801 171.94C196.8 155.937 183.826 142.963 167.823 142.962Z" fill="#3D9697" fillOpacity="0.07"/>
          <path d="M185.932 171.94C185.932 177.028 183.835 181.625 180.457 184.915C177.194 188.093 172.736 190.051 167.821 190.051C157.819 190.051 149.055 184.277 149.055 171.599C149.055 165.402 150.958 161.137 154.762 157.332C158.667 153.428 163.216 152.577 168.078 152.577C174.086 152.577 166.816 162.334 169.98 166.857C172.327 170.21 185.932 167.681 185.932 171.94Z" fill="#3D9697" fillOpacity="0.07"/>
          <path d="M206.183 107.839C206.146 107.86 206.1 107.857 206.065 107.834C153.977 72.839 113.215 107.623 102.74 142.567C102.708 142.675 102.553 142.669 102.527 142.559L80.8688 52.0399C80.7338 51.4756 81.2435 50.9683 81.8071 51.1059L125.611 61.804C125.662 61.8165 125.715 61.7913 125.737 61.7438L154.348 0.881595C154.56 0.43044 155.136 0.293638 155.528 0.601408L208.585 42.2397L244.957 8.01186C245.409 7.58626 246.153 7.83828 246.254 8.45111L263.109 111.173C263.129 111.29 262.969 111.346 262.901 111.249C249.49 91.8287 221.93 98.7278 206.183 107.839Z" fill="#3D9697" fillOpacity="0.07"/>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">

          {/* Crebit Logo and Name - All the way to the left */}
          <div className="col-span-1 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="46" height="61" viewBox="0 0 46 61" fill="none" style={{minWidth: '46px', minHeight: '61px', flexShrink: 0}}>
              <path d="M0.00556087 50.9902C0.00556087 46.6772 15.4361 42.1411 17.2579 47.4734C18.1966 50.2214 14.9879 53.336 13.6258 53.9413C14.8365 53.8656 17.5303 53.8505 18.6199 54.3953C19.7096 54.9401 19.1929 55.7573 18.6199 55.7573C18.047 55.7573 14.7609 55.7573 14.7609 55.7573C15.8959 55.9843 18.6199 56.6654 20.436 57.5734C21.7924 58.5527 20.7331 58.8597 19.7494 58.9354C18.7657 59.0111 15.4148 57.4164 15.4148 57.4164C15.8457 57.5961 16.7226 58.0981 17.9389 59.1624C19.2954 60.3493 17.6225 60.8228 17.2579 60.5244C14.7609 58.4814 7.95072 57.1194 3.86464 55.3033C0.595843 53.8505 -0.0700808 51.8226 0.00556087 50.9902Z" fill="#0C3E3F"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M20.8847 20.9139C21.9441 16.6765 26.0151 9.51836 33.8239 14.7848C36.4724 13.2715 41.7236 12.1519 41.5421 18.8709L44.9471 20.9139C45.6281 21.2923 46.6721 22.594 45.4012 24.773C44.2262 26.7872 44.24 34.536 34.7825 42.5813C34.6353 42.7059 33.7068 45.9344 35.413 49.2456C35.7867 49.9706 41.5417 50.3807 40.8611 51.9696C40.4719 52.8776 36.0942 50.8788 36.094 51.7426C36.094 52.4236 38.5908 54.0126 37.91 54.9207C37.1452 55.9409 33.2421 51.6094 32.0079 51.7426C30.3615 51.9212 28.9616 53.7624 27.9218 52.8777C26.8343 51.9521 30.4833 49.4839 30.8631 49.2474C30.6989 49.223 30.1152 46.1942 29.9648 46.2945C28.3736 47.3838 27.7451 47.535 25.9085 48.4631C25.6518 48.5928 25.337 48.472 25.2379 48.202L25.1069 47.8446C25.0279 47.6293 25.1154 47.3875 25.3109 47.2678C34.0267 41.9318 38.5987 33.9036 40.5343 28.4489C41.1499 26.7141 39.5919 25.1624 37.8561 25.7754C28.5486 29.0624 24.6443 36.6631 23.8357 40.4363C23.079 43.5387 23.1093 51.8529 27.4678 54.3953H32.0079C32.4617 54.3953 33.6873 55.2126 32.2349 55.7573C30.419 56.4383 28.603 55.8289 28.3758 56.5097C28.1488 57.1908 29.2838 57.4178 30.8729 58.3258C32.4616 59.2337 30.6457 60.1417 28.6028 58.9354C28.3508 58.7866 26.3808 57.1793 25.6515 57.5734C25.2235 57.8047 25.8785 59.6877 25.4245 60.1417C25.1645 60.4017 24.5165 60.5244 24.2895 59.6877C23.9694 58.5079 23.4419 56.7042 22.7007 56.0557C21.5956 55.0889 21.6713 53.1598 20.8847 50.8785C20.8788 50.8577 19.9839 47.1841 17.5248 44.6067C15.0994 42.0645 8.54814 43.9395 6.14956 44.6067C5.77277 44.7115 5.4362 44.362 5.57769 43.9974C7.95065 37.8824 13.7964 25.7547 20.8847 20.9139ZM29.0568 17.919C27.0509 17.919 25.4248 19.5451 25.4248 21.551C25.4248 23.557 27.0509 25.1831 29.0568 25.1831C31.0627 25.183 32.6889 23.5569 32.6889 21.551C32.6889 19.5452 31.0626 17.9191 29.0568 17.919Z" fill="#0C3E3F"/>
              <path d="M31.3267 21.5511C31.3267 22.1888 31.0637 22.765 30.6404 23.1774C30.2314 23.5757 29.6726 23.8211 29.0566 23.8211C27.8029 23.8211 26.7045 23.0974 26.7045 21.5084C26.7045 20.7316 26.9429 20.197 27.4198 19.7201C27.9092 19.2307 28.4794 19.124 29.0888 19.124C29.8418 19.124 28.9306 20.3471 29.3272 20.9139C29.6213 21.3342 31.3267 21.0173 31.3267 21.5511Z" fill="#0C3E3F"/>
              <path d="M33.9167 13.4868C33.88 13.5077 33.834 13.505 33.7988 13.4816C27.4662 9.26672 22.4781 13.2776 21.0108 17.5239C20.9739 17.6308 20.8145 17.6255 20.7881 17.5155L18.4165 7.60318C18.2814 7.03889 18.7911 6.53157 19.3548 6.66923L23.6893 7.72783C23.7403 7.74029 23.793 7.71509 23.8153 7.66757L27.0053 0.881595C27.2174 0.43044 27.7939 0.293639 28.1861 0.60141L34.166 5.29434L37.7968 1.87753C38.2491 1.45193 38.9932 1.70395 39.0937 2.31677L40.9277 13.4934C40.9469 13.6106 40.7778 13.6812 40.6992 13.5922C38.9556 11.6184 35.7952 12.4186 33.9167 13.4868Z" fill="#0C3E3F"/>
            </svg>
            <span style={{
              color: '#0C3E3F',
              fontFamily: 'Obviously, sans-serif',
              fontSize: '40px',
              fontStyle: 'normal',
              fontWeight: '650',
              lineHeight: 'normal',
              letterSpacing: '-3.2px'
            }}>
              Crebit
            </span>
          </div>

          {/* Mobile Grid for Footer Sections */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Customer Support */}
            <div>
              <h3 className="mb-4" style={{
                color: '#3D3D3D',
                fontFamily: "'Satoshi Variable', sans-serif",
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '900',
                lineHeight: '106%',
                letterSpacing: '-0.28px'
              }}>
                Customer Support
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <img src={callIcon} alt="Call" className="w-4 h-4" />
                  <span style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    +1 (360) 525 0330
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={callIcon} alt="Call" className="w-4 h-4" />
                  <span style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    +1 (630) 806 6837
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={callIcon} alt="Call" className="w-4 h-4" />
                  <span style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    +1 (773) 715 2424
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={emailIcon} alt="Email" className="w-4 h-4" />
                  <span style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    info@getcrebit.com
                  </span>
                </div>
                <button 
                  className="mt-4 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity" 
                  style={{fontFamily: "'Satoshi Variable', sans-serif", fontWeight: "600", backgroundColor: "#0C3E3F"}}
                  onClick={() => window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ', '_blank')}
                >
                  Schedule a Live Call
                </button>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-4" style={{
                color: '#3D3D3D',
                fontFamily: "'Satoshi Variable', sans-serif",
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '900',
                lineHeight: '106%',
                letterSpacing: '-0.28px'
              }}>
                Legal
              </h3>
              <div className="space-y-2">
                <div>
                  <a href="/terms" className="hover:underline" style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    Terms of Service
                  </a>
                </div>
                <div>
                  <a href="/privacy" className="hover:underline" style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>

            {/* Partner with Us */}
            <div>
              <h3 className="mb-4" style={{
                color: '#3D3D3D',
                fontFamily: "'Satoshi Variable', sans-serif",
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '900',
                lineHeight: '106%',
                letterSpacing: '-0.28px'
              }}>
                Partner with Us
              </h3>
              <div className="space-y-2">
                <div>
                  <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    Become an Ambassador
                  </a>
                </div>
                <div>
                  <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    University Partners
                  </a>
                </div>
                <div>
                  <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YvOzOFCPwZQz8YffAEVViTmlB7JUWgkmHKHrrPZkf4zXAsbODNYOXgVhEtx0Y_ZidYEZlD_XQ" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{
                    color: '#3D3D3D',
                    fontFamily: "'Satoshi Variable', sans-serif",
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '106%',
                    letterSpacing: '-0.28px'
                  }}>
                    Banks & Credit Unions
                  </a>
                </div>
              </div>
            </div>
            
          </div>

        </div>
        
        {/* Bottom Copyright Text - Left Aligned */}
        <div className="mt-20 text-left">
          <div style={{
            color: '#0C3E3F',
            fontFamily: "'Satoshi Variable', sans-serif",
            fontSize: '20px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: 'normal',
            letterSpacing: '-0.8px'
          }}>
            © 2025 Crebit Pay, Inc. All rights reserved.
          </div>
          <div className="mt-2" style={{
            color: '#0C3E3F',
            fontFamily: "'Satoshi Variable', sans-serif",
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 'normal',
            letterSpacing: '-0.56px'
          }}>
            Fully compliant with KYC/AML regulations. Registered under U.S. financial law, with licensed partners abroad. Crebit partners with regulated financial institutions and licensed money transmitters to provide its services. Additional disclosures can be found on the Legal and Privacy page.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer