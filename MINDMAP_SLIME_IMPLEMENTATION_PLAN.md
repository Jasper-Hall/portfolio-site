# MindMap Slime Mold Visualization Implementation Plan

## Overview
Create a p5.js-based component that replaces the placeholder in `MindMapView.tsx` with an interactive slime mold network connecting project nodes clustered by category and tags. The component will live in a glassmorphic container matching the existing design system.

## Project Context Analysis

### Data Structure
- **Total Projects**: ~25 projects across 7 categories
- **Categories**: film (3), sound (6), graphix (8), tech (3), image (2), art (1), cloth (2)
- **Project Properties**: id, title, category, subcategory, tags[], status, featured, dateRecovered
- **Import Path**: `import { allProjects } from '@/data/projects'`

### Design System Consistency
- **Glassmorphic Container**: `rounded-3xl border border-white/20 backdrop-filter: blur(16px)`
- **Background**: Dark mystical with animated smoke effect (DSC02550.JPG)
- **Typography**: JetBrains Mono Medium, GaldienStamp, Zombnze fonts
- **Colors**: White/transparency variations, earth tones for UI elements
- **Responsive**: Mobile-first approach with `isMobile` detection

## Implementation Steps

### Step 1: Component Architecture Setup
**Context**: Replace placeholder in `MindMapView.tsx` with proper p5.js integration

**Tasks**:
1. Create `SlimeMoldMindMap.tsx` component in `src/components/`
2. Set up p5.js wrapper using `@p5-wrapper/next` (already installed)
3. Create component interface matching existing pattern:
   ```typescript
   interface SlimeMoldMindMapProps {
     className?: string;
     onNodeClick?: (projectId: string) => void;
     onNodeHover?: (projectId: string | null) => void;
   }
   ```
4. Implement ref interface for external control:
   ```typescript
   export interface SlimeMoldMindMapRef {
     highlightProject: (projectId: string) => void;
     clearHighlight: () => void;
     resetSimulation: () => void;
   }
   ```

**Dependencies**: 
- `@p5-wrapper/next` (existing)
- React hooks: `useRef`, `useEffect`, `useImperativeHandle`, `forwardRef`

**Files Modified**: 
- New: `src/components/SlimeMoldMindMap.tsx`

---

### Step 2: Project Data Processing & Node Generation
**Context**: Transform project data into positioned nodes for visualization

**Tasks**:
1. Create data processing utilities:
   ```typescript
   interface ProjectNode {
     id: string;
     title: string;
     category: string;
     subcategory: string;
     tags: string[];
     position: { x: number; y: number };
     targetPosition: { x: number; y: number };
     velocity: { x: number; y: number };
     radius: number;
     color: { r: number; g: number; b: number };
     connections: string[]; // IDs of connected nodes
     attractionWeight: number;
   }
   ```

2. Implement clustering algorithm:
   ```typescript
   function clusterProjectsByCategory(projects: ProjectData[]): Map<string, ProjectNode[]>
   function calculateTagSimilarity(project1: ProjectData, project2: ProjectData): number
   function assignInitialPositions(nodes: ProjectNode[], canvasWidth: number, canvasHeight: number): void
   ```

3. Tag-based connection logic:
   - Calculate Jaccard similarity between project tag sets
   - Create connections for similarity > threshold (0.3)
   - Weight connections by number of shared tags
   - Add category-based base connections

**Dependencies**: 
- `src/data/projects` (existing)
- Math utilities for clustering algorithms

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (data processing functions)

---

### Step 3: Clustering Algorithm Implementation
**Context**: Position nodes intelligently based on category and tag relationships

**Tasks**:
1. **Category-based primary clustering**:
   - Use existing `mindMapStructure` for category definitions
   - Create 7 main cluster centers in canvas using golden ratio spiral
   - Assign each project to its category cluster center

2. **Tag-based subclustering**:
   - Within each category, create subclusters for shared tags
   - Use k-means clustering variation for tag groups
   - Apply force-directed layout for fine positioning

3. **Responsive positioning**:
   ```typescript
   function calculateClusterPositions(isMobile: boolean, canvasWidth: number, canvasHeight: number) {
     // Golden ratio spiral for main categories
     // Adjust spacing for mobile vs desktop
     // Account for container padding and safe areas
   }
   ```

4. **Node sizing strategy**:
   - Featured projects: larger radius (mobile: 25px, desktop: 35px)
   - Regular projects: smaller radius (mobile: 15px, desktop: 20px)
   - Scale based on project status and date

**Dependencies**: 
- Math libraries for clustering algorithms
- Existing responsive patterns from `MindMap.tsx`

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (clustering logic)

---

### Step 4: Basic p5.js Sketch Setup
**Context**: Create the foundational p5.js sketch with proper lifecycle management

