import { ProjectData } from '../../types';

const Sincerely: ProjectData = {
  id: 'Sincerely',
  title: 'Sincerely',
  subtitle: 'Music video',
  description: 'Music video for Sincerely.',
  dateRecovered: '2025-01-01',
  medium: ['Music Video', 'Film'],
  tags: ['music video', 'film', 'youtube'],
  status: 'active',
  archiveRef: 'FILM-003',
  category: 'film',
  subcategory: 'music video',
  featured: false,

  images: [],
  videos: [],
  externalLinks: [],
  contentBlocks: [
    {
      type: 'embed',
      embedUrl: 'https://www.youtube.com/embed/5IVYh3sLlGM?si=Ns3hELVhUoEWWzmu',
      caption: 'Sincerely music video'
    }
  ],
  gallery: []
};

export default Sincerely;
