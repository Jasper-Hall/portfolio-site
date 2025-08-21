'use client';

import React, { useState, useEffect } from 'react';
import { getAllProjects } from '@/data/projects';

interface GlobalPreloaderProps {
  onLoadComplete: () => void;
}

const GlobalPreloader: React.FC<GlobalPreloaderProps> = ({ onLoadComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('INITIALIZING ARCHIVE...');
  const [totalAssets, setTotalAssets] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState(0);

  useEffect(() => {
    const loadAllAssets = async () => {
      try {
        // Get all projects from all categories
        const allProjects = getAllProjects();
        
        // Collect all image sources
        const allImageSources: string[] = [];
        
        allProjects.forEach(project => {
          // Add project images
          if (project.images && project.images.length > 0) {
            allImageSources.push(...project.images);
          }
          
          // Add gallery images
          if (project.gallery) {
            project.gallery.forEach(item => {
              if (item.type === 'image') {
                allImageSources.push(item.src);
              }
            });
          }
        });

        // Remove duplicates
        const uniqueImageSources = [...new Set(allImageSources)];
        setTotalAssets(uniqueImageSources.length);
        
        if (uniqueImageSources.length === 0) {
          onLoadComplete();
          return;
        }

        setLoadingText('LOADING VISUAL ARTIFACTS...');

        // Load all images with progress tracking
        let completed = 0;
        const imagePromises = uniqueImageSources.map((src, index) => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            
            const handleLoad = () => {
              completed++;
              setLoadedAssets(completed);
              setLoadingProgress((completed / uniqueImageSources.length) * 100);
              
              // Update loading text based on progress
              if (completed < uniqueImageSources.length * 0.3) {
                setLoadingText('SCANNING ARCHIVE FRAGMENTS...');
              } else if (completed < uniqueImageSources.length * 0.6) {
                setLoadingText('RECONSTRUCTING VISUAL DATA...');
              } else if (completed < uniqueImageSources.length * 0.9) {
                setLoadingText('FINALIZING ARCHIVE ACCESS...');
              } else {
                setLoadingText('ARCHIVE READY...');
              }
              
              resolve();
            };

            const handleError = () => {
              console.warn(`Failed to preload image: ${src}`);
              completed++;
              setLoadedAssets(completed);
              setLoadingProgress((completed / uniqueImageSources.length) * 100);
              resolve(); // Continue even if some images fail
            };

            img.addEventListener('load', handleLoad);
            img.addEventListener('error', handleError);
            
            // Start loading
            img.src = src;
          });
        });

        // Wait for all images to load (or fail)
        await Promise.all(imagePromises);
        
        // Brief pause to show completion
        setLoadingText('ARCHIVE READY...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        onLoadComplete();
        
      } catch (error) {
        console.error('Error during preloading:', error);
        // Even if preloading fails, allow the site to load
        onLoadComplete();
      }
    };

    loadAllAssets();
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          backgroundPosition: '0 0, 25px 25px'
        }} />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Main logo/title */}
        <div className="mb-8">
          <pre className="text-white text-xs md:text-sm font-mono drop-shadow-lg leading-none whitespace-pre">
{`   ||                                            '||              '||  '||  
  ...  ....    ....  ... ...    ....  ... ..      || ||    ....    ||   ||  
   || '' .||  ||. '   ||'  || .|...||  ||' ''     ||' ||  '' .||   ||   ||  
   || .|' ||  . '|..  ||    | ||       ||         ||  ||  .|' ||   ||   ||  
   || '|..'|' |'..|'  ||...'   '|...' .||.       .||. ||. '|..'|' .||. .||. 
.. |'                 ||                                                    
 ''                  ''''`}
          </pre>
        </div>

        {/* Loading text */}
        <div className="mb-6">
          <div 
            className="text-white/90 text-sm font-mono tracking-wider"
            style={{
              fontFamily: 'GaldienStamp, Zombnze, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
              letterSpacing: '0.15em',
              transform: 'scaleY(0.8)',
              transformOrigin: 'center'
            }}
          >
            {loadingText}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-white h-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>

        {/* Progress text */}
        <div className="text-white/60 text-xs font-mono">
          {totalAssets > 0 && (
            <span>{loadedAssets} / {totalAssets} ARTIFACTS RECOVERED</span>
          )}
        </div>

        {/* Scanning line effect */}
        <div className="mt-8 relative h-1 w-full bg-white/10 rounded overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
            style={{
              animation: 'scan 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(400%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default GlobalPreloader;