**Tasks**:
1. **Sketch structure setup**:
   ```typescript
   const sketch: Sketch = (p5) => {
     let nodes: ProjectNode[] = [];
     let connections: Connection[] = [];
     let customFont: p5.Font;
     let isMobile = false;
     let centerX = 0;
     let centerY = 0;
     
     p5.preload = () => {
       customFont = p5.loadFont("/fonts/JetBrainsMono-Medium.ttf");
     };
     
     p5.setup = () => { /* initialization */ };
     p5.draw = () => { /* animation loop */ };
   };
   ```

2. **Canvas management**:
   - Responsive canvas sizing matching `MindMap.tsx` pattern
   - Mobile detection using `windowWidth < 600`
   - Handle window resize events

3. **Font loading**:
   - Load JetBrains Mono Medium for consistency
   - Fallback handling for font loading failures
   - Text sizing for mobile vs desktop

4. **Initial node setup**:
   - Process `allProjects` data into `ProjectNode[]`
   - Apply clustering algorithm
   - Initialize positions and physics properties

**Dependencies**: 
- p5.js types and methods
- Font files from `/public/fonts/`

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (p5.js sketch structure)

---

### Step 5: Node Rendering System
**Context**: Create visually appealing project nodes with glassmorphic effects

**Tasks**:
1. **Node visual design**:
   ```typescript
   function drawProjectNode(node: ProjectNode, p5: p5) {
     // Glassmorphic circle with blur effect
     // Category color coding
     // Hover state highlighting
     // Selection state indicators
   }
   ```

2. **Category color scheme**:
   - film: Blue tones (`#3B82F6`)
   - sound: Purple tones (`#8B5CF6`) 
   - graphix: Green tones (`#10B981`)
   - tech: Orange tones (`#F59E0B`)
   - image: Pink tones (`#EC4899`)
   - art: Red tones (`#EF4444`)
   - cloth: Teal tones (`#14B8A6`)

3. **Glassmorphic effects**:
   - White/transparent base with blur
   - Subtle border gradients
   - Drop shadows for depth
   - Animated glow on hover/selection

4. **Text rendering**:
   - Project titles with truncation for long names
   - Font sizing based on node radius
   - High contrast for readability
   - Responsive text positioning

**Dependencies**: 
- p5.js drawing functions
- Color utilities for scheme generation

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (node rendering functions)

---

### Step 6: Slime Mold Simulation Integration
**Context**: Integrate provided slime mold code for organic connection visualization

**Provided Slime Mold Code Analysis**:
The provided code consists of two files:
- `mold.js`: Mold class with sensor-based movement, trail following behavior
- `sketch.js`: Main setup with 4000 agents, trail decay via `background(0, 5)`

**Key Features to Adapt**:
- Sensor-based steering (45° angle, 10px distance)
- Trail following using pixel data
- Wrapping movement with modulo operations
- Stop/start control mechanism

**Tasks**:
1. **Convert Mold class to TypeScript**:
   ```typescript
   interface SlimeMold {
     x: number;
     y: number;
     r: number;
     heading: number;
     vx: number;
     vy: number;
     rotAngle: number;
     stop: boolean;
     
     // Sensor properties
     rSensorPos: { x: number; y: number };
     lSensorPos: { x: number; y: number };
     fSensorPos: { x: number; y: number };
     sensorAngle: number;
     sensorDist: number;
     
     update(pixels: Uint8ClampedArray, d: number, canvasWidth: number, canvasHeight: number): void;
     display(p5: p5): void;
     getSensorPos(sensor: { x: number; y: number }, angle: number, canvasWidth: number, canvasHeight: number): void;
   }
   ```

2. **Adapt for project node attraction**:
   - Replace random initialization with spawning near project nodes
   - Add attraction forces toward project nodes (food sources)
   - Modify sensor behavior to detect both trails and node proximity
   - Weight movement toward nodes with similar tags

3. **Integration with existing canvas**:
   - Use p5.js `loadPixels()`/`updatePixels()` for trail detection
   - Implement trail decay with controlled background alpha
   - Scale agent count based on device performance (mobile: 500, desktop: 1000-4000)

4. **Performance adaptations**:
   ```typescript
   const slimeConfig = {
     agentCount: isMobile ? 500 : 2000, // Reduced from 4000 for web performance
     sensorAngle: 45, // Degrees, as in original
     sensorDist: isMobile ? 8 : 10, // Pixel distance
     rotAngle: 45, // Turning angle in degrees
     trailDecay: 5, // Alpha value for background fade (0-255)
     agentSize: 0.5, // Radius as in original
   };
   ```

**Dependencies**: 
- Original slime mold algorithm logic
- p5.js pixel manipulation functions
- Project node positions as attractors

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (slime mold class and integration)

---

### Step 7: Interactive Behaviors
**Context**: Add mouse/touch interactions matching existing UX patterns

**Tasks**:
1. **Node hover detection**:
   ```typescript
   function findHoveredNode(mouseX: number, mouseY: number): ProjectNode | null
   function handleNodeHover(node: ProjectNode | null): void
   ```

2. **Click handling**:
   - Single click: select/highlight project
   - Double click: open project details (callback to parent)
   - Touch support for mobile devices

