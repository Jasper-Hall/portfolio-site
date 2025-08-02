'use client';

import React, { useState } from "react";

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-100 bg-opacity-90 backdrop-blur-sm border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">Jasper Hall</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="/work" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
              Work
            </a>
            <a href="/contact" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
              Contact
            </a>
            <a href="/shop" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
              Shop
            </a>
            <a href="/blog" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
              Blog
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-100 bg-opacity-95 backdrop-blur-sm border-t border-gray-200">
              <a
                href="/work"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Work
              </a>
              <a
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <a
                href="/shop"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </a>
              <a
                href="/blog"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 