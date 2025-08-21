'use client';

import React, { useRef, useEffect, useState } from 'react';
import { mindMapStructure } from '@/data/types';

interface MindMapViewProps {
  className?: string;
}

const MindMapView: React.FC<MindMapViewProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // TODO: Initialize p5.js sketch here for node forest visualization
    // This will be implemented later as mentioned in the requirements
    setIsLoaded(true);
  }, []);

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
      
      {/* Canvas for p5.js sketch */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
      
      {/* Placeholder content until p5.js is implemented */}
      {!isLoaded && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white/80">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold mb-2">Mind Map View</h2>
            <p className="text-lg">Full-screen node forest visualization</p>
            <p className="text-sm text-white/60 mt-2">p5.js integration coming soon</p>
          </div>
        </div>
      )}
      
      {/* Node Forest Structure Preview */}
      <div className="absolute top-4 left-4 text-white/90">
        <h3 className="text-lg font-semibold mb-2">Project Categories</h3>
        <div className="space-y-1 text-sm">
          {Object.entries(mindMapStructure).map(([key, structure]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-white/60 rounded-full"></span>
              <span className="capitalize">{key}</span>
              <span className="text-white/50">({structure.subcategories.length})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MindMapView;
