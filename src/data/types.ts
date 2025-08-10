export interface ProjectData {
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
  
  // Enhanced content management
  images?: string[];
  videos?: string[];
  externalLinks?: ExternalLink[];
  contentBlocks?: ContentBlock[];
  gallery?: GalleryItem[];
}

export interface ExternalLink {
  label: string;
  url: string;
  type?: 'primary' | 'secondary';
}

export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'embed' | 'gallery';
  content?: string;
  src?: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
  embedUrl?: string;
  items?: GalleryItem[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
}

export interface NavigationPath {
  level: string;
  sublevel?: string;
}

export interface MindMapStructure {
  name: string;
  subcategories: string[];
}

export const mindMapStructure: Record<string, MindMapStructure> = {
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