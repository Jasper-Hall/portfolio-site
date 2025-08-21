'use client';

import React, { useState, useEffect } from 'react';
import { ProjectData } from '@/data/types';

interface GalleryViewProps {
  className?: string;
}

const GalleryView: React.FC<GalleryViewProps> = ({ className = '' }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Load all projects from the data structure
    // This will be implemented later as mentioned in the requirements
    setIsLoading(false);
  }, []);

  return (
    <div className={`w-full h-full overflow-y-auto ${className}`}>
      {/* Background */}
      <div className="min-h-full bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Project Gallery</h1>
            <p className="text-white/80">Scroll through all projects</p>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white/80">Loading projects...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Placeholder content until project loading is implemented */}
              <div className="text-center text-white/80 py-20">
                <div className="text-6xl mb-4">🖼️</div>
                <h2 className="text-2xl font-bold mb-2">Gallery View</h2>
                <p className="text-lg">Full-screen scrollable project gallery</p>
                <p className="text-sm text-white/60 mt-2">Project loading coming soon</p>
              </div>
              
              {/* Sample project structure preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <div className="w-full h-32 bg-white/20 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-white/60">Project {i + 1}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Sample Project</h3>
                    <p className="text-white/70 text-sm">This is a placeholder project card</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
