# Portfolio Content Management System

This document describes the enhanced static files approach for managing portfolio content in your Next.js application.

## 🏗️ Architecture Overview

The system uses a **hybrid static files approach** that provides:
- ✅ **Maximum performance** (static data loaded at build time)
- ✅ **Easy content management** (structured TypeScript files)
- ✅ **Scalability** (organized by categories and projects)
- ✅ **Future-proof** (easy migration to CMS later)
- ✅ **Version control friendly** (all content in Git)

## 📁 Directory Structure

```
portfolio-site/
├── src/
│   └── data/
│       ├── types.ts                    # TypeScript interfaces
│       ├── projects/
│       │   ├── index.ts               # Main export with utilities
│       │   ├── film/
│       │   │   ├── index.ts           # Film projects export
│       │   │   └── digital-archaeology.ts
│       │   ├── sound/
│       │   │   ├── index.ts           # Sound projects export
│       │   │   └── neural-echo-chamber.ts
│       │   └── ... (other categories)
│       └── README.md                   # Detailed documentation
├── public/
│   └── projects/
│       ├── film/
│       │   └── digital-archaeology/
│       │       ├── hero.jpg
│       │       ├── gallery/
│       │       └── videos/
│       └── ... (other categories)
└── scripts/
    └── add-project.js                  # Project creation script
```

## 🚀 Quick Start

### Adding a New Project

1. **Use the automated script:**
   ```bash
   npm run add-project film my-new-project "My New Project" "Project subtitle"
   ```

2. **Or manually create:**
   ```bash
   # Create project file
   touch src/data/projects/film/my-new-project.ts
   
   # Create asset directories
   mkdir -p public/projects/film/my-new-project/{gallery,videos}
   ```

### Project Data Structure

```typescript
import { ProjectData } from '../../types';

const myProject: ProjectData = {
  id: 'my-project',
  title: 'My Project',
  subtitle: 'Project subtitle',
  description: 'Project description...',
  dateRecovered: '2024-01-01',
  medium: ['Medium1', 'Medium2'],
  tags: ['Tag1', 'Tag2'],
  status: 'active', // 'active' | 'archived' | 'in-progress'
  archiveRef: 'FILM-001',
  category: 'film',
  subcategory: 'archives',
  featured: true,
  
  // Enhanced content
  images: [
    '/projects/film/my-project/hero.jpg',
    '/projects/film/my-project/gallery/1.jpg'
  ],
  videos: [
    '/projects/film/my-project/demo.mp4'
  ],
  externalLinks: [
    { label: 'View Project', url: 'https://...', type: 'primary' }
  ],
  contentBlocks: [
    {
      type: 'text',
      content: 'Additional content...'
    },
    {
      type: 'image',
      src: '/projects/film/my-project/gallery/1.jpg',
      caption: 'Image caption',
      alt: 'Alt text'
    }
  ],
  gallery: [
    {
      src: '/projects/film/my-project/gallery/1.jpg',
      alt: 'Gallery image',
      caption: 'Caption',
      type: 'image'
    }
  ]
};

export default myProject;
```

## 🎯 Content Block Types

### Text Block
```typescript
{
  type: 'text',
  content: 'Your text content here...'
}
```

### Image Block
```typescript
{
  type: 'image',
  src: '/path/to/image.jpg',
  caption: 'Image caption',
  alt: 'Alt text for accessibility'
}
```

### Video Block
```typescript
{
  type: 'video',
  src: '/path/to/video.mp4',
  caption: 'Video caption'
}
```

### Embed Block
```typescript
{
  type: 'embed',
  embedUrl: 'https://youtube.com/watch?v=...',
  caption: 'Embed caption'
}
```

### Gallery Block
```typescript
{
  type: 'gallery',
  items: [
    {
      src: '/path/to/image1.jpg',
      alt: 'Image 1',
      caption: 'Caption 1',
      type: 'image'
    },
    {
      src: '/path/to/video1.mp4',
      alt: 'Video 1',
      caption: 'Caption 1',
      type: 'video'
    }
  ]
}
```

## 🔧 Utility Functions

The system provides several utility functions for filtering and accessing projects:

