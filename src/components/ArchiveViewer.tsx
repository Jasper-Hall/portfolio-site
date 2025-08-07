'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ProjectData {
  id: string;
  archiveRef: string;
  title: string;
  subtitle: string;
  description: string;
  dateRecovered: string;
  medium: string[];
  status: 'Active' | 'Prototype' | 'Retired';
  contentType: 'image' | 'video' | 'interactive' | 'embed' | 'iframe';
  content: string; // URL, embed code, or path
  aspectRatio?: string; // For responsive content
  tags: string[];
}

const sampleProjects: ProjectData[] = [
  {
    id: "RHEO-02",
    archiveRef: "RHEO-02",
    title: "Mutax",
    subtitle: "Soōñl | fanißl deocǧ",
    description: "Generative ritual interface for sonic metamorphosis",
    dateRecovered: "2023.06.14",
    medium: ["Audio-visual", "Web tool", "Ritual interface"],
    status: "Active",
    contentType: "interactive",
    content: "https://example.com/mutax-demo",
    aspectRatio: "16:9",
    tags: ["sound", "ritual device", "2023"]
  },
  {
    id: "RHM-004", 
    archiveRef: "RHM-004",
    title: "Neural Cartography",
    subtitle: "mıłø pırl-tœčıc ȴhıß 06.04",
    description: "Interactive mind-mapping interface for consciousness exploration",
    dateRecovered: "2023.09.22",
    medium: ["Interactive", "Data visualization", "P5.js"],
    status: "Prototype",
    contentType: "video",
    content: "/videos/neural-cartography-demo.mp4",
    aspectRatio: "16:9",
    tags: ["visualization", "consciousness", "interactive"]
  },
  {
    id: "XTS-07",
    archiveRef: "XTS-07", 
    title: "Temporal Threads",
    subtitle: "canətəә sałə heχ roe",
    description: "Time-based narrative weaving through digital archaeology",
    dateRecovered: "2023.03.15",
    medium: ["Narrative", "Digital art", "Time-based media"],
    status: "Retired",
    contentType: "image",
    content: "/images/temporal-threads-screenshot.jpg",
    aspectRatio: "4:3",
    tags: ["time", "narrative", "archaeology"]
  },
  {
    id: "VEX-12",
    archiveRef: "VEX-12",
    title: "Void Resonance", 
    subtitle: "parlər: parlʇ[ l iniḣeɔ spøtįes",
    description: "Ambient soundscape generator drawing from quantum fluctuations",
    dateRecovered: "2023.11.08",
    medium: ["Audio", "Generative", "Quantum interface"],
    status: "Active",
    contentType: "embed",
    content: '<iframe src="https://example.com/void-resonance" frameborder="0"></iframe>',
    aspectRatio: "1:1",
    tags: ["ambient", "quantum", "generative"]
  },
  {
    id: "INF-03",
    archiveRef: "INF-03",
    title: "Membrane Protocol",
    subtitle: "ızįqųι. pıŀıəș.",
    description: "Boundary dissolution mechanism for digital-physical integration",
    dateRecovered: "2023.07.29",
    medium: ["Protocol", "Mixed reality", "Interface design"],
    status: "Prototype", 
    contentType: "iframe",
    content: "https://membrane-protocol-demo.netlify.app",
    aspectRatio: "16:10",
    tags: ["protocol", "mixed reality", "boundaries"]
  }
];

interface ArchiveViewerProps {
  className?: string;
}

const ArchiveViewer: React.FC<ArchiveViewerProps> = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scannerPosition, setScannerPosition] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Scanner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScannerPosition(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);



  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleProjects.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sampleProjects.length) % sampleProjects.length);
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling while swiping
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        goToNext(); // Swipe left = next
      } else {
        goToPrevious(); // Swipe right = previous
      }
    }
  };

  // Mouse handlers for desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  const currentProject = sampleProjects[currentIndex];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 border-green-400/30';
      case 'Prototype': return 'text-yellow-400 border-yellow-400/30';
      case 'Retired': return 'text-gray-400 border-gray-400/30';
      default: return 'text-white border-white/30';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Archive Feed Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-mono text-white/90 tracking-wider">
            ARCHIVE FEED
          </h2>
          <div className="text-xs font-mono text-white/60">
            {currentIndex + 1} / {sampleProjects.length}
          </div>
        </div>
        
        {/* Scanner Bar */}
        <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute h-full w-8 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent rounded-full transition-all duration-100"
            style={{ left: `${scannerPosition}%`, transform: 'translateX(-50%)' }}
          />
        </div>

      </div>

      {/* Main Archive Viewer */}
      <div 
        ref={containerRef}
        className="relative w-full h-[420px] md:h-[460px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden group archive-viewer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        {/* Content Container - Flexible for different media types */}
        <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-900/50">
                     {/* Placeholder for actual content - will be replaced with real portfolio items */}
           <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out">
            {/* This area will support: images, videos, iframes, interactive demos, etc. */}
            <div className="text-center space-y-2">
              <div className="text-white/60 text-sm font-mono">[ARTIFACT VISUAL DATA]</div>
              <div className="text-white/40 text-xs font-mono">
                Supports: Images • Videos • Interactive Demos • Embeds
              </div>
            </div>
          </div>
          
          {/* Scanning Grid Overlay */}
          <div className="absolute inset-0 opacity-30 archive-scanner-grid">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div 
                  key={i} 
                  className="border border-cyan-500/20" 
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
          
          {/* Vertical Scan Line */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/80 to-transparent scan-line opacity-60" />
          </div>
          
          {/* Data Stream Lines */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="absolute h-0.5 w-16 bg-gradient-to-r from-transparent via-green-400/60 to-transparent data-stream"
                style={{ 
                  top: `${20 + i * 30}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
          
          {/* Corner Brackets with glow */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-cyan-400/60 archive-glow"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-cyan-400/60 archive-glow"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-cyan-400/60 archive-glow"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-cyan-400/60 archive-glow"></div>
          

        </div>

        {/* Project Information Panel */}
        <div className="p-4 md:p-5 pb-6 md:pb-8 space-y-2 md:space-y-3">
          {/* Archive Reference & Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 tracking-widest">
                {currentProject.archiveRef}
              </span>
              <span className={`text-xs font-mono px-2 py-1 rounded border ${getStatusColor(currentProject.status)}`}>
                {currentProject.status}
              </span>
            </div>
            
            <h3 className="text-xl font-mono text-white font-bold tracking-wide">
              {currentProject.title}
            </h3>
            
            <p className="text-sm font-mono text-white/70 italic">
              {currentProject.subtitle}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-white/80 leading-relaxed">
            {currentProject.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-white/50 block">DATE RECOVERED:</span>
              <span className="text-white/80">{currentProject.dateRecovered}</span>
            </div>
            <div>
              <span className="text-white/50 block">MEDIUM:</span>
              <span className="text-white/80">{currentProject.medium.join(' | ')}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {currentProject.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs font-mono px-2 py-1 bg-white/10 border border-white/20 rounded text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={goToPrevious}
            className="ml-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={goToNext}
            className="mr-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Archive Index Dots */}
      <div className="flex justify-center space-x-2 mt-4 pb-2">
        {sampleProjects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ArchiveViewer;