'use client';

import React, { useState, useRef, useEffect } from 'react';

export type ViewMode = 'mindmap' | 'split' | 'gallery';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartView, setDragStartView] = useState<ViewMode>(currentView);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const views: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'mindmap', label: 'Mind Map', icon: '🧠' },
    { key: 'split', label: 'Split View', icon: '⚡' },
    { key: 'gallery', label: 'Gallery', icon: '🖼️' }
  ];

  const getSliderPosition = (view: ViewMode) => {
    const index = views.findIndex(v => v.key === view);
    // Calculate position to center the slider over each button
    // For 3 buttons taking equal space: 16.67%, 50%, 83.33%
    return `${(index * 33.33) + 16.67}%`;
  };

  const getViewFromPosition = (clientX: number): ViewMode => {
    if (!containerRef.current) return currentView;
    
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const containerWidth = rect.width;
    
    // Divide container into 3 equal segments
    const segmentWidth = containerWidth / 3;
    const index = Math.floor(relativeX / segmentWidth);
    const clampedIndex = Math.max(0, Math.min(index, 2));
    
    return views[clampedIndex].key;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartView(currentView);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newView = getViewFromPosition(e.clientX);
    if (newView !== currentView) {
      onViewChange(newView);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragStartView(currentView);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const newView = getViewFromPosition(e.touches[0].clientX);
    if (newView !== currentView) {
      onViewChange(newView);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (view: ViewMode) => {
    if (!isDragging) {
      onViewChange(view);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, currentView]);

  useEffect(() => {
    // Update drag start view when currentView changes externally
    setDragStartView(currentView);
  }, [currentView]);

  return (
    <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20 relative">
      {/* Sliding indicator */}
      <div
        ref={sliderRef}
        className="absolute top-1 bottom-1 bg-white/20 rounded-full transition-all duration-300 ease-out shadow-lg"
        style={{
          left: getSliderPosition(currentView),
          width: '33.33%',
          transform: `translateX(-50%) ${isDragging ? 'scale(1.05)' : 'scale(1)'}`,
        }}
      />
      
      {/* View buttons */}
      {views.map((view) => (
        <button
          key={view.key}
          onClick={() => handleClick(view.key)}
          onMouseDown={handleMouseDown}
          className={`
            relative z-10 flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out flex-1
            ${currentView === view.key 
              ? 'text-white' 
              : 'text-white/70 hover:text-white/90'
            }
          `}
          title={view.label}
        >
          <span className="text-sm font-medium">{view.icon}</span>
        </button>
      ))}
      
      {/* Invisible drag area for better UX */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
    </div>
  );
};

export default ViewToggle;
