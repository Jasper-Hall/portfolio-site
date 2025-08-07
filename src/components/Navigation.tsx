'use client';

import React, { useState } from "react";

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-t border-white/20 shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <pre className="text-[4px] md:text-[4px] font-mono text-white drop-shadow-lg leading-none whitespace-pre max-h-12 overflow-hidden">
{`   ||                                            '||              '||  '||  
  ...  ....    ....  ... ...    ....  ... ..      || ..    ....    ||   ||  
   || '' .||  ||. '   ||'  || .|...||  ||' ''     ||' ||  '' .||   ||   ||  
   || .|' ||  . '|..  ||    | ||       ||         ||  ||  .|' ||   ||   ||  
   || '|..'|' |'..|'  ||...'   '|...' .||.       .||. ||. '|..'|' .||. .||. 
.. |'                 ||                                                    
 ''                  ''''`}
            </pre>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="/work" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm">
              Let's Work
            </a>
            <a href="/cv" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm">
              CV
            </a>
            <a href="/links" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm">
              Links
            </a>
            <a href="/about" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm">
              About
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/90 hover:text-white focus:outline-none focus:text-white transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-xl border-t border-white/20 rounded-t-lg">
              <a
                href="/work"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Let's Work
              </a>
              <a
                href="/cv"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                CV
              </a>
              <a
                href="/links"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Links
              </a>
              <a
                href="/about"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 