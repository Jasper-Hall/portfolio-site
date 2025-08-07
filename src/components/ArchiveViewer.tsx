'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface NavigationPath {
  level: string;
  sublevel?: string;
}

interface ProjectData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  dateRecovered: string;
  medium: string[];
  tags: string[];
  status: 'active' | 'archived' | 'in-progress';
  archiveRef: string;
  category: string;
  subcategory?: string;
  featured: boolean;
}

interface ArchiveViewerProps {
  className?: string;
  currentPath: NavigationPath;
  onPathChange: (path: NavigationPath) => void;
}

export interface ArchiveViewerRef {
  handleHover: (branchName: string | null) => void;
}

// Mock project data for all 7 categories
const projectData: ProjectData[] = [
  // FILM Projects 
  {
    id: 'film-1',
    title: 'Digital Archaeology',
    subtitle: 'Recovering lost media from digital decay',
    description: 'A documentary exploring the ephemeral nature of digital media and the efforts to preserve disappearing online content. Chronicles the race against digital entropy.',
    dateRecovered: '2024-04-20',
    medium: ['Documentary', 'Digital Media', 'Preservation'],
    tags: ['Film', 'Digital', 'Preservation', 'Documentary'],
    status: 'active',
    archiveRef: 'FILM-001',
    category: 'film',
    featured: true
  },
  
  // SOUND Projects (was JAECE)
  {
    id: 'sound-1',
    title: 'Neural Echo Chamber',
    subtitle: 'AI-generated soundscapes from digital consciousness',
    description: 'An exploration of artificial intelligence creating ambient soundscapes that mimic the neural patterns of human consciousness. The project uses machine learning algorithms to generate evolving audio compositions.',
    dateRecovered: '2024-03-15',
    medium: ['AI Audio', 'Machine Learning', 'Ambient Music'],
    tags: ['AI', 'Neural Networks', 'Ambient', 'Experimental'],
    status: 'active',
    archiveRef: 'SOUND-001',
    category: 'sound',
    featured: true
  },
  {
    id: 'sound-2',
    title: 'Digital Memory Palace',
    subtitle: 'Virtual reality architecture for data visualization',
    description: 'A VR environment where complex datasets are represented as architectural spaces. Users navigate through information as if walking through a memory palace.',
    dateRecovered: '2024-02-28',
    medium: ['VR', 'Data Visualization', '3D Design'],
    tags: ['VR', 'Data', 'Architecture', 'Memory'],
    status: 'active',
    archiveRef: 'SOUND-002',
    category: 'sound',
    featured: false
  },
  {
    id: 'sound-3',
    title: 'Quantum Interface',
    subtitle: 'Experimental UI for quantum computing',
    description: 'A user interface designed to interact with quantum computing systems. Features visual representations of quantum states and superposition.',
    dateRecovered: '2024-01-20',
    medium: ['UI/UX', 'Quantum Computing', 'Visualization'],
    tags: ['Quantum', 'Interface', 'Computing', 'Experimental'],
    status: 'in-progress',
    archiveRef: 'SOUND-003',
    category: 'sound',
    featured: false
  },

  // CLOTH Projects (was XTSUI)
  {
    id: 'cloth-1',
    title: 'Synthetic Biology Orchestra',
    subtitle: 'Living organisms as musical instruments',
    description: 'A performance piece where genetically modified organisms create music through their biological processes. Each organism contributes to a living symphony.',
    dateRecovered: '2024-04-10',
    medium: ['Bio Art', 'Performance', 'Sound Design'],
    tags: ['Biology', 'Music', 'Performance', 'Synthetic'],
    status: 'active',
    archiveRef: 'CLOTH-001',
    category: 'cloth',
    featured: true
  },
  {
    id: 'cloth-2',
    title: 'Memory Fabric',
    subtitle: 'Textiles that store and display memories',
    description: 'Smart fabrics embedded with memory-storing technology. The textiles change color and texture based on stored emotional or visual memories.',
    dateRecovered: '2024-03-22',
    medium: ['Smart Textiles', 'Memory Technology', 'Interactive Art'],
    tags: ['Textiles', 'Memory', 'Interactive', 'Technology'],
    status: 'active',
    archiveRef: 'CLOTH-002',
    category: 'cloth',
    featured: false
  },
  {
    id: 'cloth-3',
    title: 'Dream Capture Device',
    subtitle: 'Technology to record and replay dreams',
    description: 'An experimental device that attempts to capture and visualize dream states. Uses brain-computer interface technology to translate neural activity.',
    dateRecovered: '2024-02-15',
    medium: ['BCI', 'Dream Technology', 'Visualization'],
    tags: ['Dreams', 'BCI', 'Neural', 'Experimental'],
    status: 'in-progress',
    archiveRef: 'CLOTH-003',
    category: 'cloth',
    featured: false
  },

  // RHEOME Projects
  {
    id: 'rheome-1',
    title: 'Fluid Dynamics Symphony',
    subtitle: 'Music generated from fluid flow patterns',
    description: 'A system that translates fluid dynamics into musical compositions. Water flow, turbulence, and viscosity create complex harmonic structures.',
    dateRecovered: '2024-04-05',
    medium: ['Fluid Dynamics', 'Music Generation', 'Sensors'],
    tags: ['Fluid', 'Music', 'Dynamics', 'Sensors'],
    status: 'active',
    archiveRef: 'RHEOME-001',
    category: 'rheome',
    featured: false
  },
  {
    id: 'rheome-2',
    title: 'Viscous Memory',
    subtitle: 'Data storage in non-Newtonian fluids',
    description: 'An experimental data storage system using the unique properties of non-Newtonian fluids. Information is encoded in fluid viscosity patterns.',
    dateRecovered: '2024-03-18',
    medium: ['Fluid Physics', 'Data Storage', 'Experimental'],
    tags: ['Fluids', 'Data', 'Physics', 'Storage'],
    status: 'active',
    archiveRef: 'RHEOME-002',
    category: 'rheome',
    featured: false
  },
  {
    id: 'rheome-3',
    title: 'Surface Tension Interface',
    subtitle: 'Touch interfaces using liquid surface tension',
    description: 'A touch interface that uses the surface tension of liquids to create haptic feedback. Users interact with floating liquid droplets.',
    dateRecovered: '2024-02-08',
    medium: ['Haptics', 'Liquid Interface', 'Touch Technology'],
    tags: ['Surface Tension', 'Haptics', 'Interface', 'Liquid'],
    status: 'in-progress',
    archiveRef: 'RHEOME-003',
    category: 'rheome',
    featured: false
  },

  // IMAGE Projects (was PHOTOGRAPHY)
  {
    id: 'image-1',
    title: 'Berlin Decay',
    subtitle: 'Urban landscapes in transition',
    description: "A photographic series documenting the decay and transformation of Berlin's industrial architecture. Captures the beauty in deterioration.",
    dateRecovered: '2022-11-15',
    medium: ['Photography', 'Urban', 'Documentary'],
    tags: ['Berlin', 'Decay', 'Urban', 'Architecture'],
    status: 'archived',
    archiveRef: 'IMAGE-001',
    category: 'image',
    subcategory: 'urbandscapes',
    featured: true
  },
  {
    id: 'image-2',
    title: 'Fissure',
    subtitle: 'Close-up studies of cracks and fractures',
    description: 'Macro photography exploring the intricate patterns of cracks, fissures, and fractures in various materials. Reveals hidden beauty in destruction.',
    dateRecovered: '2021-08-22',
    medium: ['Macro Photography', 'Abstract', 'Textures'],
    tags: ['Macro', 'Cracks', 'Textures', 'Abstract'],
    status: 'archived',
    archiveRef: 'IMAGE-002',
    category: 'image',
    subcategory: 'closeups',
    featured: false
  },
  {
    id: 'image-3',
    title: 'Blur',
    subtitle: 'Analog texture experiments',
    description: 'Experimental photography using analog techniques to create blurred, textured images. Explores the boundary between representation and abstraction.',
    dateRecovered: '2020-05-10',
    medium: ['Analog Photography', 'Experimental', 'Textures'],
    tags: ['Analog', 'Blur', 'Experimental', 'Textures'],
    status: 'archived',
    archiveRef: 'IMAGE-003',
    category: 'image',
    subcategory: 'analog',
    featured: false
  },
  {
    id: 'image-4',
    title: 'Drift',
    subtitle: 'Black & white long exposures',
    description: 'Long exposure photography capturing the movement and drift of light and shadow. Creates ethereal, dreamlike compositions.',
    dateRecovered: '2018-12-03',
    medium: ['Long Exposure', 'Black & White', 'Abstract'],
    tags: ['Long Exposure', 'B&W', 'Movement', 'Abstract'],
    status: 'archived',
    archiveRef: 'IMAGE-004',
    category: 'image',
    subcategory: 'bw',
    featured: false
  },

  // TECH Projects (was CODE)
  {
    id: 'tech-1',
    title: 'Neural Network Visualizer',
    subtitle: 'Real-time visualization of AI training',
    description: 'An interactive tool that visualizes neural network training in real-time. Shows how AI models learn and adapt during training processes.',
    dateRecovered: '2024-03-30',
    medium: ['Web App', 'Data Visualization', 'Machine Learning'],
    tags: ['AI', 'Visualization', 'Neural Networks', 'Web'],
    status: 'active',
    archiveRef: 'TECH-001',
    category: 'tech',
    subcategory: 'ai',
    featured: true
  },
  {
    id: 'tech-2',
    title: 'Generative Art Engine',
    subtitle: 'Algorithmic art generation system',
    description: 'A software system that generates unique artworks using mathematical algorithms and procedural generation techniques.',
    dateRecovered: '2024-02-14',
    medium: ['Generative Art', 'Algorithms', 'Creative Coding'],
    tags: ['Generative', 'Art', 'Algorithms', 'Creative'],
    status: 'active',
    archiveRef: 'TECH-002',
    category: 'tech',
    subcategory: 'generative',
    featured: false
  },
  {
    id: 'tech-3',
    title: 'Blockchain Art Registry',
    subtitle: 'Decentralized art ownership system',
    description: 'A blockchain-based system for registering and tracking digital art ownership. Ensures authenticity and provenance of digital artworks.',
    dateRecovered: '2024-01-25',
    medium: ['Blockchain', 'Web3', 'Digital Art'],
    tags: ['Blockchain', 'Web3', 'Art', 'Ownership'],
    status: 'in-progress',
    archiveRef: 'TECH-003',
    category: 'tech',
    subcategory: 'web3',
    featured: false
  },

  // ART Projects (was WRITING)
  {
    id: 'art-1',
    title: 'Digital Poetry Generator',
    subtitle: 'AI-assisted creative writing system',
    description: 'An AI system that collaborates with human writers to create poetry. Combines human creativity with machine learning algorithms.',
    dateRecovered: '2024-04-08',
    medium: ['AI Writing', 'Poetry', 'Creative Writing'],
    tags: ['AI', 'Poetry', 'Writing', 'Creative'],
    status: 'active',
    archiveRef: 'ART-001',
    category: 'art',
    subcategory: 'poetry',
    featured: true
  },
  {
    id: 'art-2',
    title: 'Interactive Fiction Engine',
    subtitle: 'Dynamic storytelling platform',
    description: 'A platform for creating interactive fiction where reader choices dynamically alter the narrative structure and outcomes.',
    dateRecovered: '2024-03-12',
    medium: ['Interactive Fiction', 'Storytelling', 'Narrative Design'],
    tags: ['Interactive', 'Fiction', 'Storytelling', 'Narrative'],
    status: 'active',
    archiveRef: 'ART-002',
    category: 'art',
    subcategory: 'fiction',
    featured: false
  },
  {
    id: 'art-3',
    title: 'Code Poetry',
    subtitle: 'Poetry written in programming languages',
    description: 'Poetry written using programming languages as the medium. Explores the intersection of code and creative expression.',
    dateRecovered: '2024-02-28',
    medium: ['Code Poetry', 'Programming', 'Creative Writing'],
    tags: ['Code', 'Poetry', 'Programming', 'Creative'],
    status: 'in-progress',
    archiveRef: 'ART-003',
    category: 'art',
    subcategory: 'codepoetry',
    featured: false
  },

  // DESIGN Projects
  {
    id: 'design-1',
    title: 'Minimalist UI System',
    subtitle: 'Design system for digital interfaces',
    description: 'A comprehensive design system emphasizing minimalism and usability. Includes components, typography, and interaction patterns.',
    dateRecovered: '2024-04-12',
    medium: ['UI/UX', 'Design System', 'Typography'],
    tags: ['UI', 'UX', 'Minimalist', 'Design System'],
    status: 'active',
    archiveRef: 'DESIGN-001',
    category: 'design',
    subcategory: 'ui',
    featured: true
  },
  {
    id: 'design-2',
    title: 'Experimental Typography',
    subtitle: 'Pushing the boundaries of letterforms',
    description: 'Experimental typography that challenges conventional letterform design. Explores new ways of representing written language.',
    dateRecovered: '2024-03-05',
    medium: ['Typography', 'Experimental', 'Letterforms'],
    tags: ['Typography', 'Experimental', 'Letterforms', 'Design'],
    status: 'active',
    archiveRef: 'DESIGN-002',
    category: 'design',
    subcategory: 'typography',
    featured: false
  },
  {
    id: 'design-3',
    title: 'Spatial Design Interface',
    subtitle: '3D design tools for spatial computing',
    description: 'Design tools specifically created for spatial computing environments. Enables intuitive 3D design in virtual and augmented reality.',
    dateRecovered: '2024-02-20',
    medium: ['Spatial Computing', '3D Design', 'VR/AR'],
    tags: ['Spatial', '3D', 'VR', 'AR', 'Design'],
    status: 'in-progress',
    archiveRef: 'DESIGN-003',
    category: 'design',
    subcategory: 'spatial',
    featured: false
  }
];

