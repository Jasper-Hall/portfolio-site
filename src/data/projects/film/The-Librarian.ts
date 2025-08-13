import { ProjectData } from '../../types';

const TheLibrarian: ProjectData = {
  id: 'The-Librarian',
  title: 'The Librarian',
  subtitle: 'Short film',
  description: 'Short film.',
  dateRecovered: '2025-01-01',
  medium: ['Film'],
  tags: ['film'],
  status: 'active',
  archiveRef: 'FILM-001',
  category: 'film',
  subcategory: 'archives',
  featured: true,

  images: [],
  videos: [],
  externalLinks: [],
  contentBlocks: [
    {
      type: 'embed',
      embedUrl: 'https://player.vimeo.com/video/1108630938?badge=0&autopause=0&player_id=0&app_id=58479',
      caption: 'Vimeo embed'
    }
  ],
  gallery: []
};

export default TheLibrarian;
