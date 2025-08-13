import { ProjectData } from '../../types';

const Androsynterra: ProjectData = {
  id: 'Androsynterra',
  title: 'Androsynterra',
  subtitle: 'Cabinets of Congealed Entropy',
  description: 'An exploration of textile entropy and the crystallization of chaos through fabric manipulation. This project investigates the boundary between order and disorder, using traditional cloth techniques to capture and preserve moments of controlled randomness.',
  dateRecovered: '2025-01-15',
  medium: ['Textile', 'Fiber Art', 'Mixed Media'],
  tags: ['entropy', 'textile', 'chaos', 'crystallization', 'fabric'],
  status: 'active',
  archiveRef: 'CLOTH-969',
  category: 'cloth',
  subcategory: 'experimental',
  featured: true,
  
  // Enhanced content
  images: [
    '/projects/cloth/Androsynterra/gallery/violetlineupcopy.jpg'
  ],
  videos: [],
  externalLinks: [],
  contentBlocks: [
    {
      type: 'text',
      content: 'The Androsynterra project represents a breakthrough in textile entropy studies, where traditional fabric manipulation techniques are used to capture and preserve moments of controlled chaos. Each piece serves as a cabinet of congealed entropy, a snapshot of disorder frozen in time through the medium of cloth.'
    }
  ],
  gallery: [
    {
      src: '/projects/cloth/Androsynterra/gallery/violetlineupcopy.jpg',
      alt: 'Violet Lineup - Textile entropy captured in fabric',
      caption: 'Violet Lineup: A study in controlled textile chaos',
      type: 'image'
    }
  ]
};

export default Androsynterra;
