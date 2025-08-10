import { ProjectData } from '../../types';

const CrashRiver: ProjectData = {
  id: 'Crash-River',
  title: 'Crash River',
  subtitle: 'i8i x Trauma Bar und Kino Present Infinite Scroll for Berlin Art Week 2021',
  description: `The forces of religion and technology, oil, gas, and silicon,
power and control, and creativity, community and God all
converge at the helm of the Infinite Scroll.
This installation piece, entitled Crash River, is my
sculptural contribution to Infinite Scroll, which, in addition
to the visible sculptural elements, consisted of an
interactive audio component triggered by piezo mics
hidden underneath the sand. Stepping on or near the
piezo elements activated a series of tuned resonances
and a randomized selection of samples from a computer
on site running Ableton Live.`,
  dateRecovered: '2021-09-17',
  medium: ['Installation', 'Interactive', 'Sound', 'Sculpture'],
  tags: ['Berlin', 'Tag2'],
  status: 'archived',
  archiveRef: 'ART-917',
  category: 'art',
  subcategory: 'installation',
  featured: true,
  
  // Enhanced content
  images: [
    '/projects/art/Crash-River/gallery/TraumaBar_i8i_035.jpeg',
    '/projects/art/Crash-River/gallery/TraumaBar_i8i_085.jpeg',
    '/projects/art/Crash-River/gallery/TraumaBar_i8i_126.jpg',
    '/projects/art/Crash-River/gallery/TraumaBar_i8i_131.jpg'
  ],
  videos: [],
  externalLinks: [
    { label: 'iHeartBerlin', url: 'https://www.iheartberlin.de/an-otherworldly-club-experience-the-i8i-collective-at-traumabar/', type: 'primary' }
  ],
  contentBlocks: [
    {
      type: 'text',
      content: 'The forces of religion and technology, oil, gas, and silicon, power and control, and creativity, community and God all converge at the helm of the Infinite Scroll. This installation piece, entitled Crash River, is my sculptural contribution to Infinite Scroll, which, in addition to the visible sculptural elements, consisted of an interactive audio component triggered by piezo mics hidden underneath the sand. Stepping on or near the piezo elements activated a series of tuned resonances and a randomized selection of samples from a computer on site running Ableton Live.'
    }
  ],
  gallery: [
    {
      src: '/projects/art/Crash-River/gallery/TraumaBar_i8i_035.jpeg',
      alt: 'Crash River installation view 1',
      caption: 'Installation view from Berlin Art Week 2021',
      type: 'image'
    },
    {
      src: '/projects/art/Crash-River/gallery/TraumaBar_i8i_085.jpeg',
      alt: 'Crash River installation view 2',
      caption: 'Interactive audio component detail',
      type: 'image'
    },
    {
      src: '/projects/art/Crash-River/gallery/TraumaBar_i8i_126.jpg',
      alt: 'Crash River installation view 3',
      caption: 'Sculptural elements and sand installation',
      type: 'image'
    },
    {
      src: '/projects/art/Crash-River/gallery/TraumaBar_i8i_131.jpg',
      alt: 'Crash River installation view 4',
      caption: 'Overall installation view at Trauma Bar',
      type: 'image'
    }
  ]
};

export default CrashRiver;
