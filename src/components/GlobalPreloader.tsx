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
        
        // Collect image sources - prioritize featured projects and first images only
        const priorityImageSources: string[] = [];
        const featuredProjects = allProjects.filter(project => project.featured);
        
        // For featured projects, take first image only to reduce load time
        featuredProjects.forEach(project => {
          // Add first project image
          if (project.images && project.images.length > 0) {
            priorityImageSources.push(project.images[0]);
          } else if (project.gallery && project.gallery.length > 0) {
            // Add first gallery image
            const firstImage = project.gallery.find(item => item.type === 'image');
            if (firstImage) {
              priorityImageSources.push(firstImage.src);
            }
          }
        });

        // Remove duplicates
        const uniqueImageSources = [...new Set(priorityImageSources)];
        setTotalAssets(uniqueImageSources.length);
        
        if (uniqueImageSources.length === 0) {
          onLoadComplete();
          return;
        }

        setLoadingText('LOADING FEATURED ARTIFACTS...');

        // Set a maximum loading time (5 seconds)
        const maxLoadTime = 5000;
        const startTime = Date.now();

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

        // Wait for all images to load (or fail) with timeout
        const loadingPromise = Promise.all(imagePromises);
        const timeoutPromise = new Promise(resolve => {
          setTimeout(() => {
            console.log('Preloader timeout reached, proceeding anyway');
            resolve(null);
          }, maxLoadTime);
        });

        await Promise.race([loadingPromise, timeoutPromise]);
        
        // Brief pause to show completion
        setLoadingText('ARCHIVE READY...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onLoadComplete();
        
      } catch (error) {
        console.error('Error during preloading:', error);
        // Even if preloading fails, allow the site to load
        onLoadComplete();
      }
    };

    loadAllAssets();
  }, [onLoadComplete]);

  // Warm-load p5 and MindMapView in the background so the mind map is instant when selected
  useEffect(() => {
    import('p5').catch(() => {});
    import('@/components/MindMapView').catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Background image layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(/DSC02550.JPG)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Optional subtle pattern on top */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          backgroundPosition: '0 0, 25px 25px'
        }} />
      </div>

      <div className="relative z-10 text-left max-w-3xl mx-auto px-6 py-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
        {/* Header row: glyph left, title right */}
        <div className="flex items-center gap-6 mb-6">
          <div>
            <svg
              width="120"
              height="120"
              viewBox="0 0 350 380"
              className="glyph-core"
            >
              {/* Large outer circle (static) */}
              <circle
                cx="175"
                cy="195"
                r="150"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
              />
              
              {/* Animated connection lines */}
              <g stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none">
                <line x1="200" y1="120" x2="225" y2="210" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
                <line x1="115" y1="265" x2="245" y2="250" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                <line x1="200" y1="120" x2="90" y2="240" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                <line x1="130" y1="95" x2="250" y2="250" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                <line x1="250" y1="130" x2="177" y2="300" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                <line x1="150" y1="105" x2="180" y2="280" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                <line x1="245" y1="170" x2="100" y2="150" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
                <line x1="50" y1="190" x2="280" y2="210" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
                <line x1="230" y1="130" x2="176" y2="230" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
                <line x1="230" y1="220" x2="100" y2="150" className="animate-pulse" style={{ animationDelay: '1.0s' }} />
                <line x1="250" y1="135" x2="115" y2="265" className="animate-pulse" style={{ animationDelay: '1.1s' }} />
                <line x1="115" y1="200" x2="230" y2="290" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
              </g>
              
              {/* Animated dots/nodes */}
              <g fill="rgba(0,255,255,0.8)">
                <circle cx="108.5" cy="150" r="8.5" className="animate-ping" style={{ animationDelay: '0.2s' }} />
                <circle cx="206" cy="120" r="6" className="animate-ping" style={{ animationDelay: '0.4s' }} />
                <circle cx="202.5" cy="260" r="7.5" className="animate-ping" style={{ animationDelay: '0.6s' }} />
                <circle cx="254.5" cy="250" r="9.5" className="animate-ping" style={{ animationDelay: '0.8s' }} />
                <circle cx="261" cy="137" r="11" className="animate-ping" style={{ animationDelay: '1.0s' }} />
                <circle cx="216" cy="160" r="6" className="animate-ping" style={{ animationDelay: '1.2s' }} />
              </g>
              
              {/* Central pulsing core */}
              <circle
                cx="175"
                cy="195"
                r="20"
                fill="rgba(0,255,255,0.4)"
                className="animate-ping"
                style={{ animationDuration: '2s' }}
              />
              <circle
                cx="175"
                cy="195"
                r="10"
                fill="rgba(255,255,255,0.9)"
                className="animate-pulse"
                style={{ animationDuration: '1.5s' }}
              />
            </svg>
          </div>

          {/* Main logo/title */}
          <div className="mb-0">
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
        </div>
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
            <span>{loadedAssets} / {totalAssets} FEATURED ARTIFACTS RECOVERED</span>
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
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 10px rgba(0,255,255,0.3)); }
          50% { opacity: 1; filter: drop-shadow(0 0 30px rgba(0,255,255,0.8)); }
        }
        
        .glyph-container {
          animation: rotate 20s linear infinite;
        }
        
        .glyph-core {
          animation: pulseGlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GlobalPreloader;