3. **Visual feedback**:
   - Hover state: node scaling and glow effect
   - Selection state: persistent highlight
   - Connection highlighting: emphasize related projects

4. **Accessibility**:
   - Keyboard navigation support
   - Screen reader compatible labels
   - Focus indicators

**Dependencies**: 
- p5.js mouse/touch event handlers
- Accessibility best practices

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (interaction handlers)

---

### Step 8: Animation & Physics System
**Context**: Create smooth, organic movements for nodes and connections

**Tasks**:
1. **Node physics**:
   ```typescript
   function updateNodePhysics(node: ProjectNode, deltaTime: number): void {
     // Attraction to cluster center
     // Repulsion from nearby nodes
     // Velocity damping
     // Boundary constraints
   }
   ```

2. **Smooth transitions**:
   - Position interpolation for layout changes
   - Easing functions for organic movement
   - Staggered animations for visual appeal

3. **Performance considerations**:
   - Spatial hashing for collision detection
   - Frame rate adaptive physics timestep
   - LOD (Level of Detail) for distant nodes

4. **Animation states**:
   - Initial spawn animation
   - Idle breathing/floating motion
   - Selection/hover response animations
   - Layout reorganization transitions

**Dependencies**: 
- Physics simulation libraries or custom implementation
- Animation easing functions

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (physics and animation systems)

---

### Step 9: Integration with MindMapView
**Context**: Replace placeholder and integrate with existing component architecture

**Tasks**:
1. **Replace placeholder in MindMapView.tsx**:
   ```typescript
   // Replace placeholder content with SlimeMoldMindMap
   <SlimeMoldMindMap 
     ref={slimeMoldRef}
     className="w-full h-full"
     onNodeClick={handleNodeClick}
     onNodeHover={handleNodeHover}
   />
   ```

2. **Add to component exports**:
   - Export `SlimeMoldMindMap` from components index
   - Update TypeScript types
   - Ensure proper tree-shaking

3. **State management integration**:
   - Connect to existing navigation state
   - Sync with `ArchiveViewer` selection
   - Handle external highlight requests

4. **Responsive container**:
   - Match existing glassmorphic container styling
   - Maintain aspect ratio consistency
   - Handle orientation changes

**Dependencies**: 
- Existing `MindMapView.tsx` structure
- Component export patterns

**Files Modified**:
- `src/components/MindMapView.tsx` (integration)
- `src/components/index.ts` (if exists, for exports)

---

### Step 10: Performance Optimization & Polish
**Context**: Ensure smooth performance across devices and add final polish

**Tasks**:
1. **Performance monitoring**:
   ```typescript
   function measurePerformance(): {
     fps: number;
     nodeCount: number;
     agentCount: number;
     renderTime: number;
   }
   ```

2. **Adaptive quality settings**:
   - Automatic LOD based on frame rate
   - Agent count scaling for performance
   - Trail resolution adjustment
   - Fallback to simpler rendering on low-end devices

3. **Memory management**:
   - Proper cleanup on component unmount
   - Texture and buffer disposal
   - Event listener cleanup

4. **Visual polish**:
   - Smooth fade-in on component mount
   - Loading state with progress indicator
   - Error handling for failed font/asset loading
   - Graceful degradation for unsupported features

5. **Testing & validation**:
   - Cross-browser compatibility testing
   - Mobile device performance validation
   - Accessibility compliance verification
   - Edge case handling (empty data, single project, etc.)

**Dependencies**: 
- Performance monitoring tools
- Cross-browser testing setup

**Files Modified**:
- `src/components/SlimeMoldMindMap.tsx` (optimization and polish)

---

## Technical Specifications

### Performance Targets
- **Desktop**: 60 FPS, 1000+ slime agents, full visual effects
- **Mobile**: 30 FPS, 500 slime agents, reduced effects
- **Memory**: < 100MB additional RAM usage
- **Load Time**: < 2 seconds to full interactivity

### Browser Support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- iOS Safari 14+, Chrome Mobile 90+
- WebGL required, graceful fallback to Canvas2D

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Reduced motion support

### Integration Points
- Compatible with existing `SplitView` layout
- Maintains glassmorphic design consistency
- Integrates with project navigation system
- Supports external highlighting and selection

## File Structure
```
src/components/
├── SlimeMoldMindMap.tsx          # Main component (new)
├── MindMapView.tsx               # Updated integration
└── MindMap.tsx                   # Existing radial mindmap (unchanged)

src/data/
└── projects/                     # Existing project data (unchanged)
```

## Implementation Order
Execute steps sequentially, with each step building on the previous. Each step should be testable independently and include proper error handling. The modular approach allows for iterative development and testing.

## Notes for Implementation
- Maintain consistency with existing design patterns
- Use TypeScript for all new code
- Follow existing naming conventions
- Implement proper error boundaries
- Include comprehensive inline documentation
- Plan for future extensibility (filters, search, etc.)
