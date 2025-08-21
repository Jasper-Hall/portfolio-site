import { ProjectData } from '../../types';

const evanoraTour: ProjectData = {
  id: 'evanoraTour',
  title: 'Evanora EU Tour',
  subtitle: 'Flier',
  description: 'Promotional flier for Evanora EU tour.',
  dateRecovered: '2025-01-01',
  medium: ['Graphic Design'],
  tags: ['flier', 'tour', 'evanora'],
  status: 'active',
  archiveRef: 'GRAPHIX-008',
  category: 'graphix',
  subcategory: 'flier',
  featured: false,
  images: [
    '/projects/graphix/Flier/evanoraTour/evanoratourfliercover.png',
    '/projects/graphix/Flier/evanoraTour/evanora_EUtourflierSlide2.png'
  ],
  videos: [],
  externalLinks: [],
  contentBlocks: [],
  gallery: [
    { src: '/projects/graphix/Flier/evanoraTour/evanoratourfliercover.png', alt: 'Evanora EU tour flier cover', type: 'image' },
    { src: '/projects/graphix/Flier/evanoraTour/evanora_EUtourflierSlide2.png', alt: 'Evanora EU tour flier slide 2', type: 'image' },
  ]
};

export default evanoraTour;
