'use client';

import MindMap, { MindMapRef } from '@/components/MindMap';
import Navigation from '@/components/Navigation';
import RippleShader from '@/components/RippleShader';
import ArchiveViewer, { ArchiveViewerRef } from '@/components/ArchiveViewer';
import { RippleShaderRef } from '@/components/RippleShader';
import Modal from '@/components/Modal';
import { useState, useRef, useEffect } from 'react';

interface NavigationPath {
  level: string;
  sublevel?: string;
}

export default function Home() {
  const [currentPath, setCurrentPath] = useState<NavigationPath>({ level: 'home' });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const archiveViewerRef = useRef<ArchiveViewerRef>(null);
  const rippleShaderRef = useRef<RippleShaderRef>(null);
  const mindMapRef = useRef<MindMapRef>(null);

  const handlePathChange = (path: NavigationPath) => {
    setCurrentPath(path);
    // Clear active section in MindMap when navigating to home
    if (path.level === 'home' && mindMapRef.current) {
      mindMapRef.current.clearActiveSection();
    }
  };

  const handleSectionClick = (sectionName: string) => {
    const newPath = { level: sectionName };
    // Update ArchiveViewer directly via ref to avoid re-rendering MindMap
    if (archiveViewerRef.current) {
      archiveViewerRef.current.updatePath(newPath);
    }
  };

  const handleSubBranchClick = (sectionName: string, subBranchName: string) => {
    const newPath = { level: sectionName, sublevel: subBranchName };
    // Update ArchiveViewer directly via ref to avoid re-rendering MindMap
    if (archiveViewerRef.current) {
      archiveViewerRef.current.updatePath(newPath);
    }
  };

  const handleBranchHover = (branchName: string | null) => {
    // Use ref to directly call method on ArchiveViewer without re-rendering
    if (archiveViewerRef.current && archiveViewerRef.current.handleHover) {
      archiveViewerRef.current.handleHover(branchName);
    }
    
    // Update RippleShader directly via ref instead of causing re-render
    if (rippleShaderRef.current) {
      rippleShaderRef.current.setHoverState(branchName !== null);
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
          <div className="rounded-3xl relative overflow-hidden min-h-[500px] max-h-[85vh]">
            <RippleShader ref={rippleShaderRef} />
            <MindMap 
              ref={mindMapRef}
              className="w-full h-full" 
              onSectionClick={handleSectionClick}
              onSubBranchClick={handleSubBranchClick}
              onBranchHover={handleBranchHover}
            />
          </div>
          
          {/* Right Panel - Archive Viewer */}
          <div className="rounded-3xl relative overflow-hidden min-h-[500px] max-h-[85vh]">
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
      <Navigation onModalOpen={setActiveModal} />
      
      {/* Modals */}
      <Modal
        isOpen={activeModal === 'cv'}
        onClose={() => setActiveModal(null)}
        title="CV / Resume"
      >
        <div className="space-y-6 text-gray-900">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900">Creative Director</h4>
                <p className="text-sm text-gray-600">Studio X • 2022 - Present</p>
                <p className="text-sm mt-2 text-gray-700">Leading creative direction for digital and print campaigns, managing a team of designers and developers.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900">Senior Designer</h4>
                <p className="text-sm text-gray-600">Design Agency Y • 2020 - 2022</p>
                <p className="text-sm mt-2 text-gray-700">Specialized in brand identity, web design, and user experience for clients across various industries.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['Design Systems', 'UI/UX', 'Brand Identity', 'Web Development', 'Motion Graphics', 'Photography', 'Video Editing', '3D Modeling'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900">BFA in Design</h4>
              <p className="text-sm text-gray-600">Art Institute • 2016 - 2020</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'links'}
        onClose={() => setActiveModal(null)}
        title="Links & Social"
      >
        <div className="space-y-6 text-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">GitHub</h4>
                  <p className="text-sm text-gray-600">Code & Projects</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">LinkedIn</h4>
                  <p className="text-sm text-gray-600">Professional Network</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Pinterest</h4>
                  <p className="text-sm text-gray-600">Visual Inspiration</p>
                </div>
              </div>
            </a>
            
            <a href="#" className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Telegram</h4>
                  <p className="text-sm text-gray-600">Direct Contact</p>
                </div>
              </div>
            </a>
          </div>
          
          <div className="pt-4 border-t border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Projects</h3>
            <div className="space-y-3">
              <a href="#" className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                <h4 className="font-medium text-gray-900">Portfolio Website</h4>
                <p className="text-sm text-gray-600">Interactive portfolio built with Next.js and Three.js</p>
              </a>
              <a href="#" className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                <h4 className="font-medium text-gray-900">Brand Identity System</h4>
                <p className="text-sm text-gray-600">Complete brand identity for tech startup</p>
              </a>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title="About"
      >
        <div className="space-y-6 text-gray-900">
          <div className="space-y-4">
            <p className="leading-relaxed">
              I'm a multidisciplinary creative professional with a passion for blending technology and design. 
              With over 8 years of experience in the creative industry, I specialize in creating immersive 
              digital experiences that bridge the gap between art and functionality.
            </p>
            
            <p className="leading-relaxed">
              My work spans across various mediums including web design, brand identity, motion graphics, 
              and interactive installations. I believe in the power of thoughtful design to create meaningful 
              connections between people and technology.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Philosophy</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm italic text-gray-700">
                "Design is not just what it looks like and feels like. Design is how it works."
              </p>
              <p className="text-xs text-gray-500 mt-2">- Steve Jobs</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {['Interactive Art', 'Generative Design', 'Photography', 'Music Production', '3D Modeling', 'Creative Coding', 'Typography', 'Color Theory'].map((interest) => (
                <span key={interest} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
              </svg>
              <span>Based in Creative Hub, Digital City</span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'work'}
        onClose={() => setActiveModal(null)}
        title="Work w/ Me"
      >
        <div className="space-y-6 text-gray-900">
          <div className="space-y-4">
            <p className="leading-relaxed">
              I'm always excited to collaborate on creative projects that push boundaries and create 
              meaningful experiences. Whether you're looking for a complete brand overhaul, a stunning 
              website, or something entirely unique, let's discuss how we can bring your vision to life.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Brand Identity</h4>
                <p className="text-sm text-gray-600">Complete brand systems, logos, and visual guidelines</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Web Design</h4>
                <p className="text-sm text-gray-600">Custom websites and interactive experiences</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">UI/UX Design</h4>
                <p className="text-sm text-gray-600">User interface and experience design</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Motion Graphics</h4>
                <p className="text-sm text-gray-600">Animations and visual effects</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Get in Touch</h3>
            <div className="space-y-3">
              <a href="mailto:hello@example.com" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 group">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 3v18h24V3H0zm21.518 2L12 12.713 2.482 5h19.036zM2 19V7.183l10 8.104 10-8.104V19H2z"/>
                </svg>
                <span className="text-gray-900 group-hover:text-blue-600 transition-colors">hello@example.com</span>
              </a>
              
              <a href="tel:+1234567890" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 group">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .3l-2.2 2.2c-2.8-1.4-5.1-3.8-6.5-6.5l2.2-2.2c.3-.3.4-.7.3-1-.3-1.2-.5-2.4-.5-3.6 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.9 0 7 3.1 7 7zm-4 0h2c0-2.8-2.2-5-5-5v2c1.7 0 3 1.3 3 3z"/>
                </svg>
                <span className="text-gray-900 group-hover:text-blue-600 transition-colors">+1 (234) 567-890</span>
              </a>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              I typically respond within 24 hours. Let's discuss your project and see how we can create 
              something amazing together!
            </p>
          </div>
        </div>
      </Modal>
    </main>
  );
}
