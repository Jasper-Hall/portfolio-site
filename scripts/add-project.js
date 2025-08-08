#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const [category, projectName, title, subtitle] = args;

if (!category || !projectName || !title || !subtitle) {
  console.log('Usage: node add-project.js <category> <project-name> <title> <subtitle>');
  console.log('Example: node add-project.js film digital-archaeology "Digital Archaeology" "Recovering lost media"');
  process.exit(1);
}

const projectId = projectName;
const archiveRef = `${category.toUpperCase()}-${String(Date.now()).slice(-3)}`;

// Create project data
const projectData = `import { ProjectData } from '../../types';

const ${projectId}: ProjectData = {
  id: '${projectId}',
  title: '${title}',
  subtitle: '${subtitle}',
  description: 'Add your project description here...',
  dateRecovered: '${new Date().toISOString().split('T')[0]}',
  medium: ['Medium1', 'Medium2'],
  tags: ['Tag1', 'Tag2'],
  status: 'active',
  archiveRef: '${archiveRef}',
  category: '${category}',
  subcategory: 'subcategory',
  featured: false,
  
  // Enhanced content
  images: [
    '/projects/${category}/${projectId}/hero.jpg',
    '/projects/${category}/${projectId}/gallery/1.jpg'
  ],
  videos: [
    '/projects/${category}/${projectId}/demo.mp4'
  ],
  externalLinks: [
    { label: 'View Project', url: 'https://...', type: 'primary' }
  ],
  contentBlocks: [
    {
      type: 'text',
      content: 'Add your project content here...'
    }
  ],
  gallery: [
    {
      src: '/projects/${category}/${projectId}/gallery/1.jpg',
      alt: 'Project image',
      caption: 'Project caption',
      type: 'image'
    }
  ]
};

export default ${projectId};
`;

// Create directories
const projectDir = path.join(__dirname, '..', 'src', 'data', 'projects', category);
const publicDir = path.join(__dirname, '..', 'public', 'projects', category, projectId);

if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir, { recursive: true });
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(path.join(publicDir, 'gallery'), { recursive: true });
  fs.mkdirSync(path.join(publicDir, 'videos'), { recursive: true });
}

// Create project file
const projectFilePath = path.join(projectDir, `${projectId}.ts`);
fs.writeFileSync(projectFilePath, projectData);

// Update category index
const categoryIndexPath = path.join(projectDir, 'index.ts');
let categoryIndexContent = '';

if (fs.existsSync(categoryIndexPath)) {
  categoryIndexContent = fs.readFileSync(categoryIndexPath, 'utf8');
  // Remove the closing bracket and add new import and project
  categoryIndexContent = categoryIndexContent.replace(/];\s*$/, '');
  categoryIndexContent += `,\n  ${projectId}\n];\n`;
} else {
  categoryIndexContent = `import { ProjectData } from '../../types';\nimport ${projectId} from './${projectId}';\n\nconst ${category}Projects: ProjectData[] = [\n  ${projectId}\n];\n\nexport default ${category}Projects;\n`;
}

fs.writeFileSync(categoryIndexPath, categoryIndexContent);

// Update main index
const mainIndexPath = path.join(__dirname, '..', 'src', 'data', 'projects', 'index.ts');
if (fs.existsSync(mainIndexPath)) {
  let mainIndexContent = fs.readFileSync(mainIndexPath, 'utf8');
  
  // Add import if not exists
  if (!mainIndexContent.includes(`import ${category}Projects from './${category}'`)) {
    mainIndexContent = mainIndexContent.replace(
      /import imageProjects from '\.\/image';/,
      `import imageProjects from './image';\nimport ${category}Projects from './${category}';`
    );
  }
  
  // Add to allProjects array
  if (!mainIndexContent.includes(`...${category}Projects`)) {
    mainIndexContent = mainIndexContent.replace(
      /export const allProjects: ProjectData\[\] = \[/,
      `export const allProjects: ProjectData[] = [\n  ...${category}Projects,`
    );
  }
  
  fs.writeFileSync(mainIndexPath, mainIndexContent);
}

console.log(`✅ Project "${title}" created successfully!`);
console.log(`📁 Project file: ${projectFilePath}`);
console.log(`📁 Public assets: ${publicDir}`);
console.log(`🔗 Archive reference: ${archiveRef}`);
console.log('\nNext steps:');
console.log('1. Add your project images to the public directory');
console.log('2. Update the project description and content');
console.log('3. Add external links and media');
console.log('4. Update the category index if needed'); 