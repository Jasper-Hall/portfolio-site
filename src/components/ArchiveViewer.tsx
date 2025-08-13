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
  // 3D tilt + animation state for project card
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCardHover, setIsCardHover] = useState<boolean>(false);
  const [swapDirection, setSwapDirection] = useState<'next' | 'prev'>('next');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [isProjectViewerHovered, setIsProjectViewerHovered] = useState<boolean>(false);
  const isPortrait = imageNaturalSize ? imageNaturalSize.h > imageNaturalSize.w : false;

  // Expose handleHover and updatePath methods to parent component
  useImperativeHandle(ref, () => ({
    handleHover: (branchName: string | null) => {
      if (branchName && internalPath.level === 'home') {
        // Find the index of the hovered branch's featured project in the filtered projects
        const featuredProjects = getFeaturedProjectsInMindMapOrder();
        const hoveredIndex = featuredProjects.findIndex(p => p.category === branchName);
        if (hoveredIndex >= 0) {
          setLastHoveredIndex(hoveredIndex);
        }
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
      // Use the actual featured projects in MindMap order
      return getFeaturedProjectsInMindMapOrder();
    } else if (internalPath.sublevel) {
      // Show projects from specific subcategory
      return getProjectsBySubcategory(internalPath.level, internalPath.sublevel);
    } else {
      // Show featured projects from specific category
      const categoryProjects = getProjectsByCategory(internalPath.level);
      return categoryProjects.filter(p => p.featured);
    }
  };

  const filteredProjects = getFilteredProjects();
  
  // Get the index of the hovered category's featured project
  const getHoveredProjectIndex = (): number => {
    if (hoveredBranch && currentPath.level === 'home') {
      return lastHoveredIndex;
    }
    return currentIndex;
  };
  
  const displayIndex = getHoveredProjectIndex();
  const currentProject = filteredProjects[displayIndex] || filteredProjects[0];
  const imageSources: string[] = currentProject
    ? (currentProject.images && currentProject.images.length > 0
        ? currentProject.images
        : (currentProject.gallery?.filter(item => item.type === 'image').map(item => item.src) || []))
    : [];

  const embedBlock = currentProject?.contentBlocks?.find(b => b.type === 'embed' && b.embedUrl);
  const embedUrl = embedBlock && (embedBlock as any).embedUrl as string | undefined;
  const isBandcampEmbed = !!embedUrl && embedUrl.includes('bandcamp.com/EmbeddedPlayer');

  useEffect(() => {
    setCurrentImageIndex(0);
    setModalImageIndex(0);
    setIsImageModalOpen(false);
    setImageNaturalSize(null);
  }, [currentProject?.id]);

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
    if (isAutoPlaying && filteredProjects.length > 1 && !isProjectViewerHovered) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredProjects.length);
      }, 4000); // Change every 4 seconds
    }

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, [isAutoPlaying, filteredProjects.length, isProjectViewerHovered]);

  // Pause auto-play on hover
  useEffect(() => {
    if (hoveredBranch) {
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
      // When unhovering, set the current index to the last hovered index so auto-play continues from here
      setCurrentIndex(lastHoveredIndex);
    }
  }, [hoveredBranch, lastHoveredIndex]);

  // Reset index when path changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [internalPath]);

  const goToNext = () => {
    if (filteredProjects.length > 1) {
      setSwapDirection('next');
      setCurrentIndex(prev => (prev + 1) % filteredProjects.length);
    }
  };

  const goToPrevious = () => {
    if (filteredProjects.length > 1) {
      setSwapDirection('prev');
      setCurrentIndex(prev => (prev - 1 + filteredProjects.length) % filteredProjects.length);
    }
  };

  const goToSlide = (index: number) => {
    setSwapDirection(index > currentIndex ? 'next' : 'prev');
    setCurrentIndex(index);
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

  return (
    <div className={`relative h-full ${className}`}>
      {/* Manila Folder Tabs */}
      <div className="mb-4">
        <div className="flex items-end space-x-1">
                    {(() => {
            const crumbs = generateBreadcrumbs();
            const total = crumbs.length;
            return crumbs.map((breadcrumb, index) => {
              // Three-tier shade: darkest HOME, medium middle, lightest active
              let tierBg: string | undefined;
              if (!breadcrumb.isActive && total === 3) {
                if (index === 0) tierBg = '#D8C9AE'; // darkest
                if (index === 1) tierBg = '#E3D6BC'; // medium (default)
              }
              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleTabClick(breadcrumb.path)}
                    className={`
                      tab-button ink-bleed-text ${breadcrumb.name === 'home' ? 'no-curves' : ''}
                      px-6 py-2.5 text-sm tracking-wider transition-all duration-200
                      ${breadcrumb.isActive ? 'tab-active shadow-sm' : ''}
                    `}
                    style={{
                      color: '#2F2A1F'
                    }}
                  >
                    {breadcrumb.name}
                  </button>
                  {breadcrumb.isActive && (
                    <div 
                      className="absolute -bottom-1 left-0 right-0 h-1 rounded-b-sm"
                      style={{ backgroundColor: '#E8DCC6' }}
                    ></div>
                  )}
                </div>
              );
            });
          })()}
        </div>
        
                {/* Folder Container */}
         <div 
           className="rounded-b-2xl rounded-tr-2xl shadow-lg h-full folder-container"
         >
          <div className="p-4 md:p-6">
            {/* Project Card */}
            {currentProject && (
              <div 
                className="relative card-wrapper"
                onMouseEnter={() => setIsProjectViewerHovered(true)}
                onMouseLeave={() => setIsProjectViewerHovered(false)}
              >
                <div 
                  className="rounded-lg relative paper-card overflow-y-auto max-h-[75vh]"
                  style={{
                    backgroundColor: '#FEFCF8',
                    boxShadow: isCardHover
                      ? '0 10px 18px rgba(184,160,130,0.28), 0 6px 12px rgba(184,160,130,0.18)'
                      : '0 4px 12px rgba(184,160,130,0.25), 0 2px 6px rgba(184,160,130,0.15)',
                    transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: 'transform 150ms ease, box-shadow 200ms ease'
                  }}
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rotateY = ((x / rect.width) - 0.5) * 3; // -1.5deg..1.5deg
                    const rotateX = -((y / rect.height) - 0.5) * 2; // -1deg..1deg
                    setTilt({ x: rotateX, y: rotateY });
                    setIsCardHover(true);
                  }}
                  onMouseEnter={() => setIsCardHover(true)}
                  onMouseLeave={() => {
                    setIsCardHover(false);
                    setTilt({ x: 0, y: 0 });
                  }}
                >
                  {/* Animated Card Content */}
                  <div key={currentProject.id} className={swapDirection === 'next' ? 'card-anim-next' : 'card-anim-prev'}>
                    {/* Project Content */}
                    <div
                      className={`relative w-full overflow-hidden bg-gray-900/50 ${embedUrl ? (isBandcampEmbed ? 'square-embed-container' : 'landscape-image-container') : (isPortrait ? 'portrait-image-container' : 'landscape-image-container')}`}
                    >
                      {embedUrl ? (
                        (isBandcampEmbed ? (
                          <div className="square-embed-inner">
                            <iframe
                              src={embedUrl}
                              title={currentProject.title}
                              className="absolute inset-0 w-full h-full z-10 border-0"
                              allow="autoplay; fullscreen;"
                            />
                          </div>
                        ) : (
                          <iframe
                            src={embedUrl}
                            title={currentProject.title}
                            className="absolute inset-0 w-full h-full z-10 border-0"
                            allow="autoplay; fullscreen;"
                          />
                        ))
                      ) : imageSources.length > 0 ? (
                        <>
                          {/* Blurred background fill */}
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${imageSources[currentImageIndex]})`,
                              backgroundSize: isPortrait ? 'contain' : 'cover',
                              backgroundPosition: 'center',
                              filter: 'blur(20px) brightness(0.6)',
                              transform: 'scale(1.1)'
                            }}
                          />
                          {/* Foreground image (contain) */}
                          <img
                            src={imageSources[currentImageIndex]}
                            alt={currentProject.title}
                            className={`absolute inset-0 w-full h-full z-10 ${isPortrait ? 'object-contain' : 'object-cover'}`}
                            onLoad={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.naturalWidth && img.naturalHeight) {
                                setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                              }
                            }}
                          />
                          {/* Inline image navigation */}
                          {imageSources.length > 1 && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + imageSources.length) % imageSources.length); }}
                                className="carousel-rail z-20"
                                style={{ left: '8px' }}
                                aria-label="Previous image"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % imageSources.length); }}
                                className="carousel-rail z-20"
                                style={{ right: '8px' }}
                                aria-label="Next image"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                              </button>
                            </>
                          )}
                          {/* Expand button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(true); setModalImageIndex(currentImageIndex); }}
                            className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white text-gray-800 border border-gray-300 rounded-md p-2 shadow-sm transition"
                            aria-label="Expand image"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 3h6v6"/>
                              <path d="M9 21H3v-6"/>
                              <path d="M21 3l-7 7"/>
                              <path d="M3 21l7-7"/>
                            </svg>
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="text-white/60 text-sm font-mono">[ARTIFACT VISUAL DATA]</div>
                            <div className="text-white/40 text-xs font-mono">
                              Supports: Images • Videos • Interactive Demos • Embeds
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Project Information */}
                    <div className="p-3 md:p-4 space-y-1 md:space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-cyan-600 tracking-widest">
                            {currentProject.archiveRef}
                          </span>
                          <span className={`text-xs px-2 py-1 status-indicator ${getStatusColor(currentProject.status)}`}>
                            {currentProject.status}
                          </span>
                        </div>
                        <h3 
                          className="text-lg font-bold tracking-wide project-title"
                          style={{ color: '#2A2419' }}
                        >
                          {currentProject.title}
                        </h3>
                        <p 
                          className="text-xs font-mono italic"
                          style={{ color: '#4A4235' }}
                        >
                          {currentProject.subtitle}
                        </p>
                      </div>

                      <p 
                        className="text-xs leading-relaxed"
                        style={{ color: '#3A3428' }}
                      >
                        {currentProject.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span 
                            className="block metadata-label"
                            style={{ color: '#5C5347' }}
                          >
                            DATE RECOVERED:
                          </span>
                          <span style={{ color: '#3A3428' }}>{currentProject.dateRecovered}</span>
                        </div>
                        <div>
                          <span 
                            className="block metadata-label"
                            style={{ color: '#5C5347' }}
                          >
                            MEDIUM:
                          </span>
                          <span style={{ color: '#3A3428' }}>{currentProject.medium.join(' | ')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {currentProject.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs px-1 py-0.5 tag-label"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls - outside the card */}
                {filteredProjects.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="carousel-rail"
                      style={{ left: '-32px' }}
                      aria-label="Previous"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={goToNext}
                      className="carousel-rail"
                      style={{ right: '-32px' }}
                      aria-label="Next"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Modal - render via portal to ensure it overlays everything including nav */}
                {imageSources.length > 0 && isImageModalOpen && typeof window !== 'undefined' &&
                  createPortal(
                    <div className="fixed inset-0 z-[99999]">
                      {/* Backdrop with blur that covers entire viewport including nav */}
                      <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setIsImageModalOpen(false)}
                      />
                      {/* Centered content */}
                      <div className="absolute inset-0 flex items-center justify-center" onClick={() => setIsImageModalOpen(false)}>
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <img
                            src={imageSources[modalImageIndex]}
                            alt={`${currentProject.title} - image ${modalImageIndex + 1}`}
                            className="max-w-[92vw] max-h-[92vh] object-contain rounded-md shadow-2xl"
                          />
                          {imageSources.length > 1 && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setModalImageIndex(prev => (prev - 1 + imageSources.length) % imageSources.length); }}
                                className="carousel-rail"
                                style={{ left: '-40px' }}
                                aria-label="Previous image"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setModalImageIndex(prev => (prev + 1) % imageSources.length); }}
                                className="carousel-rail"
                                style={{ right: '-40px' }}
                                aria-label="Next image"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

              </div>
            )}

            {/* Archive Index Dots */}
            {filteredProjects.length > 1 && (
              <div className="flex justify-center space-x-2 mt-3">
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
        </div>
      {/* Close grid container wrapper */}
    </div>
      <style jsx>{`
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
           color: #1a1a1a;
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
           border: 1px solid #D4C4A8;
           border-radius: 1px;
           color: #3A3428;
           padding: 5px 4px 3px 4px;
         }
         .folder-container { 
           background: #EDE3CE; 
           border-color: transparent; 
           border-top-left-radius: 0; /* unround left corner to avoid gap under first tab */
           border-top-right-radius: 18px;
           position: relative;
           overflow: visible;
         }
         /* Top seam cover bar */
         .folder-container::before {
           content: '';
           position: absolute;
           top: -4px; /* raise to cover corner rounding */
           left: 0; /* extend to left edge */
           right: 18px; /* stop short of right edge to reveal curve */
           height: 16px; /* taller to fully fill curve gap */
           background: linear-gradient(to right, #EDE3CE 0%, #EDE3CE 60%, transparent 100%);
           z-index: 3; /* in front of curves and body */
         }
         /* Paper card styling and texture */
         .paper-card { position: relative; }
         .paper-card::after {
           content: '';
           position: absolute;
           inset: 0;
           pointer-events: none;
           opacity: 0.15;
           background-image: radial-gradient(rgba(0,0,0,0.06) 0.5px, transparent 0.5px);
           background-size: 3px 3px;
           mix-blend-mode: multiply;
         }
         /* Swap animations */
         @keyframes cardInNext { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
         @keyframes cardInPrev { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
         .card-anim-next { animation: cardInNext 350ms ease both; }
         .card-anim-prev { animation: cardInPrev 350ms ease both; }
         .carousel-rail {
           position: absolute;
           top: 50%;
           transform: translateY(-50%);
           width: 24px; /* Thinner width */
           height: 80px; /* Taller for better visibility */
           background-color: #FEFCF8;
           border: 1px solid #D4C4A8;
           border-radius: 0; /* Remove rounded edges */
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
         .landscape-image-container {
           aspect-ratio: 16/9;
           min-height: 16rem;
         }
         
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
       `}</style>
    </div>
  );
});

export default ArchiveViewer;