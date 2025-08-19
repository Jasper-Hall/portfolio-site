'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ProjectData, mindMapStructure } from '@/data/types';
import { getFeaturedProjectsInMindMapOrder, getProjectsByCategory, getProjectsBySubcategory } from '@/data/projects';
import { createPortal } from 'react-dom';

interface NavigationPath {
  level: string;
  sublevel?: string;
}

interface ArchiveViewerProps {
  className?: string;
  currentPath: NavigationPath;
  onPathChange: (path: NavigationPath) => void;
}

export interface ArchiveViewerRef {
  handleHover: (branchName: string | null) => void;
  updatePath: (path: NavigationPath) => void;
}

const ArchiveViewer = forwardRef<ArchiveViewerRef, ArchiveViewerProps>(({ 
  className = '', 
  currentPath, 
  onPathChange,
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [lastHoveredIndex, setLastHoveredIndex] = useState<number>(0);
  const autoPlayInterval = useRef<NodeJS.Timeout | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [internalPath, setInternalPath] = useState<NavigationPath>(currentPath);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [isProjectViewerHovered, setIsProjectViewerHovered] = useState<boolean>(false);
  
  // Ink bleed effect controls
  const [inkBlur, setInkBlur] = useState<number>(0.6);
  const [inkThreshold, setInkThreshold] = useState<number>(0.5);
  
  // Animation states for smooth project transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ink bleed animation states
  const [animatedInkBlur, setAnimatedInkBlur] = useState(0.6);
  const inkBlurAnimationRef = useRef<number | null>(null);

  // Expose handleHover and updatePath methods to parent component
  useImperativeHandle(ref, () => ({
    handleHover: (branchName: string | null) => {
      if (branchName && internalPath.level === 'home') {
        const featuredProjects = getFeaturedProjectsInMindMapOrder();
        const hoveredIndex = featuredProjects.findIndex(p => p.category === branchName);
        if (hoveredIndex >= 0) {
          setLastHoveredIndex(hoveredIndex);
          // Initiate smooth transition to hovered project
          initiateTransition(hoveredIndex);
        }
      } else if (!branchName && internalPath.level === 'home') {
        // Return to current auto-play index when hover ends
        initiateTransition(currentIndex);
      }
      setHoveredBranch(branchName);
    },
    updatePath: (path: NavigationPath) => {
      setInternalPath(path);
    }
  }));

  // Get filtered projects based on current path and hover state
  const getFilteredProjects = (): ProjectData[] => {
    if (internalPath.level === 'home') {
      return getFeaturedProjectsInMindMapOrder();
    } else if (internalPath.sublevel) {
      return getProjectsBySubcategory(internalPath.level, internalPath.sublevel);
    } else {
      const categoryProjects = getProjectsByCategory(internalPath.level);
      return categoryProjects;
    }
  };

  const filteredProjects = getFilteredProjects();
  
  // Function to animate ink blur from high to low for text reveal effect
  const animateInkBlur = () => {
    // Cancel any existing animation
    if (inkBlurAnimationRef.current) {
      cancelAnimationFrame(inkBlurAnimationRef.current);
    }
    
    const startBlur = 2.0;
    const endBlur = 0.5;
    const duration = 1500; // 1.5 seconds for optimal timing
    
    // Immediately set to start blur value to ensure it begins at 2px
    setAnimatedInkBlur(startBlur);
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOut curve for natural deceleration (softer curve)
      const easeOut = 1 - Math.pow(1 - progress, 2.5);
      const currentBlur = startBlur - (startBlur - endBlur) * easeOut;
      
      setAnimatedInkBlur(currentBlur);
      
      if (progress < 1) {
        inkBlurAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedInkBlur(endBlur);
        inkBlurAnimationRef.current = null;
      }
    };
    
    inkBlurAnimationRef.current = requestAnimationFrame(animate);
  };

  // Function to initiate smooth transition between projects
  const initiateTransition = (newIndex: number) => {
    if (newIndex === animatedIndex || isTransitioning) return;
    
    // Clear any existing transition timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    setTargetIndex(newIndex);
    setIsTransitioning(true);
    
    // Immediately set blur to max to start the blur effect before project switches
    setAnimatedInkBlur(2.0);
    
    // Start the transition after a brief delay to allow for animation prep
    transitionTimeoutRef.current = setTimeout(() => {
      setAnimatedIndex(newIndex);
      
      // Start ink blur animation immediately when project switches for immediate effect
      animateInkBlur();
      
      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350); // Slightly faster for better responsiveness
    }, 20); // Reduced delay for more immediate response
  };
  
  const getHoveredProjectIndex = (): number => {
    if (hoveredBranch && currentPath.level === 'home') {
      return lastHoveredIndex;
    }
    return currentIndex;
  };
  
  // Use animatedIndex for display during transitions, fallback to calculated index
  const displayIndex = isTransitioning ? animatedIndex : getHoveredProjectIndex();
  const currentProject = filteredProjects[displayIndex] || filteredProjects[0];
  const imageSources: string[] = currentProject
    ? (currentProject.images && currentProject.images.length > 0
        ? currentProject.images
        : (currentProject.gallery?.filter(item => item.type === 'image').map(item => item.src) || []))
    : [];

  const embedBlock = currentProject?.contentBlocks?.find(b => b.type === 'embed' && b.embedUrl);
  const embedUrl = embedBlock && (embedBlock as any).embedUrl as string | undefined;
  const isBandcampEmbed = !!embedUrl && embedUrl.includes('bandcamp.com/EmbeddedPlayer');
  const isVimeoEmbed = !!embedUrl && embedUrl.includes('vimeo.com');

  // Determine layout based on current media
  const getLayoutType = (): 'portrait' | 'landscape' | 'square' => {
    if (embedUrl) {
      if (isBandcampEmbed) return 'square';
      if (isVimeoEmbed) return 'landscape';
      return 'landscape'; // default for other embeds
    }
    if (imageNaturalSize) {
      const { w, h } = imageNaturalSize;
      if (w === h) return 'square';
      return h > w ? 'portrait' : 'landscape';
    }
    return 'landscape'; // default
  };

  const layoutType = getLayoutType();
  const isPortrait = layoutType === 'portrait';
  const isSquare = layoutType === 'square';

  useEffect(() => {
    setCurrentImageIndex(0);
    setModalImageIndex(0);
    setIsImageModalOpen(false);
    setImageNaturalSize(null);
    // keep text section visible; no toggle state needed
    
    // Trigger ink blur animation when project content changes
    // (but not if we're already in a transition to avoid double-animation)
    if (!isTransitioning && currentProject?.id) {
      setTimeout(() => {
        animateInkBlur();
      }, 50);
    }
  }, [currentProject?.id]);

  // Initialize animated index and ink blur on first load
  useEffect(() => {
    setAnimatedIndex(currentIndex);
    setAnimatedInkBlur(0.5); // Start with final blur value for initial state
  }, []);

  // Cleanup transition timeout and ink blur animation on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (inkBlurAnimationRef.current) {
        cancelAnimationFrame(inkBlurAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setImageNaturalSize(null);
  }, [currentImageIndex]);

  // Close modal on Escape
  useEffect(() => {
    if (!isImageModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsImageModalOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isImageModalOpen]);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && filteredProjects.length > 1 && !isProjectViewerHovered && !isTransitioning) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = (prev + 1) % filteredProjects.length;
          initiateTransition(nextIndex);
          return nextIndex;
        });
      }, 4000);
    }

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, [isAutoPlaying, filteredProjects.length, isProjectViewerHovered, isTransitioning]);

  // Pause auto-play on hover
  useEffect(() => {
    if (internalPath.level === 'home') {
      if (hoveredBranch) {
        setIsAutoPlaying(false);
      } else {
        setIsAutoPlaying(true);
        setCurrentIndex(lastHoveredIndex);
      }
    } else {
      setIsAutoPlaying(true);
    }
  }, [hoveredBranch, lastHoveredIndex, internalPath.level]);

  // Reset index when path changes and trigger initial animation
  useEffect(() => {
    setCurrentIndex(0);
    setAnimatedIndex(0);
    setTargetIndex(0);
    setIsTransitioning(false);
    setAnimatedInkBlur(0.5); // Reset to final blur value
    // Cancel any ongoing ink blur animation
    if (inkBlurAnimationRef.current) {
      cancelAnimationFrame(inkBlurAnimationRef.current);
      inkBlurAnimationRef.current = null;
    }
    
    // Trigger initial ink blur animation when entering a new category/subcategory
    setTimeout(() => {
      animateInkBlur();
    }, 100);
  }, [internalPath]);

  const goToNext = () => {
    if (filteredProjects.length > 1) {
      const nextIndex = (currentIndex + 1) % filteredProjects.length;
      setCurrentIndex(nextIndex);
      initiateTransition(nextIndex);
    }
  };

  const goToPrevious = () => {
    if (filteredProjects.length > 1) {
      const prevIndex = (currentIndex - 1 + filteredProjects.length) % filteredProjects.length;
      setCurrentIndex(prevIndex);
      initiateTransition(prevIndex);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    initiateTransition(index);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'archived':
        return 'status-archived';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-archived';
    }
  };

  const getCategoryTitle = () => {
    if (internalPath.level === 'home') {
      return 'FEATURED PROJECTS';
    } else if (internalPath.sublevel) {
      const categoryName = mindMapStructure[internalPath.level as keyof typeof mindMapStructure]?.name || internalPath.level.toUpperCase();
      const subcategoryName = internalPath.sublevel.toUpperCase();
      return `${categoryName} > ${subcategoryName}`;
    } else {
      const categoryName = mindMapStructure[internalPath.level as keyof typeof mindMapStructure]?.name || internalPath.level.toUpperCase();
      return `${categoryName} PROJECTS`;
    }
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      { name: 'home', path: { level: 'home' } as NavigationPath, isActive: internalPath.level === 'home' }
    ];

    if (internalPath.level !== 'home') {
      const categoryName = mindMapStructure[internalPath.level as keyof typeof mindMapStructure]?.name || internalPath.level;
      breadcrumbs.push({
        name: categoryName,
        path: { level: internalPath.level } as NavigationPath,
        isActive: internalPath.level !== 'home' && !internalPath.sublevel
      });

      if (internalPath.sublevel) {
        breadcrumbs.push({
          name: internalPath.sublevel,
          path: { level: internalPath.level, sublevel: internalPath.sublevel } as NavigationPath,
          isActive: true
        });
      }
    }

    return breadcrumbs;
  };

  const handleTabClick = (path: NavigationPath) => {
    setInternalPath(path);
    onPathChange(path);
  };

  // Text section is always visible; no toggle function required

  return (
    <div className={`relative h-full ${className}`}>
      {/* Inline SVG filter for ink bleed effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id="ink-bleed-filter-0.5">
          <feComponentTransfer>
            {/* Threshold the alpha channel to simulate crisp ink edges */}
            <feFuncA type="discrete" tableValues="0 0 1 1" />
          </feComponentTransfer>
        </filter>
        <filter id="ink-bleed-filter-0.6">
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 1 1" />
          </feComponentTransfer>
        </filter>
        <filter id="ink-bleed-filter-0.7">
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 0 1 1" />
          </feComponentTransfer>
        </filter>
        <filter id="ink-bleed-filter-0.8">
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 0 0 1 1" />
          </feComponentTransfer>
        </filter>
        <filter id="ink-bleed-filter-0.9">
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 0 0 0 0 1 1" />
          </feComponentTransfer>
        </filter>
      </svg>
      
      {/* Manila Folder Tabs */}
      <div className="mb-4">
        <div className="flex items-end space-x-1">
          {(() => {
            const crumbs = generateBreadcrumbs();
            const total = crumbs.length;
            return crumbs.map((breadcrumb, index) => {
              let tierBg: string | undefined;
              if (!breadcrumb.isActive && total === 3) {
                if (index === 0) tierBg = '#D8C9AE';
                if (index === 1) tierBg = '#E3D6BC';
              }
              return (
                <div key={index} className="relative">
                                      <button
                      onClick={() => handleTabClick(breadcrumb.path)}
                      className={`
                        tab-button ${breadcrumb.name === 'home' ? 'no-curves' : ''}
                        px-6 py-2.5 text-sm tracking-wider transition-all duration-200
                        ${breadcrumb.isActive ? 'tab-active shadow-sm' : ''}
                      `}
                      style={{
                        color: '#2F2A1F',
                        filter: `url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`,
                        fontFamily: 'GaldienStamp, Zombnze, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                        letterSpacing: '0.20em',
                        fontWeight: 'normal',
                        textTransform: 'lowercase',
                        fontSize: '1rem',
                        transform: 'scaleY(0.8)',
                        transformOrigin: 'center'
                      }}
                    >
                      {breadcrumb.name}
                    </button>
                  {breadcrumb.isActive && (
                    <div 
                      className="absolute left-0 right-0 h-1 rounded-b-sm"
                      style={{ backgroundColor: '#d1d5db', bottom: '-4px' }}
                    ></div>
                  )}
                </div>
              );
            });
          })()}
        </div>
        
        {/* Main Container */}
        <div className="rounded-b-2xl rounded-tr-2xl shadow-lg h-full border relative z-10 -mt-1 bg-[#E9E0CC] border-[#D8C9AE]">
          <div className="p-4 md:p-6 h-full">
            {currentProject && (
              <div className="h-full flex flex-col">
                {/* Paper stack card wrapper */}
                                  <div
                    className="paper-stack p-3 md:p-4"
                    onMouseEnter={() => setIsProjectViewerHovered(true)}
                    onMouseLeave={() => setIsProjectViewerHovered(false)}
                  >
                {/* Media + Text wrapper: side-by-side when portrait or square */}
                <div className={(isPortrait || isSquare || isBandcampEmbed) ? 'flex gap-4 items-start' : ''}>
                  {/* Media Container - Takes up most of the space */}
                  <div className="flex-1 relative min-h-0 flex items-center justify-center">
                    {embedUrl ? (
                      <div className="w-full h-full flex items-center justify-center">
                        {isBandcampEmbed ? (
                          <div className="w-full max-w-md aspect-square">
                            <iframe
                              src={embedUrl}
                              title={currentProject.title}
                              className="w-full h-full border-0 rounded-lg"
                              allow="autoplay; fullscreen;"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                            <iframe
                              src={embedUrl}
                              title={currentProject.title}
                              className="w-full h-full border-0 rounded-lg"
                              allow="autoplay; fullscreen;"
                              style={{
                                minHeight: '400px',
                                width: '100%',
                                height: '100%',
                                maxWidth: '100%',
                                maxHeight: '100%'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : imageSources.length > 0 ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Main image - constrained to fit within container */}
                        <div className="relative z-10 max-w-full max-h-full">
                          <img
                            src={imageSources[currentImageIndex]}
                            alt={currentProject.title}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              maxHeight: 'calc(100vh - 300px)', // Ensure it doesn't exceed viewport
                              maxWidth: '100%'
                            }}
                            onLoad={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.naturalWidth && img.naturalHeight) {
                                setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                              }
                            }}
                          />
                        </div>

                        {/* Floating navigation arrows for images */}
                        {imageSources.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex(prev => (prev - 1 + imageSources.length) % imageSources.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-white z-20 hover:text-white transition-colors"
                              style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.75))' }}
                              aria-label="Previous image"
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                              </svg>
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex(prev => (prev + 1) % imageSources.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white z-20 hover:text-white transition-colors"
                              style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.75))' }}
                              aria-label="Next image"
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                              </svg>
                            </button>
                          </>
                        )}

                        {/* Expand button */}
                        <button
                          onClick={() => { setIsImageModalOpen(true); setModalImageIndex(currentImageIndex); }}
                          className="absolute top-2 right-2 w-8 h-8 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                          aria-label="Expand image"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h6v6"/>
                            <path d="M9 21H3v-6"/>
                            <path d="M21 3l-7 7"/>
                            <path d="M3 21l7-7"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="text-white/60 text-sm font-mono ink-bleed-text">[ARTIFACT VISUAL DATA]</div>
                          <div className="text-white/40 text-xs font-mono ink-bleed-text">
                            Supports: Images • Videos • Interactive Demos • Embeds
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Side text panel for portrait and square (incl. Bandcamp) */}
                  {(isPortrait || isSquare) && (
                    <div className="w-64">
                      <div className="rounded-lg max-h-[calc(100vh-300px)] overflow-y-auto paper-text-panel">
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span 
                              className="text-xs text-cyan-600 tracking-widest"
                              style={{ filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})` }}
                            >
                              {currentProject.archiveRef}
                            </span>
                            <span className={`text-xs px-2 py-1 status-indicator ${getStatusColor(currentProject.status)}`}>
                              {currentProject.status}
                            </span>
                          </div>

                          <h3 
                            className="text-lg font-bold tracking-wide project-title" 
                            style={{ 
                              color: '#3A3428',
                              filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                            }}
                          >
                            {currentProject.title}
                          </h3>
                          <p 
                            className="text-xs font-mono italic" 
                            style={{ 
                              color: '#4A4235',
                              filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                            }}
                          >
                            {currentProject.subtitle}
                          </p>

                          <p 
                            className="text-sm leading-relaxed" 
                            style={{ 
                              color: '#3A3428',
                              filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                            }}
                          >
                            {currentProject.description}
                          </p>

                          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div>
                              <span 
                                className="block metadata-label" 
                                style={{ 
                                  color: '#5C5347',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                DATE RECOVERED:
                              </span>
                              <span 
                                style={{ 
                                  color: '#3A3428',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                {currentProject.dateRecovered}
                              </span>
                            </div>
                            <div>
                              <span 
                                className="block metadata-label" 
                                style={{ 
                                  color: '#5C5347',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                MEDIUM:
                              </span>
                              <span 
                                style={{ 
                                  color: '#3A3428',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                {currentProject.medium.join(' | ')}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {currentProject.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="text-xs px-2 py-1 tag-label"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom text panel for landscape */}
                {!isPortrait && !isSquare && (
                  <div className="mt-4 block">
                    {/* Text Content Panel */}
                    <div className={`w-full`}>
                      <div className="rounded-lg max-h-48 overflow-y-auto paper-text-panel">
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span 
                              className="text-xs text-cyan-600 tracking-widest"
                              style={{ filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})` }}
                            >
                              {currentProject.archiveRef}
                            </span>
                            <span className={`text-xs px-2 py-1 status-indicator ${getStatusColor(currentProject.status)}`}>
                              {currentProject.status}
                            </span>
                          </div>

                          <h3 
                            className="text-lg font-bold tracking-wide project-title" 
                            style={{ 
                              color: '#3A3428',
                              filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                            }}
                          >
                            {currentProject.title}
                          </h3>
                          <p 
                            className="text-xs font-mono italic" 
                            style={{ 
                              color: '#4A4235',
                              filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                            }}
                          >
                            {currentProject.subtitle}
                          </p>

                          <p 
                            className="text-sm leading-relaxed" 
                            style={{ 
                              color: '#3A3428',
                              filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                            }}
                          >
                            {currentProject.description}
                          </p>

                          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div>
                              <span 
                                className="block metadata-label" 
                                style={{ 
                                  color: '#5C5347',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                DATE RECOVERED:
                              </span>
                              <span 
                                style={{ 
                                  color: '#3A3428',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                {currentProject.dateRecovered}
                              </span>
                            </div>
                            <div>
                              <span 
                                className="block metadata-label" 
                                style={{ 
                                  color: '#5C5347',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                MEDIUM:
                              </span>
                              <span 
                                style={{ 
                                  color: '#3A3428',
                                  filter: `blur(${animatedInkBlur}px) url(#ink-bleed-filter-${inkThreshold.toFixed(1)})`
                                }}
                              >
                                {currentProject.medium.join(' | ')}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {currentProject.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="text-xs px-2 py-1 tag-label"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project-level navigation chevrons */}
                {filteredProjects.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute top-1/2 -translate-y-1/2 text-[#2F2A1F] hover:text-black z-30"
                      style={{ left: '-26px', filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.35))' }}
                      aria-label="Previous project"
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute top-1/2 -translate-y-1/2 text-[#2F2A1F] hover:text-black z-30"
                      style={{ right: '-26px', filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.35))' }}
                      aria-label="Next project"
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                      </svg>
                    </button>
                  </>
                )}
                </div>

                {/* Project Navigation - Bottom */}
                {filteredProjects.length > 1 && (
                  <div className="mt-4 flex justify-center space-x-2">
                    {filteredProjects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: index === displayIndex ? '#8B7355' : '#C9B991'
                        }}
                        onMouseEnter={(e) => {
                          if (index !== displayIndex) {
                            e.currentTarget.style.backgroundColor = '#A69570';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index !== displayIndex) {
                            e.currentTarget.style.backgroundColor = '#C9B991';
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageSources.length > 0 && isImageModalOpen && typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999]">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsImageModalOpen(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center" onClick={() => setIsImageModalOpen(false)}>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={imageSources[modalImageIndex]}
                  alt={`${currentProject.title} - image ${modalImageIndex + 1}`}
                  className="max-w-[92vw] max-h-[92vh] object-contain"
                />
                {imageSources.length > 1 && (
                  <>
                    <button
                      onClick={() => setModalImageIndex(prev => (prev - 1 + imageSources.length) % imageSources.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                      aria-label="Previous image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => setModalImageIndex(prev => (prev + 1) % imageSources.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                      aria-label="Next image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      }

      <style jsx>{`
        /* Ink bleed effect from Andy Jakubowski's tutorial */
        /* https://andyjakubowski.com/tutorial/ink-bleed-effect-with-svg-filters */
        .ink-bleed-text {
          filter: blur(0.6px) url(#ink-bleed-filter-0.5);
        }

        .tab-button {
          position: relative;
          z-index: 1;
          --tab-bg: #E3D6BC;
          background: var(--tab-bg);
          border: none;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          color: #2F2A1F;
          min-width: 140px;
          padding: 10px 22px 8px 22px; /* increased padding to compensate for scaleY */
          transition: none;
        }
        /* Outward flares with no inner rectangle using gradients */
        .tab-button::before,
        .tab-button::after {
          content: '';
          position: absolute;
          bottom: -6px; /* nudge downward */
          width: 22px;
          height: 22px;
          z-index: 0; /* keep behind the tab face to avoid bleed */
          pointer-events: none;
          transition: none;
        }
        .tab-button::before {
          left: -16.5px; /* further inward to align */
          background: radial-gradient(circle at 0 0, transparent 16.49px, var(--tab-bg) 16.5px);
          -webkit-mask: radial-gradient(circle at 0 0, transparent 16.49px, #000 16.5px);
          mask: radial-gradient(circle at 0 0, transparent 16.49px, #000 16.5px);
        }
        .tab-button::after {
          right: -16px; /* further inward to align */
          background: radial-gradient(circle at 100% 0, transparent 15.99px, var(--tab-bg) 16px);
          -webkit-mask: radial-gradient(circle at 100% 0, transparent 15.99px, #000 16px);
          mask: radial-gradient(circle at 100% 0, transparent 15.99px, #000 16px);
        }
        .tab-button.no-curves::before {
          content: none; /* remove only left outer curve on specific tabs (e.g., home) */
        }
        .tab-button:hover { --tab-bg: #D8C9AE; background: var(--tab-bg); }
        .tab-active { 
          --tab-bg: #EDE3CE;
          background: var(--tab-bg);
          z-index: 2; 
        }
        .ink-bleed-text {
          font-family: 'GaldienStamp', 'Zombnze', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          letter-spacing: 0.12em;
          font-weight: normal;
          text-transform: lowercase;
          font-size: 1rem;
          text-shadow: 0.5px 0.5px 0px rgba(0,0,0,0.1), 1px 1px 0px rgba(0,0,0,0.05);
          color: #2F2A1F;
          transform: scaleY(0.8);
          transform-origin: center;
        }
        .project-title {
          font-family: 'GaldienStamp', 'Zombnze', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          letter-spacing: 0.05em;
          font-size: 1.4rem;
          transform: scaleY(0.9);
          transform-origin: center;
        }
        .metadata-label {
          font-family: 'GaldienStamp', 'Zombnze', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          letter-spacing: 0.08em;
          transform: scaleY(0.8);
          transform-origin: center;
        }
        .status-indicator {
          font-family: 'GaldienStamp', 'Zombnze', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          letter-spacing: 0.05em;
          transform: scaleY(0.8);
          transform-origin: center;
          border: 1px solid;
          border-radius: 2px;
          padding: 6px 6px 4px 6px;
        }
        .status-active {
          background-color: #F0E8D8;
          border-color: #B8A082;
          color: #3A3428;
        }
        .status-archived {
          background-color: #F5F5F5;
          border-color: #B8B8B8;
          color: #5A5A5A;
        }
        .status-in-progress {
          background-color: #E8F0F8;
          border-color: #87CEEB;
          color: #2E5A7A;
        }
        .tag-label {
          font-family: 'GaldienStamp', 'Zombnze', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          letter-spacing: 0.05em;
          transform: scaleY(0.8);
          transform-origin: center;
          background-color: #F8F6F0;
          border: 1px solid #E3D6BC;
          border-radius: 2px;
          color: #5C5347;
          padding: 6px 6px 4px 6px;
        }

        /* Stacked paper card effect (slightly lighter than folder background) */
        .paper-stack {
          /* subtle paper texture over base color */
          background-color: #F7F1E4; /* lighter than #E9E0CC */
          background-image: linear-gradient(rgba(247,241,228,0.86), rgba(247,241,228,0.86)), url('/Texturelabs_Paper_373M.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          border-radius: 0px;
          /* very light outline to separate from back layers */
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .paper-text-panel {
          background-color: #F7F1E4;
          background-image: linear-gradient(rgba(247,241,228,0.86), rgba(247,241,228,0.86)), url('/Texturelabs_Paper_373M.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .paper-stack::before,
        .paper-stack::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 98%;
          z-index: -1;
          border-radius: 0px;
        }
        .paper-stack::before {
          background-color: #FBF6EA;
          background-image: linear-gradient(rgba(251,246,234,0.78), rgba(251,246,234,0.78)), url('/Texturelabs_Paper_373M.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          /* stronger separation to delineate layer */
          border: 1px solid rgba(0,0,0,0.10);
          box-shadow: 0 3px 8px rgba(0,0,0,0.16);
          left: -10px;
          top: 6px;
          transform: rotate(-1.6deg) scale(0.994);
        }
        .paper-stack::after {
          background-color: #FAF3E6;
          background-image: linear-gradient(rgba(250,243,230,0.80), rgba(250,243,230,0.80)), url('/Texturelabs_Paper_373M.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 6px rgba(0,0,0,0.14);
          right: -6px;
          top: 2px;
          transform: rotate(1.1deg) scale(0.996);
        }



        .carousel-rail {
          background-color: #F7F1E4;
          border: 2px solid #D8C9AE;
          border-radius: 8px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10; /* Ensure it's above the card */
          cursor: pointer;
          transition: background-color 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .card-wrapper {
          position: relative;
          overflow: visible;
        }
        .carousel-rail:hover {
          background-color: #F2EFE7;
          border-color: #3A3428;
        }
        .carousel-rail:active {
          background-color: #E8DCC6;
          border-color: #2A2419;
        }
        .carousel-rail svg {
          color: #5C5347;
          transition: color 0.3s ease;
        }
        .carousel-rail:hover svg {
          color: #3A3428;
        }
        
        /* Landscape image optimization */
        .landscape-image-container { aspect-ratio: 21/9; min-height: 14rem; }
        
        .portrait-image-container {
          height: 28rem;
        }
        /* Square embed container (e.g., Bandcamp) */
        .square-embed-container {
          aspect-ratio: 1 / 1;
          width: 100%;
          margin: 1rem auto 0; /* add a bit of top spacing */
          position: relative;
        }
        .square-embed-inner {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 65%;
          height: 100%;
        }
        /* Portrait floating effect */
        .portrait-floating {
          position: relative;
          z-index: 10;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border-radius: 8px;
          overflow: hidden;
        }
        .portrait-floating::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #F7F1E4, #EDE3CE, #E3D6BC);
          border-radius: 10px;
          z-index: -1;
        }
        /* Landscape image container */
        .landscape-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .landscape-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        /* Navigation arrows */
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 20;
        }
        .nav-arrow:hover {
          background: rgba(255,255,255,1);
          transform: translateY(-50%) scale(1.1);
        }
        .nav-arrow.prev {
          left: 10px;
        }
        .nav-arrow.next {
          right: 10px;
        }
        /* Expand button */
        .expand-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 20;
        }
        .expand-button:hover {
          background: rgba(255,255,255,1);
          transform: scale(1.1);
        }
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
        }
        .modal-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }
        /* Project navigation */
        .project-nav {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }
        .project-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D8C9AE;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .project-dot.active {
          background: #8B7355;
        }
        .project-dot:hover:not(.active) {
          background: #A69570;
        }
        /* Breadcrumb styles */
        .breadcrumb-container {
          display: flex;
          align-items: end;
          gap: 4px;
          margin-bottom: 16px;
        }
        .breadcrumb-tab {
          background: #E3D6BC;
          border: none;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          padding: 10px 22px 8px 22px;
          color: #2F2A1F;
          cursor: pointer;
          transition: background-color 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .breadcrumb-tab.active {
          background: #EDE3CE;
          z-index: 2;
        }
        .breadcrumb-tab:hover:not(.active) {
          background: #D8C9AE;
        }
        /* Text panel styles */
        .text-panel {
          background: #F7F1E4;
          border-radius: 8px;
          padding: 16px;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #E3D6BC;
        }
        .text-panel h3 {
          margin: 0 0 8px 0;
          color: #2A2419;
        }
        .text-panel p {
          margin: 0 0 8px 0;
          color: #3A3428;
        }
        .text-panel .metadata {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 12px 0;
        }
        .text-panel .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 12px;
        }
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .breadcrumb-container {
            flex-wrap: wrap;
          }
          .text-panel {
            max-height: 200px;
          }
        }
      `}</style>
    </div>
  );
});

export default ArchiveViewer;