const mindMapStructure = {
  film: {
    name: 'FILM',
    subcategories: ['archives', 'youtube']
  },
  sound: {
    name: 'SOUND',
    subcategories: ['live/bookings', 'releases', 'links']
  },
  cloth: {
    name: 'CLOTH',
    subcategories: ['xtsuimart', 'archives']
  },
  image: {
    name: 'IMAGE',
    subcategories: ['portraits', 'landscapes', 'events']
  },
  tech: {
    name: 'TECH',
    subcategories: ['web', 'mobile', 'ai']
  },
  art: {
    name: 'ART',
    subcategories: ['digital', 'traditional', 'mixed']
  },
  design: {
    name: 'DESIGN',
    subcategories: ['graphic', 'ui/ux', 'branding']
  }
};

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

  // Expose handleHover method to parent component
  useImperativeHandle(ref, () => ({
    handleHover: (branchName: string | null) => {
      if (branchName && currentPath.level === 'home') {
        // Find the index of the hovered branch's featured project in the filtered projects
        const featuredProjects = projectData.filter(p => p.featured);
        const hoveredIndex = featuredProjects.findIndex(p => p.category === branchName);
        if (hoveredIndex >= 0) {
          setLastHoveredIndex(hoveredIndex);
        }
      }
      setHoveredBranch(branchName);
    }
  }));

  // Get filtered projects based on current path and hover state
  const getFilteredProjects = (): ProjectData[] => {
    if (currentPath.level === 'home') {
      // Map MindMap sections to their corresponding featured project categories
      // MindMap order: film, sound, cloth, image, tech, art, design
      // Featured project categories: sound, cloth, rheome, image, tech, design, art
      const mindMapToFeaturedMapping = [
        'sound',    // film maps to sound (index 0)
        'sound',    // sound maps to sound (index 1) 
        'cloth',    // cloth maps to cloth (index 2)
        'image',    // image maps to image (index 3)
        'tech',     // tech maps to tech (index 4)
        'art',      // art maps to art (index 5)
        'design'    // design maps to design (index 6)
      ];
      
      const featuredProjects = projectData.filter(p => p.featured);
      
      // Return featured projects in the order that matches MindMap sections
      return mindMapToFeaturedMapping
        .map(category => featuredProjects.find(p => p.category === category))
        .filter(Boolean) as ProjectData[];
    } else if (currentPath.sublevel) {
      // Show projects from specific subcategory
      return projectData.filter(p => 
        p.category === currentPath.level && p.subcategory === currentPath.sublevel
      );
    } else {
      // Show featured projects from specific category
      return projectData.filter(p => 
        p.category === currentPath.level && p.featured
      );
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

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && filteredProjects.length > 1) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredProjects.length);
      }, 4000); // Change every 4 seconds
    }

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, [isAutoPlaying, filteredProjects.length]);

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
  }, [currentPath]);

  const goToNext = () => {
    if (filteredProjects.length > 1) {
      setCurrentIndex(prev => (prev + 1) % filteredProjects.length);
    }
  };

  const goToPrevious = () => {
    if (filteredProjects.length > 1) {
      setCurrentIndex(prev => (prev - 1 + filteredProjects.length) % filteredProjects.length);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'archived':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryTitle = () => {
    if (currentPath.level === 'home') {
      return 'FEATURED PROJECTS';
    } else if (currentPath.sublevel) {
      const categoryName = mindMapStructure[currentPath.level as keyof typeof mindMapStructure]?.name || currentPath.level.toUpperCase();
      const subcategoryName = currentPath.sublevel.toUpperCase();
      return `${categoryName} > ${subcategoryName}`;
    } else {
      const categoryName = mindMapStructure[currentPath.level as keyof typeof mindMapStructure]?.name || currentPath.level.toUpperCase();
      return `${categoryName} PROJECTS`;
    }
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      { name: 'HOME', path: { level: 'home' } as NavigationPath, isActive: currentPath.level === 'home' }
    ];

    if (currentPath.level !== 'home') {
      const categoryName = mindMapStructure[currentPath.level as keyof typeof mindMapStructure]?.name || currentPath.level.toUpperCase();
      breadcrumbs.push({
        name: categoryName,
        path: { level: currentPath.level } as NavigationPath,
        isActive: currentPath.level !== 'home' && !currentPath.sublevel
      });

      if (currentPath.sublevel) {
        breadcrumbs.push({
          name: currentPath.sublevel.toUpperCase(),
          path: { level: currentPath.level, sublevel: currentPath.sublevel } as NavigationPath,
          isActive: true
        });
      }
    }

    return breadcrumbs;
  };

  const handleTabClick = (path: NavigationPath) => {
    onPathChange(path);
  };

  return (
    <div className={`relative h-full ${className}`}>
      {/* Manila Folder Tabs */}
      <div className="mb-4">
        <div className="flex items-end space-x-1">
          {generateBreadcrumbs().map((breadcrumb, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => handleTabClick(breadcrumb.path)}
                className={`
                  px-4 py-2 text-xs font-mono tracking-wider transition-all duration-200
                  ${breadcrumb.isActive 
                    ? 'border-t-2 border-l-2 border-r-2 rounded-t-lg shadow-sm' 
                    : 'border-t-2 border-l-2 border-r-2 rounded-t-lg'
                  }
                `}
                style={{
                  backgroundColor: breadcrumb.isActive ? '#E8DCC6' : '#D4C4A8',
                  borderColor: '#B8A082',
                  color: '#3A3428'
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
          ))}
        </div>
        
        {/* Folder Container */}
        <div 
          className="border-2 rounded-b-lg rounded-tr-lg shadow-lg h-full"
          style={{
            backgroundColor: '#E8DCC6',
            borderColor: '#B8A082'
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span 
                className="text-sm font-mono font-semibold"
                style={{ color: '#3A3428' }}
              >
                {getCategoryTitle()}
              </span>
                            <div className="flex items-center space-x-2">
                <span 
                  className="text-xs font-mono"
                  style={{ color: '#5C5347' }}
                >
                  {filteredProjects.length > 0 ? `${displayIndex + 1} / ${filteredProjects.length}` : '0 / 0'}
                </span>
        </div>
            </div>
            
            {/* Project Card */}
            {currentProject && (
              <div 
                className="border rounded-lg shadow-sm overflow-hidden relative"
                style={{
                  backgroundColor: '#FEFCF8',
                  borderColor: '#D4C4A8'
                }}
              >
                {/* Project Content */}
                <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-900/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-white/60 text-sm font-mono">[ARTIFACT VISUAL DATA]</div>
                      <div className="text-white/40 text-xs font-mono">
                        Supports: Images • Videos • Interactive Demos • Embeds
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="p-4 md:p-5 space-y-2 md:space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-600 tracking-widest">
                        {currentProject.archiveRef}
                      </span>
                      <span className={`text-xs font-mono px-2 py-1 rounded border ${getStatusColor(currentProject.status)}`}>
                        {currentProject.status}
                      </span>
                    </div>
                    
                    <h3 
                      className="text-xl font-mono font-bold tracking-wide"
                      style={{ color: '#2A2419' }}
                    >
                      {currentProject.title}
                    </h3>
                    
                    <p 
                      className="text-sm font-mono italic"
                      style={{ color: '#4A4235' }}
                    >
                      {currentProject.subtitle}
                    </p>
                  </div>

                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: '#3A3428' }}
                  >
                    {currentProject.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span 
                        className="block"
                        style={{ color: '#5C5347' }}
                      >
                        DATE RECOVERED:
                      </span>
                      <span style={{ color: '#3A3428' }}>{currentProject.dateRecovered}</span>
                    </div>
                    <div>
                      <span 
                        className="block"
                        style={{ color: '#5C5347' }}
                      >
                        MEDIUM:
                      </span>
                      <span style={{ color: '#3A3428' }}>{currentProject.medium.join(' | ')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentProject.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs font-mono px-2 py-1 border rounded"
                        style={{
                          backgroundColor: '#F2EFE7',
                          borderColor: '#D4C4A8',
                          color: '#3A3428'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Navigation Controls */}
                {filteredProjects.length > 1 && (
                  <>
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <button
                        onClick={goToPrevious}
                        className="ml-4 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: '#FEFCF8',
                          borderColor: '#D4C4A8',
                          color: '#5C5347'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F2EFE7';
                          e.currentTarget.style.color = '#3A3428';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEFCF8';
                          e.currentTarget.style.color = '#5C5347';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                      </button>
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <button
                        onClick={goToNext}
                        className="mr-4 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: '#FEFCF8',
                          borderColor: '#D4C4A8',
                          color: '#5C5347'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F2EFE7';
                          e.currentTarget.style.color = '#3A3428';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEFCF8';
                          e.currentTarget.style.color = '#5C5347';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Archive Index Dots */}
            {filteredProjects.length > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
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
      </div>
    </div>
  );
});

export default ArchiveViewer; 