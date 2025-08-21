# Portfolio View System

This document describes the 3-way view toggle system implemented in the portfolio site.

## Overview

The portfolio site now features a 3-way toggle switch in the center of the navigation bar that allows users to switch between different viewing modes:

1. **Mind Map View** (Left) - Full-screen mind map with node forest visualization
2. **Split View** (Center) - Current split screen layout with mind map and archive viewer
3. **Gallery View** (Right) - Full-screen scrollable gallery of all projects

## Components

### ViewToggle
- Located in the center of the navigation bar
- 3-button slideable toggle with icons: 🧠 (Mind Map), ⚡ (Split View), 🖼️ (Gallery)
- Sliding indicator that moves between positions
- Supports both click and drag interactions
- Touch-friendly for mobile devices
- Smooth transitions between states

### MindMapView
- Full-screen view for the mind map
- Placeholder for p5.js integration (coming soon)
- Shows project categories structure
- Background gradient styling

### SplitView
- Contains the existing split screen layout
- Left panel: Mind Map with RippleShader background
- Right panel: Archive Viewer
- Maintains all existing functionality

### GalleryView
- Full-screen scrollable gallery
- Placeholder for project loading (coming soon)
- Sticky header with title
- Grid layout for project cards

## Implementation Status

### ✅ Completed
- View toggle component with 3-way switching
- View state management in main page
- Component scaffolding for all three views
- Navigation integration

### 🚧 In Progress / Coming Soon
- p5.js integration for MindMapView node forest visualization
- Project data loading for GalleryView
- Node connections and interactions in MindMapView
- Enhanced gallery layout and filtering

## Usage

1. **Switch Views**: 
   - Click individual toggle buttons, or
   - Drag/slide the toggle indicator between positions
   - Touch and drag on mobile devices
2. **Mind Map View**: Full-screen exploration of project relationships
3. **Split View**: Interactive mind map with archive viewer (current default)
4. **Gallery View**: Browse all projects in a scrollable format

## Technical Details

- Uses React state management for view switching
- Components are conditionally rendered based on `currentView` state
- View state persists during navigation
- All existing functionality is preserved in SplitView
- Responsive design maintained across all views

## Future Enhancements

- p5.js sketch for interactive node forest
- Project filtering and search in GalleryView
- Smooth transitions between views
- View-specific keyboard shortcuts
- View state persistence across sessions
