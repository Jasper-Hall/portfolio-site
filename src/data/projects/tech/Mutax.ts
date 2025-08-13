import { ProjectData } from '../../types';

const Mutax: ProjectData = {
  id: 'Mutax',
  title: 'Mutax',
  subtitle: 'Hardware',
  description: 'Hardware performance piece.',
  dateRecovered: '2025-01-01',
  medium: ['Hardware', 'Video'],
  tags: ['hardware', 'video'],
  status: 'active',
  archiveRef: 'TECH-403',
  category: 'tech',
  subcategory: 'hardware',
  featured: false,

  images: [],
  videos: [],
  externalLinks: [],
  contentBlocks: [
    {
      type: 'embed',
      // Convert youtu.be to embeddable URL
      embedUrl: 'https://www.youtube.com/embed/Fc16EAlU_OQ',
      caption: 'YouTube embed'
    }
  ],
  gallery: []
};

export default Mutax;
