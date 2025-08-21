'use client';

import React, { useImperativeHandle, useRef, useEffect, forwardRef } from "react";
import { type Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import p5 from "p5";
import { allProjects } from '@/data/projects';
import type { ProjectData } from '@/data/types';

// Interface for external control of the component
export interface SlimeMoldMindMapRef {
  highlightProject: (projectId: string) => void;
  clearHighlight: () => void;
  resetSimulation: () => void;
}

interface SlimeMoldMindMapProps {
  className?: string;
  onNodeClick?: (projectId: string) => void;
  onNodeHover?: (projectId: string | null) => void;
}

// Project node interface for internal visualization
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
  featured: boolean;
  status: 'active' | 'archived' | 'in-progress';
}

// Slime mold agent interface (converted from provided JavaScript)
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
}

// Configuration for slime mold simulation
interface SlimeConfig {
  agentCount: number;
  sensorAngle: number;
  sensorDist: number;
  rotAngle: number;
  trailDecay: number;
  agentSize: number;
}

const SlimeMoldMindMap = forwardRef<SlimeMoldMindMapRef, SlimeMoldMindMapProps>(({ 
  className = '', 
  onNodeClick,
  onNodeHover
}, ref) => {
  const nodesRef = useRef<ProjectNode[]>([]);
  const moldsRef = useRef<SlimeMold[]>([]);
  const highlightedProjectRef = useRef<string | null>(null);

  const sketch: Sketch = (p5) => {
    // Global variables
    let nodes: ProjectNode[] = [];
    let molds: SlimeMold[] = [];
    let customFont: p5.Font;
    let isMobile = false;
    let centerX = 0;
    let centerY = 0;
    let d = 1; // pixel density
    let slimeConfig: SlimeConfig;
    let hoveredNode: ProjectNode | null = null;
    let selectedNode: ProjectNode | null = null;

    // Category color scheme
    const categoryColors: Record<string, { r: number; g: number; b: number }> = {
      film: { r: 59, g: 130, b: 246 },    // Blue
      sound: { r: 139, g: 92, b: 246 },   // Purple
      graphix: { r: 16, g: 185, b: 129 }, // Green
      tech: { r: 245, g: 158, b: 11 },    // Orange
      image: { r: 236, g: 72, b: 153 },   // Pink
      art: { r: 239, g: 68, b: 68 },      // Red
      cloth: { r: 20, g: 184, b: 166 }    // Teal
    };

    p5.preload = () => {
      try {
        customFont = p5.loadFont("/fonts/JetBrainsMono-Medium.ttf");
      } catch (e) {
        console.warn('Font loading failed, using default font');
      }
    };

    p5.setup = () => {
      // Canvas setup with responsive sizing
      const canvasW = p5.windowWidth > p5.windowHeight ? p5.windowWidth / 2 : p5.windowWidth;
      p5.createCanvas(canvasW, p5.windowHeight);
      p5.noFill();
      p5.strokeWeight(1);
      
      // Mobile detection
      isMobile = p5.windowWidth < 600;
      
      // Set pixel density
      d = p5.pixelDensity();
      
      // Calculate center
      centerX = p5.width / 2;
      centerY = p5.height / 2;
      
      // Configure slime mold simulation
      slimeConfig = {
        agentCount: isMobile ? 500 : 2000,
        sensorAngle: 45,
        sensorDist: isMobile ? 8 : 10,
        rotAngle: 45,
        trailDecay: 5,
        agentSize: 0.5
      };

      // Initialize project nodes
      initializeNodes();
      
      // Initialize slime molds
      initializeMolds();
      
      // Store references for external access
      nodesRef.current = nodes;
      moldsRef.current = molds;
    };

    p5.draw = () => {
      // Trail decay effect (equivalent to background(0, 5) in original)
      p5.fill(0, slimeConfig.trailDecay);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
      
      // Load pixels for slime mold trail detection
      p5.loadPixels();
      
      // Update and display slime molds
      for (let i = 0; i < molds.length; i++) {
        updateMold(molds[i]);
        displayMold(molds[i]);
      }
      
      // Update pixels after mold rendering
      p5.updatePixels();
      
      // Display project nodes on top
      displayNodes();
      
      // Handle interactions
      updateInteractions();
    };

    p5.windowResized = () => {
      const newCanvasW = p5.windowWidth > p5.windowHeight ? p5.windowWidth / 2 : p5.windowWidth;
      p5.resizeCanvas(newCanvasW, p5.windowHeight);
      
      // Update mobile detection
      isMobile = p5.windowWidth < 600;
      
      // Recalculate center
      centerX = p5.width / 2;
      centerY = p5.height / 2;
      
      // Update slime config for new screen size
      slimeConfig.agentCount = isMobile ? 500 : 2000;
      slimeConfig.sensorDist = isMobile ? 8 : 10;
      
      // Reinitialize with new dimensions
      initializeNodes();
      initializeMolds();
    };

    // Mouse/touch interaction handlers
    p5.mouseClicked = () => {
      const clickedNode = findNodeAtPosition(p5.mouseX, p5.mouseY);
      if (clickedNode && onNodeClick) {
        selectedNode = clickedNode;
        onNodeClick(clickedNode.id);
      }
    };

    p5.mouseMoved = () => {
      const newHoveredNode = findNodeAtPosition(p5.mouseX, p5.mouseY);
      if (newHoveredNode !== hoveredNode) {
        hoveredNode = newHoveredNode;
        if (onNodeHover) {
          onNodeHover(hoveredNode ? hoveredNode.id : null);
        }
      }
    };

    // Initialize project nodes from data
    function initializeNodes() {
      nodes = allProjects.map((project, index) => {
        const categoryColor = categoryColors[project.category] || { r: 255, g: 255, b: 255 };
        
        return {
          id: project.id,
          title: project.title,
          category: project.category,
          subcategory: project.subcategory || '',
          tags: project.tags,
          position: { x: 0, y: 0 }, // Will be set by clustering algorithm
          targetPosition: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          radius: project.featured ? (isMobile ? 25 : 35) : (isMobile ? 15 : 20),
          color: categoryColor,
          connections: [],
          attractionWeight: project.featured ? 1.5 : 1.0,
          featured: project.featured,
          status: project.status
        };
      });

      // Calculate tag-based connections
      calculateNodeConnections();
      
      // Apply enhanced clustering algorithm
      applyEnhancedClustering();
    }

    // Calculate tag-based connections between nodes
    function calculateNodeConnections() {
      nodes.forEach(node => {
        node.connections = [];
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          
          const similarity = calculateTagSimilarity(node1, node2);
          const categoryBonus = node1.category === node2.category ? 0.2 : 0;
          const subcategoryBonus = (node1.category === node2.category && 
                                   node1.subcategory === node2.subcategory) ? 0.1 : 0;
          
          const totalSimilarity = similarity + categoryBonus + subcategoryBonus;
          
          // Create connection if similarity above threshold
          if (totalSimilarity > 0.3) {
            node1.connections.push(node2.id);
            node2.connections.push(node1.id);
          }
        }
      }
    }

    // Calculate Jaccard similarity between two nodes based on tags
    function calculateTagSimilarity(node1: ProjectNode, node2: ProjectNode): number {
      if (node1.tags.length === 0 && node2.tags.length === 0) return 0;
      
      const tags1 = new Set(node1.tags.map(tag => tag.toLowerCase()));
      const tags2 = new Set(node2.tags.map(tag => tag.toLowerCase()));
      
      const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
      const union = new Set([...tags1, ...tags2]);
      
      return intersection.size / union.size;
    }

    // Enhanced clustering algorithm with golden ratio spiral and tag-based subclustering
    function applyEnhancedClustering() {
      const categories = [...new Set(nodes.map(n => n.category))];
      const golden = (1 + Math.sqrt(5)) / 2; // Golden ratio
      
      // Calculate main cluster positions using golden ratio spiral
      const clusterCenters: Record<string, { x: number; y: number }> = {};
      const baseRadius = Math.min(p5.width, p5.height) * 0.25;
      
      categories.forEach((category, index) => {
        const angle = index * 2 * Math.PI / golden;
        const radius = baseRadius * Math.sqrt(index / categories.length);
        
        clusterCenters[category] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        };
      });

      // Position nodes within their category clusters
      categories.forEach(category => {
        const categoryNodes = nodes.filter(n => n.category === category);
        const center = clusterCenters[category];
        
        // Group nodes by subcategory for better organization
        const subcategoryGroups: Record<string, ProjectNode[]> = {};
        categoryNodes.forEach(node => {
          const subcat = node.subcategory || 'default';
          if (!subcategoryGroups[subcat]) {
            subcategoryGroups[subcat] = [];
          }
          subcategoryGroups[subcat].push(node);
        });

        const subcategories = Object.keys(subcategoryGroups);
        const subcatAngleStep = (2 * Math.PI) / subcategories.length;
        
        subcategories.forEach((subcat, subcatIndex) => {
          const subcatNodes = subcategoryGroups[subcat];
          const subcatAngle = subcatIndex * subcatAngleStep;
          const subcatRadius = isMobile ? 40 : 60;
          
          const subcatCenterX = center.x + Math.cos(subcatAngle) * subcatRadius;
          const subcatCenterY = center.y + Math.sin(subcatAngle) * subcatRadius;
          
          // Position nodes within subcategory cluster
          subcatNodes.forEach((node, nodeIndex) => {
            if (subcatNodes.length === 1) {
              // Single node goes to subcategory center
              node.position.x = subcatCenterX;
              node.position.y = subcatCenterY;
            } else {
              // Multiple nodes arranged in a circle
              const nodeAngle = (nodeIndex / subcatNodes.length) * 2 * Math.PI;
              const nodeRadius = isMobile ? 25 : 35;
              
              node.position.x = subcatCenterX + Math.cos(nodeAngle) * nodeRadius;
              node.position.y = subcatCenterY + Math.sin(nodeAngle) * nodeRadius;
            }
            
            // Apply some random jitter to prevent perfect overlap
            const jitter = isMobile ? 5 : 8;
            node.position.x += (Math.random() - 0.5) * jitter;
            node.position.y += (Math.random() - 0.5) * jitter;
            
            // Ensure nodes stay within canvas bounds
            node.position.x = Math.max(node.radius, Math.min(p5.width - node.radius, node.position.x));
            node.position.y = Math.max(node.radius, Math.min(p5.height - node.radius, node.position.y));
            
            // Set target position for smooth animations
            node.targetPosition.x = node.position.x;
            node.targetPosition.y = node.position.y;
          });
        });
      });
    }

    // Initialize slime molds with intelligent spawning
    function initializeMolds() {
      molds = [];
      
      // Collect all connected node pairs for intelligent spawning
      const connectedPairs: Array<{ node1: ProjectNode; node2: ProjectNode }> = [];
      nodes.forEach(node1 => {
        node1.connections.forEach(connectionId => {
          const node2 = nodes.find(n => n.id === connectionId);
          if (node2 && node1.id < node2.id) { // Prevent duplicates
            connectedPairs.push({ node1, node2 });
          }
        });
      });
      
      // Spawn majority of molds along connection paths
      const connectionSpawnCount = Math.floor(slimeConfig.agentCount * 0.7);
      for (let i = 0; i < connectionSpawnCount && connectedPairs.length > 0; i++) {
        const pair = connectedPairs[Math.floor(Math.random() * connectedPairs.length)];
        
        // Spawn along the line between connected nodes
        const t = Math.random();
        const spawnX = pair.node1.position.x + t * (pair.node2.position.x - pair.node1.position.x);
        const spawnY = pair.node1.position.y + t * (pair.node2.position.y - pair.node1.position.y);
        
        // Initial heading toward one of the connected nodes
        const targetNode = Math.random() < 0.5 ? pair.node1 : pair.node2;
        const initialHeading = Math.atan2(
          targetNode.position.y - spawnY,
          targetNode.position.x - spawnX
        ) * 180 / Math.PI;
        
        molds.push(createSlimeMold(spawnX, spawnY, initialHeading));
      }
      
      // Spawn remaining molds near random nodes
      const remainingCount = slimeConfig.agentCount - connectionSpawnCount;
      for (let i = 0; i < remainingCount; i++) {
        const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
        const spawnRadius = isMobile ? 15 : 25;
        const spawnAngle = Math.random() * 2 * Math.PI;
        
        const spawnX = sourceNode.position.x + Math.cos(spawnAngle) * spawnRadius;
        const spawnY = sourceNode.position.y + Math.sin(spawnAngle) * spawnRadius;
        
        molds.push(createSlimeMold(spawnX, spawnY, Math.random() * 360));
      }
    }

    // Create a slime mold agent with given position and heading
    function createSlimeMold(x: number, y: number, heading: number): SlimeMold {
      return {
        x: (x + p5.width) % p5.width,
        y: (y + p5.height) % p5.height,
        r: slimeConfig.agentSize,
        heading: heading,
        vx: 0,
        vy: 0,
        rotAngle: slimeConfig.rotAngle,
        stop: false,
        rSensorPos: { x: 0, y: 0 },
        lSensorPos: { x: 0, y: 0 },
        fSensorPos: { x: 0, y: 0 },
        sensorAngle: slimeConfig.sensorAngle,
        sensorDist: slimeConfig.sensorDist
      };
    }

    // Update mold position and behavior (adapted from provided code)
    function updateMold(mold: SlimeMold) {
      if (mold.stop) {
        mold.vx = 0;
        mold.vy = 0;
        return;
      }

      mold.vx = Math.cos(p5.radians(mold.heading));
      mold.vy = Math.sin(p5.radians(mold.heading));
      
      // Wrap around canvas
      mold.x = (mold.x + mold.vx + p5.width) % p5.width;
      mold.y = (mold.y + mold.vy + p5.height) % p5.height;
      
      // Get sensor positions
      getSensorPos(mold.rSensorPos, mold, mold.heading + mold.sensorAngle);
      getSensorPos(mold.lSensorPos, mold, mold.heading - mold.sensorAngle);
      getSensorPos(mold.fSensorPos, mold, mold.heading);
      
      // Sample pixels at sensor positions
      const r = samplePixel(mold.rSensorPos.x, mold.rSensorPos.y);
      const l = samplePixel(mold.lSensorPos.x, mold.lSensorPos.y);
      const f = samplePixel(mold.fSensorPos.x, mold.fSensorPos.y);
      
      // Steering logic from original algorithm
      if (f > l && f > r) {
        // Continue straight
        mold.heading += 0;
      } else if (f < l && f < r) {
        // Random turn when no clear direction
        if (Math.random() < 0.5) {
          mold.heading += mold.rotAngle;
        } else {
          mold.heading -= mold.rotAngle;
        }
      } else if (l > r) {
        // Turn left
        mold.heading -= mold.rotAngle;
      } else if (r > l) {
        // Turn right
        mold.heading += mold.rotAngle;
      }
    }

    // Display mold (adapted from provided code)
    function displayMold(mold: SlimeMold) {
      p5.noStroke();
      p5.fill(255);
      p5.ellipse(mold.x, mold.y, mold.r * 2, mold.r * 2);
    }

    // Get sensor position with wrapping
    function getSensorPos(sensor: { x: number; y: number }, mold: SlimeMold, angle: number) {
      sensor.x = (mold.x + mold.sensorDist * Math.cos(p5.radians(angle)) + p5.width) % p5.width;
      sensor.y = (mold.y + mold.sensorDist * Math.sin(p5.radians(angle)) + p5.height) % p5.height;
    }

    // Sample pixel value at position
    function samplePixel(x: number, y: number): number {
      const index = 4 * (d * Math.floor(y)) * (d * p5.width) + 4 * (d * Math.floor(x));
      return p5.pixels[index] || 0;
    }

    // Display project nodes
    function displayNodes() {
      nodes.forEach(node => {
        const isHovered = hoveredNode === node;
        const isSelected = selectedNode === node;
        const isHighlighted = highlightedProjectRef.current === node.id;
        
        // Node appearance
        const alpha = isHovered ? 200 : (isSelected || isHighlighted ? 255 : 150);
        const scale = isHovered ? 1.2 : 1.0;
        
        // Glassmorphic effect
        p5.fill(255, 255, 255, 30);
        p5.stroke(node.color.r, node.color.g, node.color.b, alpha);
        p5.strokeWeight(isSelected || isHighlighted ? 3 : 2);
        
        const radius = node.radius * scale;
        p5.ellipse(node.position.x, node.position.y, radius * 2, radius * 2);
        
        // Inner glow for featured projects
        if (node.featured) {
          p5.fill(node.color.r, node.color.g, node.color.b, 20);
          p5.noStroke();
          p5.ellipse(node.position.x, node.position.y, radius * 1.5, radius * 1.5);
        }
        
        // Text label
        if (isHovered || isSelected || radius > 20) {
          p5.fill(255, alpha);
          p5.noStroke();
          p5.textAlign(p5.CENTER, p5.CENTER);
          
          if (customFont) {
            try {
              p5.textFont(customFont, isMobile ? 10 : 12);
            } catch (e) {
              // Font not ready, use default
            }
          }
          
          const maxWidth = radius * 3;
          const truncatedTitle = node.title.length > 15 ? node.title.substring(0, 12) + '...' : node.title;
          
          p5.text(truncatedTitle, node.position.x, node.position.y + radius + 15);
        }
      });
    }

    // Find node at mouse position
    function findNodeAtPosition(x: number, y: number): ProjectNode | null {
      for (const node of nodes) {
        const distance = Math.sqrt(
          Math.pow(x - node.position.x, 2) + Math.pow(y - node.position.y, 2)
        );
        if (distance <= node.radius) {
          return node;
        }
      }
      return null;
    }

    // Update interactions and animations
    function updateInteractions() {
      // Placeholder for future interaction updates
      // Will be enhanced in later steps
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    highlightProject: (projectId: string) => {
      highlightedProjectRef.current = projectId;
    },
    clearHighlight: () => {
      highlightedProjectRef.current = null;
    },
    resetSimulation: () => {
      // Reset slime mold positions and trails
      // Will be implemented when needed
    }
  }));

  return (
    <div 
      className={`${className}`} 
      style={{ 
        zIndex: 20, 
        position: 'relative', 
        pointerEvents: 'auto' 
      }}
    >
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );
});

SlimeMoldMindMap.displayName = 'SlimeMoldMindMap';

export default SlimeMoldMindMap;
