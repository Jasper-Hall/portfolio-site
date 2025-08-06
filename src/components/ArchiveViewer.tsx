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
  image: string;
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
    image: "/api/placeholder/600/400",
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
    image: "/api/placeholder/600/400",
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
    image: "/api/placeholder/600/400",
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
    image: "/api/placeholder/600/400",
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
    image: "/api/placeholder/600/400",
    tags: ["protocol", "mixed reality", "boundaries"]
  }
];

interface ArchiveViewerProps {
  className?: string;
}

const ArchiveViewer: React.FC<ArchiveViewerProps> = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scannerPosition, setScannerPosition] = useState(0);

  // Scanner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScannerPosition(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Connection status animation
  useEffect(() => {
    if (isTransitioning) {
      setConnectionStatus(`Retrieving Artifact ${currentIndex + 1}/${sampleProjects.length}...`);
      const timeout = setTimeout(() => {
        setConnectionStatus('');
        setIsTransitioning(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, currentIndex]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % sampleProjects.length);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + sampleProjects.length) % sampleProjects.length);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
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
        
        {/* Connection Status */}
        {connectionStatus && (
          <div className="mt-2 text-xs font-mono text-cyan-400/80 animate-pulse">
            {connectionStatus}
          </div>
        )}
      </div>

      {/* Main Archive Viewer */}
      <div 
        ref={containerRef}
        className="relative w-full h-[450px] md:h-[500px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden group archive-viewer"
      >
        {/* Project Image Container */}
        <div className="relative w-full h-48 md:h-64 overflow-hidden">
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-white/60 text-sm font-mono transition-all duration-1000 ease-out ${
              isTransitioning ? 'blur-sm scale-105' : 'blur-0 scale-100'
            }`}
          >
            [ARTIFACT VISUAL DATA]
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
          
          {/* HUD Elements */}
          <div className="absolute top-4 left-4 text-xs font-mono text-cyan-400/70 archive-flicker">
            ◉ ACTIVE
          </div>
          <div className="absolute top-4 right-4 text-xs font-mono text-green-400/70 archive-flicker">
            ⚡ SYNCED
          </div>
        </div>

        {/* Project Information Panel */}
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
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
            disabled={isTransitioning}
            className="ml-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="mr-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Archive Index Dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {sampleProjects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
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