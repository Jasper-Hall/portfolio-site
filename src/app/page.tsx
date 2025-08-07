'use client';

import MindMap from '@/components/MindMap';
import Navigation from '@/components/Navigation';
import RippleShader from '@/components/RippleShader';
import ArchiveViewer, { ArchiveViewerRef } from '@/components/ArchiveViewer';
import { useState, useRef, useEffect } from 'react';

interface NavigationPath {
  level: string;
  sublevel?: string;
}

export default function Home() {
  const [currentPath, setCurrentPath] = useState<NavigationPath>({ level: 'home' });
  const archiveViewerRef = useRef<ArchiveViewerRef>(null);

  const handlePathChange = (path: NavigationPath) => {
    setCurrentPath(path);
  };

  const handleSectionClick = (sectionName: string) => {
    setCurrentPath({ level: sectionName });
  };

  const handleSubBranchClick = (sectionName: string, subBranchName: string) => {
    setCurrentPath({ level: sectionName, sublevel: subBranchName });
  };

  const handleBranchHover = (branchName: string | null) => {
    // Use ref to directly call method on ArchiveViewer without re-rendering
    if (archiveViewerRef.current && archiveViewerRef.current.handleHover) {
      archiveViewerRef.current.handleHover(branchName);
    }
  };

  return (
    <main className="min-h-screen relative">
      {/* Forest Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/masaaki-komori-hFH1bK2CYSE-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Main Content Grid */}
      <div className="relative z-10 min-h-screen pb-20 md:pb-24 lg:pb-28">
        <div className="p-2 md:p-4 lg:p-6 grid grid-cols-2 gap-4 grid-portrait-single xl:h-screen xl:overflow-hidden">
          
          {/* Left Panel - Mind Map with RippleShader Background */}
          <div className="rounded-3xl relative overflow-hidden min-h-[500px] max-h-[80vh]">
            <RippleShader />
            <MindMap 
              className="w-full h-full" 
              onSectionClick={handleSectionClick}
              onSubBranchClick={handleSubBranchClick}
              onBranchHover={handleBranchHover}
            />
          </div>
          
          {/* Right Panel - Archive Viewer */}
          <div className="rounded-3xl relative overflow-hidden min-h-[500px] max-h-[80vh]">
            <ArchiveViewer 
              ref={archiveViewerRef}
              className="w-full h-full" 
              currentPath={currentPath}
              onPathChange={handlePathChange}
            />
          </div>
          
        </div>
      </div>
      
      {/* Navigation */}
      <Navigation />
    </main>
  );
}
