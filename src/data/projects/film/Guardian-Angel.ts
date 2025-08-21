import { ProjectData } from '../../types';

const GuardianAngel: ProjectData = {
  id: 'Guardian-Angel',
  title: 'Guardian Angel',
  subtitle: 'Music video',
  description: 'Music video for Guardian Angel.',
  dateRecovered: '2025-01-01',
  medium: ['Music Video', 'Film'],
  tags: ['music video', 'film', 'youtube'],
  status: 'active',
  archiveRef: 'FILM-002',
  category: 'film',
  subcategory: 'music video',
  featured: true,

  images: [],
  videos: [],
  externalLinks: [],
  contentBlocks: [
    {
      type: 'embed',
      embedUrl: 'https://www.youtube.com/embed/UzXifSx-3h4?si=Hu_ct3Yko-Xs28co',
      caption: 'Guardian Angel music video'
    }
  ],
  gallery: []
};

export default GuardianAngel;
