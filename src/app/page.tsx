'use client';

import Navigation from '@/components/Navigation';
import Modal from '@/components/Modal';
import GlobalPreloader from '@/components/GlobalPreloader';
import { useState } from 'react';
import { ViewMode } from '@/components/ViewToggle';
import MindMapView from '@/components/MindMapView';
import SplitView from '@/components/SplitView';
import GalleryView from '@/components/GalleryView';



export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('split');
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: string | null }>({
    isOpen: false,
    type: null
  });



  const handleModalOpen = (modalName: string | null) => {
    if (modalName) {
      setModalState({ isOpen: true, type: modalName });
    }
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, type: null });
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const getModalContent = () => {
    switch (modalState.type) {
      case 'cv':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Curriculum Vitae</h3>
            <p>CV content will go here...</p>
          </div>
        );
      case 'links':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links</h3>
            <p>External links and social media will go here...</p>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About</h3>
            <p>About me content will go here...</p>
          </div>
        );
      case 'work':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Work With Me</h3>
            <p>Collaboration and work opportunities will go here...</p>
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  const getModalTitle = () => {
    switch (modalState.type) {
      case 'cv':
        return 'Curriculum Vitae';
      case 'links':
        return 'Links';
      case 'about':
        return 'About';
      case 'work':
        return 'Work With Me';
      default:
        return 'Modal';
    }
  };

  // Show preloader while loading
  if (isLoading) {
    return <GlobalPreloader onLoadComplete={handleLoadComplete} />;
  }

  return (
    <main className="min-h-screen relative">
      
      {/* Main Content Grid */}
      <div className="relative z-10 min-h-screen pb-20 md:pb-24 lg:pb-28">
        {currentView === 'mindmap' && (
          <MindMapView className="w-full h-full" />
        )}
        
        {currentView === 'split' && (
          <SplitView className="w-full h-full" />
        )}
        
        {currentView === 'gallery' && (
          <GalleryView className="w-full h-full" />
        )}
      </div>
      
      {/* Navigation */}
      <Navigation 
        onModalOpen={handleModalOpen} 
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        title={getModalTitle()}
      >
        {getModalContent()}
      </Modal>
    </main>
  );
}
