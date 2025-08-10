'use client';

import React, { useState } from "react";

interface NavigationProps {
  onModalOpen: (modalName: string | null) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onModalOpen }) => {
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
            <button 
              onClick={() => onModalOpen('cv')}
              className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm"
            >
              CV
            </button>
            <button 
              onClick={() => onModalOpen('links')}
              className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm"
            >
              Links
            </button>
            <button 
              onClick={() => onModalOpen('about')}
              className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm"
            >
              About
            </button>
            <button 
              onClick={() => onModalOpen('work')}
              className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-sm"
            >
              Work w. Me
            </button>
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
              <button
                onClick={() => {
                  onModalOpen('cv');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              >
                CV
              </button>
              <button
                onClick={() => {
                  onModalOpen('links');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              >
                Links
              </button>
              <button
                onClick={() => {
                  onModalOpen('about');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              >
                About
              </button>
              <button
                onClick={() => {
                  onModalOpen('work');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              >
                Work w. Me
              </button>
            </div>
          </div>
                )}
      </div>
    </nav>
  );
};

export default Navigation; 