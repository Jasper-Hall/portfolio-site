'use client';

import React, { useRef, useState } from 'react';
import MindMap, { MindMapRef } from './MindMap';
import ArchiveViewer, { ArchiveViewerRef } from './ArchiveViewer';
import RippleShader, { RippleShaderRef } from './RippleShader';
import { NavigationPath } from '@/data/types';

interface SplitViewProps {
  className?: string;
}

const SplitView: React.FC<SplitViewProps> = ({ className = '' }) => {
  const [currentPath, setCurrentPath] = useState<NavigationPath>({ level: 'home' });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);
  const archiveViewerRef = useRef<ArchiveViewerRef>(null);
  const rippleShaderRef = useRef<RippleShaderRef>(null);
  const mindMapRef = useRef<MindMapRef>(null);

  const handlePathChange = (path: NavigationPath, previousPath?: NavigationPath) => {
    console.log('handlePathChange - path:', path, 'currentPath:', currentPath);
    
    if (path.level === 'home') {
      console.log('Going to home');
      setExpandedSection(null);
      setExpandedSubcategory(null);
    } else {
      console.log('Setting expandedSection to:', path.level);
      setExpandedSection(path.level);
      if (path.sublevel) {
        setExpandedSubcategory(path.sublevel);
      } else {
        console.log('Clearing expandedSubcategory because no sublevel in path');
        setExpandedSubcategory(null);
      }
    }
    
    setCurrentPath(path);
    
    if (path.level === 'home' && mindMapRef.current) {
      mindMapRef.current.clearActiveSection();
    }
  };

  const handleSectionClick = (sectionName: string) => {
    const newPath = { level: sectionName };
    
    if (archiveViewerRef.current) {
      archiveViewerRef.current.updatePath(newPath);
    }
  };

  const handleSubBranchClick = (sectionName: string, subBranchName: string) => {
    const newPath = { level: sectionName, sublevel: subBranchName };
    
    if (archiveViewerRef.current) {
      archiveViewerRef.current.updatePath(newPath);
    }
  };

  const handleBranchHover = (branchName: string | null) => {
    if (archiveViewerRef.current && archiveViewerRef.current.handleHover) {
      archiveViewerRef.current.handleHover(branchName);
    }
    
    if (rippleShaderRef.current) {
      rippleShaderRef.current.setHoverState(branchName !== null);
    }
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="p-2 md:p-4 lg:p-6 grid grid-cols-2 gap-4 grid-portrait-single xl:h-screen xl:overflow-hidden">
        
        {/* Left Panel - Mind Map with RippleShader Background */}
        <div className="rounded-3xl relative overflow-hidden min-h-[500px] max-h-[85vh]">
          <RippleShader ref={rippleShaderRef} />
          <MindMap 
            ref={mindMapRef}
            className="w-full h-full" 
            onSectionClick={handleSectionClick}
            onSubBranchClick={handleSubBranchClick}
            onBranchHover={handleBranchHover}
            expandedSection={expandedSection}
            expandedSubcategory={expandedSubcategory}
          />
        </div>
        
        {/* Right Panel - Archive Viewer */}
        <div className="rounded-3xl relative overflow-visible min-h-[500px] max-h-[85vh]">
          <ArchiveViewer 
            ref={archiveViewerRef}
            className="w-full h-full" 
            currentPath={currentPath}
            onPathChange={handlePathChange}
          />
        </div>
        
      </div>
    </div>
  );
};

export default SplitView;