```typescript
import { 
  allProjects,
  getProjectsByCategory,
  getProjectsBySubcategory,
  getFeaturedProjects,
  getProjectsByStatus,
  getProjectsByTag,
  getProjectById,
  getFeaturedProjectsInMindMapOrder
} from '@/data/projects';

// Get all projects
const all = allProjects;

// Get projects by category
const filmProjects = getProjectsByCategory('film');

// Get projects by subcategory
const archiveProjects = getProjectsBySubcategory('film', 'archives');

// Get featured projects
const featured = getFeaturedProjects();

// Get projects by status
const activeProjects = getProjectsByStatus('active');

// Get projects by tag
const aiProjects = getProjectsByTag('AI');

// Get specific project
const project = getProjectById('digital-archaeology');

// Get featured projects in MindMap order
const mindMapOrdered = getFeaturedProjectsInMindMapOrder();
```

## 🎨 MindMap Integration

The system integrates seamlessly with your existing MindMap navigation:

### Category Structure
```typescript
const mindMapStructure = {
  film: {
    name: 'FILM',
    subcategories: ['archives', 'youtube']
  },
  sound: {
    name: 'SOUND',
    subcategories: ['live/bookings', 'releases', 'links']
  },
  // ... other categories
};
```

### Navigation Flow
1. **MindMap** → Click category → **ArchiveViewer** shows category projects
2. **MindMap** → Click sub-branch → **ArchiveViewer** shows subcategory projects
3. **ArchiveViewer** → Breadcrumb navigation → **MindMap** highlights active section

## 📱 Asset Management

### Image Guidelines
- **Hero images**: 1200x800px (16:10 ratio)
- **Gallery images**: 800x600px (4:3 ratio)
- **Formats**: JPG for photos, PNG for graphics, WebP for optimization
- **File sizes**: Keep under 500KB for hero, 200KB for gallery

### Video Guidelines
- **Formats**: MP4 (H.264), WebM
- **Resolution**: 1080p max
- **Duration**: Keep under 2 minutes for previews
- **File sizes**: Compress appropriately

### File Naming Convention
```
public/projects/category/project-name/
├── hero.jpg              # Main project image
├── gallery/
│   ├── 1.jpg            # Gallery image 1
│   ├── 2.jpg            # Gallery image 2
│   └── ...
└── videos/
    ├── demo.mp4          # Demo video
    └── behind-scenes.mp4 # Behind the scenes
```

## 🔄 Migration Path

### Phase 1: Enhanced Static Files (Current)
- ✅ Structured TypeScript data
- ✅ Organized file structure
- ✅ Utility functions
- ✅ Script automation

### Phase 2: Content Management (Future)
When you need more flexibility:
1. **Add CMS integration** (Strapi, Sanity, Contentful)
2. **Implement admin interface**
3. **Add real-time updates**
4. **Enable collaborative editing**

### Phase 3: Advanced Features (Future)
- Search and filtering
- Analytics and tracking
- Multi-language support
- Advanced media management

## 🛠️ Development Workflow

### Adding Content
1. Run `npm run add-project` to create project structure
2. Add assets to `public/projects/`
3. Update project data in TypeScript file
4. Test in development
5. Commit and deploy

### Updating Content
1. Edit project TypeScript file
2. Replace/update assets in public folder
3. Test changes
4. Commit and deploy

### Best Practices
- Keep project IDs lowercase with hyphens
- Use descriptive file names
- Optimize images before adding
- Write clear, engaging descriptions
- Use consistent tagging conventions

## 🚀 Performance Benefits

- **Static generation**: All data loaded at build time
- **No API calls**: Zero runtime data fetching
- **CDN optimized**: Assets served from CDN
- **SEO friendly**: All content indexable
- **Fast loading**: Minimal JavaScript overhead

## 🔍 Troubleshooting

### Common Issues

1. **Import errors**: Check file paths and TypeScript configuration
2. **Missing assets**: Verify public folder structure
3. **Build errors**: Ensure all imports are correct
4. **Navigation issues**: Check category/subcategory mapping

### Debug Commands
```bash
# Check project structure
ls -la src/data/projects/

# Verify public assets
ls -la public/projects/

# Test build
npm run build

# Check TypeScript
npx tsc --noEmit
```

## 📚 Next Steps

1. **Add your first project** using the script
2. **Customize the data structure** for your needs
3. **Add more categories** as needed
4. **Implement content components** for rich displays
5. **Consider CMS migration** when you need more features

This system provides a solid foundation for managing your portfolio content while maintaining excellent performance and developer experience. 