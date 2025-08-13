import { ProjectData } from '../../types';

const BalladOfTheBalloons: ProjectData = {
  id: 'Ballad-Of-The-Balloons',
  title: 'Ballad of the Balloons',
  subtitle: 'Weather-balloon sonification web experiment',
  description: 'Interactive web piece that sonifies live weather-balloon telemetry in real-time using granular synthesis and p5.js visuals.',
  dateRecovered: '2024-05-01',
  medium: ['Web', 'Interactive', 'Audio', 'Data Visualization'],
  tags: ['p5.js', 'sonification', 'weather', 'granular synthesis'],
  status: 'active',
  archiveRef: 'TECH-401',
  category: 'tech',
  subcategory: 'web',
  featured: true,

  // There is no local image yet – main artefact is the live embed
  images: [],
  videos: [],
  externalLinks: [
    { label: 'Open Project', url: 'https://ballad-of-the-balloons.vercel.app/', type: 'primary' }
  ],
  contentBlocks: [
    {
      type: 'embed',
      embedUrl: 'https://ballad-of-the-balloons.vercel.app/',
      caption: 'Live interactive piece (iframe)'
    }
  ],
  gallery: []
};

export default BalladOfTheBalloons;
