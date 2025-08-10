import { ProjectData } from '../types';
import filmProjects from './film';
import soundProjects from './sound';
import imageProjects from './image';
import artProjects from './art';
// Import other category projects as they're created
// import clothProjects from './cloth';
// import techProjects from './tech';
// import designProjects from './design';

// Combine all projects
export const allProjects: ProjectData[] = [
  ...filmProjects,
  ...soundProjects,
  ...imageProjects,
  ...artProjects,
  // ...clothProjects,
  // ...techProjects,
  // ...designProjects,
];

// Utility functions for filtering projects
export const getProjectsByCategory = (category: string): ProjectData[] => 
  allProjects.filter(project => project.category === category);

export const getProjectsBySubcategory = (category: string, subcategory: string): ProjectData[] => 
  allProjects.filter(project => project.category === category && project.subcategory === subcategory);

export const getFeaturedProjects = (): ProjectData[] => 
  allProjects.filter(project => project.featured);

export const getProjectsByStatus = (status: ProjectData['status']): ProjectData[] => 
  allProjects.filter(project => project.status === status);

export const getProjectsByTag = (tag: string): ProjectData[] => 
  allProjects.filter(project => project.tags.includes(tag));

export const getProjectById = (id: string): ProjectData | undefined => 
  allProjects.find(project => project.id === id);

// Get projects in MindMap order for featured display
export const getFeaturedProjectsInMindMapOrder = (): ProjectData[] => {
  const mindMapOrder = ['film', 'sound', 'cloth', 'image', 'tech', 'art', 'design'];
  const featuredProjects = getFeaturedProjects();
  
  return mindMapOrder
    .map(category => featuredProjects.find(project => project.category === category))
    .filter(Boolean) as ProjectData[];
};

// Export individual category projects for specific use cases
export { filmProjects, soundProjects, imageProjects, artProjects }; 