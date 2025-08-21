import { ProjectData } from '../../types';

const PreviousPerformances: ProjectData = {
  id: 'Previous-Performances',
  title: 'Previous Performances',
  subtitle: 'Live performance history',
  description: 'A comprehensive list of live performances and shows from 2017-2023, spanning multiple cities and venues across the US and Europe.',
  dateRecovered: '2025-01-01',
  medium: ['Live Performance', 'Sound', 'Performance Art'],
  tags: ['live', 'performance', 'tours', 'festivals', 'shows'],
  status: 'active',
  archiveRef: 'SOUND-006',
  category: 'sound',
  subcategory: 'live',
  featured: false,

  images: [
    '/projects/sound/DSC05817.jpeg'
  ],
  videos: [],
  externalLinks: [],
  contentBlocks: [
    {
      type: 'text',
      content: `1.17.23 - HiHelga West Coast Tour, Cherry Pit, Seattle, WA
10.29.22 - YYC and Dial Up present Freak Show, Seattle, WA
10.30.21 - xeno VIII, Fuga, Bratislava, Slovakia
10.17.21 - Infinite Scroll Closing Show, Trauma Bar Und Kino, Berlin, Germany
10.8.21 - i8i x Common Contact, Aux Gazelles, Vienna, Austria
10.4.21 - i8i @ Narthex Festival, Methana, Greece
9.(17&18).21 - i8i presents Infinite Scroll, Trauma Bar Und Kino, Berlin, Germany
8.7.21 - Battle for i8i Cave Show w/ Poncili Creacion, Los Angeles, CA
2.8.20 - Saphotrophic Decomposition, Vertexx, Los Angeles, CA
11.24.19 - ÆOS Reloaded Release Party, Oakland, CA
4.27.19 - Gates of Utopia, Chewing Foil, Los Angeles, CA
10.18.18 - Red Earth Purification Ceremony, Chewing Foil, Los Angeles, CA
5.23.18 - Stable Release Event w/ Spelling, Spirithaus Gallery, Oakland, CA
12.31.17 - Wine and Bowties NYE, Oakland, CA`
    }
  ],
  gallery: [
    {
      src: '/projects/sound/DSC05817.jpeg',
      alt: 'Live performance setup with illuminated equipment and blue lighting',
      caption: 'Live performance environment with electronic music equipment and atmospheric blue lighting',
      type: 'image'
    }
  ]
};

export default PreviousPerformances;
