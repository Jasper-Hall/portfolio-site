'use client';

import React from "react";

const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-100 bg-opacity-90 backdrop-blur-sm border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">Jasper Hall</span>
          </div>
          <div className="flex space-x-8">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 