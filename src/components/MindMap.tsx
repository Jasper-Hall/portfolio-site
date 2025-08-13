'use client';

import React, { useImperativeHandle, useRef } from "react";
import { type Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import p5 from "p5";

export interface MindMapRef {
  clearActiveSection: () => void;
}

interface MindMapProps {
  className?: string;
  onSectionClick?: (sectionName: string) => void;
  onSubBranchClick?: (sectionName: string, subBranchName: string) => void;
  onBranchHover?: (branchName: string | null) => void;
}

const MindMap = React.forwardRef<MindMapRef, MindMapProps>(({ 
  className = '', 
  onSectionClick,
  onSubBranchClick,
  onBranchHover
}, ref) => {
  const activeSectionRef = useRef<string | null>(null);
  const sectionsRef = useRef<any[]>([]);
  
  const sketch: Sketch = (p5) => {
    // Global variables with proper types
    let customFont: p5.Font;
    let jaeceLogo: p5.Image;
    let xtsuiLogo: p5.Image;
    let purgeFilesLogo: p5.Image;
    let blueCircle: p5.Image;
    let logoElementScales: number[] = [];
    let signalProgress: number[] = [];
    let sections: Array<{
      name: string;
      logo: p5.Image | null;
      branches: string[];
      isVisible: boolean;
      branchAnimProgress: number;
      angles?: number[];
      distances?: number[];
      adjustedDistances?: number[];
    }> = [];
    let centerX = 0;
    let radiusX = 0;
    let radiusY = 0;
    let curveHeight = 0;
    let isMobile = false;
    let activeSectionIndex = -1; // Track which section is currently open
    let activeSectionName: string | null = null; // Track which section is active in ArchiveViewer (local to sketch)
    let subBranchPositions: Array<{x: number, y: number, sectionName: string, branchName: string}> = []; // Track sub-branch positions for clicks

    p5.preload = () => {
      customFont = p5.loadFont("/fonts/JetBrainsMono-Medium.ttf");
      blueCircle = p5.loadImage("/blueCircle.png");
      jaeceLogo = p5.loadImage("/logos/jaeceYtlogonotext.png");
      xtsuiLogo = p5.loadImage("/logos/portfoliologo1.png");
      purgeFilesLogo = p5.loadImage("/logos/purgeFileslogodraft1.png");
    };

    p5.setup = () => {
      const canvasW = p5.windowWidth > p5.windowHeight ? p5.windowWidth / 2 : p5.windowWidth;
      p5.createCanvas(canvasW, p5.windowHeight);
      p5.noFill();
      p5.strokeWeight(1);

      // Detect mobile screen using full window width
      isMobile = p5.windowWidth < 768;

      centerX = p5.width / 2;
      
      // Adjust layout for mobile
      if (isMobile) {
        radiusX = p5.width * 0.25; // Smaller radius for mobile
        radiusY = (p5.height - 64) * 0.4; // Increased vertical radius to use more space
        curveHeight = 50; // Reduced height for mobile (no top nav)
      } else {
        radiusX = p5.width * 0.3;
        radiusY = (p5.height - 64) * 0.33;
        curveHeight = 70; // No top nav on desktop
      }

      // Initialize logo element scales for individual pulsing (22 elements in the SVG)
      logoElementScales = Array(22).fill(1);
      
      // Initialize signal progress for each branch
      signalProgress = Array(sections.length).fill(0);

      initSections();
      computeScalingFactorAndAdjustDistances();
      
      // Store sections reference for external access
      sectionsRef.current = sections;
    };

    // Initialize active section name
    activeSectionName = activeSectionRef.current;

    p5.draw = () => {
      p5.clear(); // Use clear instead of background to maintain transparency
      
      // Clear sub-branch positions for this frame
      subBranchPositions = [];
      
      // Update individual logo element pulse values for line width and circle diameter
      for (let i = 0; i < logoElementScales.length; i++) {
        // For circles (elements 14+), only allow growth, not shrinking
        if (i >= 14) {
          const pulse = p5.sin(p5.frameCount * 0.03 + i * 0.5);
          logoElementScales[i] = 1 + 0.3 * p5.max(0, pulse); // Only positive values
        } else {
          // For lines, allow both thickening and thinning
          logoElementScales[i] = 1 + 0.3 * p5.sin(p5.frameCount * 0.03 + i * 0.5);
        }
      }
      
      // Update signal progress for each branch
      for (let i = 0; i < signalProgress.length; i++) {
        signalProgress[i] += 0.015; // Slightly slower speed for better visibility
        if (signalProgress[i] > 1) {
          signalProgress[i] = 0; // Reset when signal reaches the end
        }
      }
      
      drawMindMap();
    };

    p5.windowResized = () => {
      const newCanvasW = p5.windowWidth > p5.windowHeight ? p5.windowWidth / 2 : p5.windowWidth;
      p5.resizeCanvas(newCanvasW, p5.windowHeight);
      
      // Update mobile detection using window width
      isMobile = p5.windowWidth < 768;
      
      centerX = p5.width / 2;
      
      // Adjust layout for mobile
      if (isMobile) {
        radiusX = p5.width * 0.25;
        radiusY = (p5.height - 64) * 0.4; // Increased vertical radius to use more space
        curveHeight = 50; // No top nav on mobile
      } else {
        radiusX = p5.width * 0.3;
        radiusY = (p5.height - 64) * 0.33;
        curveHeight = 70; // No top nav on desktop
      }
      
      computeScalingFactorAndAdjustDistances();
    };

    p5.mouseClicked = () => {
      if (p5.touches.length === 0) {
        // First check for sub-branch clicks (higher priority)
        for (const subBranch of subBranchPositions) {
          const clickRadius = isMobile ? 25 : 30;
          if (p5.dist(p5.mouseX, p5.mouseY, subBranch.x, subBranch.y) < clickRadius) {
            if (onSubBranchClick) {
              onSubBranchClick(subBranch.sectionName, subBranch.branchName);
              // Set the parent section as active for highlighting
              activeSectionName = subBranch.sectionName;
              activeSectionRef.current = subBranch.sectionName;
            }
            return; // Exit early if sub-branch was clicked
          }
        }
        
        // Then check for main section clicks
        sections.forEach((section, index) => {
          const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
          const movement = p5.sin(p5.frameCount * 0.02 + index) * 3;
          const x = centerX + radiusX * p5.cos(angle) + movement;
          const y = curveHeight + (isMobile ? 80 : 100) + radiusY * p5.sin(angle) + movement + 95; // Match the grey circle position

          // Smaller touch area to prevent accidental triggering
          const touchRadius = isMobile ? 25 : 30;
          if (p5.dist(p5.mouseX, p5.mouseY, x, y) < touchRadius) {
            // Single-open logic: close all other sections first
            if (isMobile) {
              sections.forEach((s, i) => {
                if (i !== index) {
                  s.isVisible = false;
                  s.branchAnimProgress = 0;
                }
              });
              activeSectionIndex = section.isVisible ? -1 : index;
            }
            
            // Single-open logic: close all other sections first
            sections.forEach((s, i) => {
              if (i !== index) {
                s.isVisible = false;
                s.branchAnimProgress = 0;
              }
            });
            
            section.isVisible = !section.isVisible;
            section.branchAnimProgress = section.isVisible ? 0 : 1;
            
            // Call onSectionClick when section is opened (no delay needed now)
            if (section.isVisible && onSectionClick) {
              onSectionClick(section.name);
              // Set this as the active section for highlighting
              activeSectionName = section.name;
              activeSectionRef.current = section.name;
            }
          }
        });
      }
    };

    // Track current hover state to prevent unnecessary callbacks
    let currentHoverState: string | null = null;
    let lastHoverCheck = 0;
    const hoverThrottle = 50; // Only check hover every 50ms
    let hoveredSectionIndex = -1;
    let hoveredSubBranch: {sectionName: string, branchName: string} | null = null;
    
    p5.mouseMoved = () => {
      // Throttle hover checks to reduce performance impact
      const now = Date.now();
      if (now - lastHoverCheck < hoverThrottle) {
        return;
      }
      lastHoverCheck = now;
      
      // Check if mouse is outside canvas bounds
      if (p5.mouseX < 0 || p5.mouseX > p5.width || p5.mouseY < 0 || p5.mouseY > p5.height) {
        if (currentHoverState !== null && onBranchHover) {
          currentHoverState = null;
          onBranchHover(null);
        }
        hoveredSectionIndex = -1;
        hoveredSubBranch = null;
        return;
      }

      let hoveredBranchName: string | null = null;
      let newHoveredSectionIndex = -1;
      let newHoveredSubBranch: {sectionName: string, branchName: string} | null = null;
      
      // Check for section hover
      sections.forEach((section, index) => {
        const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
        const movement = p5.sin(p5.frameCount * 0.02 + index) * 3;
        const x = centerX + radiusX * p5.cos(angle) + movement;
        const y = curveHeight + (isMobile ? 80 : 100) + radiusY * p5.sin(angle) + movement + 95;

        const hoverRadius = isMobile ? 35 : 40;
        if (p5.dist(p5.mouseX, p5.mouseY, x, y) < hoverRadius) {
          hoveredBranchName = section.name;
          newHoveredSectionIndex = index;
        }
      });
      
      // Check for sub-branch hover
      if (!hoveredBranchName) {
        for (const subBranch of subBranchPositions) {
          const hoverRadius = isMobile ? 35 : 40;
          if (p5.dist(p5.mouseX, p5.mouseY, subBranch.x, subBranch.y) < hoverRadius) {
            hoveredBranchName = `${subBranch.sectionName}-${subBranch.branchName}`;
            newHoveredSubBranch = {sectionName: subBranch.sectionName, branchName: subBranch.branchName};
            break;
          }
        }
      }
      
      // Update hover states for visual highlighting
      hoveredSectionIndex = newHoveredSectionIndex;
      hoveredSubBranch = newHoveredSubBranch;
      
      // Only call onBranchHover if the hover state has actually changed
      if (currentHoverState !== hoveredBranchName && onBranchHover) {
        currentHoverState = hoveredBranchName;
        onBranchHover(hoveredBranchName);
      }
    };

    p5.touchStarted = () => {
      if (p5.touches.length > 0) {
        let touchHandled = false;
        
        // First check for sub-branch touches (higher priority)
        for (const subBranch of subBranchPositions) {
          const touchRadius = isMobile ? 25 : 30;
          if (p5.dist(p5.mouseX, p5.mouseY, subBranch.x, subBranch.y) < touchRadius) {
            touchHandled = true;
            if (onSubBranchClick) {
              onSubBranchClick(subBranch.sectionName, subBranch.branchName);
              // Set the parent section as active for highlighting
              activeSectionName = subBranch.sectionName;
              activeSectionRef.current = subBranch.sectionName;
            }
            break;
          }
        }
        
        // Then check for main section touches
        if (!touchHandled) {
          sections.forEach((section, index) => {
            const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
            const movement = p5.sin(p5.frameCount * 0.02 + index) * 3;
            const x = centerX + radiusX * p5.cos(angle) + movement;
            const y = curveHeight + (isMobile ? 80 : 100) + radiusY * p5.sin(angle) + movement + 95; // Match the grey circle position

            // Smaller touch area to prevent accidental triggering
            const touchRadius = isMobile ? 25 : 30;
            if (p5.dist(p5.mouseX, p5.mouseY, x, y) < touchRadius) {
              touchHandled = true;
              
              // Single-open logic: close all other sections first
              if (isMobile) {
                sections.forEach((s, i) => {
                  if (i !== index) {
                    s.isVisible = false;
                    s.branchAnimProgress = 0;
                  }
                });
                activeSectionIndex = section.isVisible ? -1 : index;
              }
              
              // Single-open logic: close all other sections first
              sections.forEach((s, i) => {
                if (i !== index) {
                  s.isVisible = false;
                  s.branchAnimProgress = 0;
                }
              });
              
              section.isVisible = !section.isVisible;
              section.branchAnimProgress = section.isVisible ? 0 : 1;
            }
          });
        }
        
        // Only prevent default behavior if we actually handled a touch on a mind map node
        if (touchHandled) {
          return false;
        }
      }
      // Allow default behavior (scrolling) for touches outside mind map nodes
      return true;
    };

    function initSections() {
      // Adjust angles and distances for mobile
      const mobileAngles = isMobile ? {
        purgeFiles: [p5.PI / 2, p5.PI / 1.8], // More downward angles, fixed upward spawning
        jaece: [p5.PI / 1.8, p5.PI / 1.5, p5.PI / 2.2],
        xtsui: [p5.PI / 1.6, p5.PI / 2],
        photography: [p5.PI / 1.8, p5.PI / 1.6, p5.PI / 2.2],
        technology: [p5.PI / 1.8, p5.PI / 1.7, p5.PI / 2.5],
        art: [p5.PI / 1.8, p5.PI / 1.7, p5.PI / 2.2],
        graphix: [p5.PI / 1.8, p5.PI / 1.6, p5.PI / 2.2]
      } : {
        purgeFiles: [p5.PI / 1.8, p5.PI / 1.5], // Fixed: was p5.PI / 27, p5.PI / 1.5
        jaece: [p5.PI / 1.6, p5.PI / 1.2, p5.PI / 1.7], // Fixed: was p5.PI / 30, p5.PI / 1.2, p5.PI / 1.7
        xtsui: [p5.PI / 1.4, p5.PI / 1.5], // Fixed: was p5.PI / 4, p5.PI / 1.5
        photography: [p5.PI / 1.6, p5.PI / 1.4, p5.PI / 2.5], // Fixed: was p5.PI / 30, p5.PI / 3.7, p5.PI / 2.5
        technology: [p5.PI / 1.6, p5.PI / 1.4, (3 * p5.PI) / 8], // Fixed: was p5.PI / 30, p5.PI / 4.5, (3 * p5.PI) / 8
        art: [p5.PI / 1.6, p5.PI / 1.4, p5.PI / 1.9], // Fixed: was p5.PI / 30, p5.PI / 4.5, p5.PI / 1.9
        graphix: [p5.PI / 1.6, p5.PI / 1.4, p5.PI / 2.5] // Fixed: was p5.PI / 30, p5.PI / 3.7, p5.PI / 2.5
      };

      const mobileDistances = isMobile ? {
        purgeFiles: [-50, 35],
        jaece: [-35, 50, 40],
        xtsui: [50, 40],
        photography: [40, 40, 60],
        technology: [35, 40, 70],
        art: [35, 40, 85],
        graphix: [40, 40, 60]
      } : {
        purgeFiles: [-80, 50],
        jaece: [-50, 80, 70],
        xtsui: [80, 66],
        photography: [70, 70, 90],
        technology: [50, 70, 100],
        art: [50, 70, 120],
        graphix: [70, 70, 90]
      };

      sections = [
        {
          name: "cloth",
          logo: xtsuiLogo,
          branches: ["xtsuimart", "archives"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: mobileAngles.xtsui,
          distances: mobileDistances.xtsui,
        },
        {
          name: "film",
          logo: purgeFilesLogo,
          branches: ["archives", "youtube"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: mobileAngles.purgeFiles,
          distances: mobileDistances.purgeFiles,
        },
        {
          name: "sound",
          logo: jaeceLogo,
          branches: ["release", "score", "live"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: mobileAngles.jaece,
          distances: mobileDistances.jaece,
        },
        {
          name: "image",
          logo: null,
          branches: ["photo", "scans", "collage"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: mobileAngles.photography,
          distances: mobileDistances.photography,
        },
        {
          name: "art",
          logo: null,
          branches: ["installation", "bio", "drawing"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: mobileAngles.art,
          distances: mobileDistances.art,
        },
        {
          name: "graphix",
          logo: null,
          branches: ["logo", "artwork"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: mobileAngles.graphix,
          distances: mobileDistances.graphix,
        },
        {
          name: "tech",
          logo: null,
          branches: ["web", "hardware"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: mobileAngles.technology,
          distances: mobileDistances.technology,
        },
      ];
    }

    function computeScalingFactorAndAdjustDistances() {
      const scalingFactors: number[] = [];
      const margin = isMobile ? 15 : 20; // Smaller margin for mobile

      sections.forEach((section, index) => {
        const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
        const x = centerX + radiusX * p5.cos(angle);

        if (section.branches.length > 0 && section.angles && section.distances) {
          section.adjustedDistances = [];

          section.branches.forEach((branch: string, idx: number) => {
            let distance = section.distances![idx];
            let branchAngle = section.angles![idx];
            
            // On mobile, if this is the only open section, use more space and better angles
            if (isMobile && activeSectionIndex !== -1) {
              distance = distance * 1.8;
              
              // Calculate better fan-out angles based on the number of branches
              const totalBranches = section.branches.length;
              const angleSpread = p5.PI / 3; // 60-degree spread
              const startAngle = p5.PI / 2 - angleSpread / 2; // Start from 30 degrees
              
              // Distribute branches evenly across the spread
              if (totalBranches === 1) {
                branchAngle = p5.PI / 2; // Straight down for single branch
              } else {
                branchAngle = startAngle + (idx / (totalBranches - 1)) * angleSpread;
              }
            }
            
            const subX = x + distance * p5.cos(branchAngle);

            p5.textFont(customFont, isMobile ? 8 : 8); // Match the font size used in sub-branches
            const textW = p5.textWidth(branch) + (isMobile ? 12 : 10); // Match the padding used in sub-branches
            const rectLeft = subX - textW / 2;
            const rectRight = subX + textW / 2;

            let requiredScaling = 1;

            if (rectLeft < margin) {
              const availableSpace = x - margin - textW / 2;
              requiredScaling = availableSpace / (distance * p5.cos(branchAngle));
            } else if (rectRight > p5.width - margin) {
              const availableSpace = p5.width - margin - x - textW / 2;
              requiredScaling = availableSpace / (distance * p5.cos(branchAngle));
            }

            if (requiredScaling < 1) {
              scalingFactors.push(requiredScaling);
            }
          });
        }
      });

      const scalingFactor = scalingFactors.length > 0 ? p5.min(scalingFactors) : 1;

      sections.forEach((section) => {
        if (section.branches.length > 0 && section.distances) {
          section.adjustedDistances = section.distances.map((d: number) => d * scalingFactor);
        }
      });
    }

    function drawMindMap() {
      p5.fill(0);
      p5.noStroke();
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textFont(customFont, isMobile ? 10 : 12); // Smaller font for mobile

      const logoX = centerX;
      const logoY = isMobile ? 60 : 80; // Moved up from 80/100 to 60/80
      const logoSize = isMobile ? 60 : 80; // Smaller logo for mobile

      // Draw animated central logo with individual element pulsing
      drawAnimatedLogo(logoX, logoY, logoSize);

      sections.forEach((section, index) => {
        const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
        const movement = p5.sin(p5.frameCount * 0.02 + index) * 3;
        const x = centerX + radiusX * p5.cos(angle) + movement;
        const y = curveHeight + (isMobile ? 80 : 100) + radiusY * p5.sin(angle) + movement; // Adjusted for moved logo

        // Draw connection line
        p5.strokeWeight(0.7);
        p5.stroke(255, 255, 255, 180); // White lines with transparency
        p5.noFill();
        p5.beginShape();
        // The logo is centered at logoY, so the bottom edge is logoY + logoSize/2
        const logoBottomY = logoY + logoSize/2;
        p5.vertex(centerX, logoBottomY);
        p5.bezierVertex(
          centerX,
          y + (logoBottomY - y) / 2,
          x,
          logoBottomY + (y - logoBottomY) / 2,
          x,
          y
        );
        p5.endShape();
        
        // Draw signal dot traveling along the connection
        const signalPos = signalProgress[index];
        if (signalPos > 0) {
          // Calculate position along the bezier curve
          const t = signalPos;
          const signalX = p5.lerp(centerX, x, t);
          const signalY = p5.lerp(logoBottomY, y, t);
          
          // Add some curve to the signal path
          const midX = centerX + (x - centerX) * 0.5;
          const midY = logoBottomY + (y - logoBottomY) * 0.5;
          const curveX = p5.lerp(signalX, midX, 0.3);
          const curveY = p5.lerp(signalY, midY, 0.3);
          
          // Draw the signal dot
          p5.fill(255, 0, 0); // Bright red signal dot
          p5.noStroke();
          p5.circle(curveX, curveY, isMobile ? 8 : 10); // Smaller dot for mobile
          
          // Add a glow effect
          p5.fill(255, 0, 0, 100); // Brighter glow
          p5.circle(curveX, curveY, isMobile ? 16 : 20); // Smaller glow for mobile
        }

        // Add subtle hover glow to connection line
        if (hoveredSectionIndex === index || activeSectionName === section.name) {
          // Redraw the connection line with a glow
          p5.strokeWeight(3);
          p5.stroke(255, 255, 255, 80); // Subtle white glow
          p5.noFill();
          p5.beginShape();
          const logoBottomY = logoY + logoSize/2;
          p5.vertex(centerX, logoBottomY);
          p5.bezierVertex(
            centerX,
            y + (logoBottomY - y) / 2,
            x,
            logoBottomY + (y - logoBottomY) / 2,
            x,
            y
          );
          p5.endShape();
        }

        p5.imageMode(p5.CENTER);
        p5.image(blueCircle, x, y, isMobile ? 24 : 30, isMobile ? 18 : 22); // Smaller circles for mobile

        if (section.logo) {
          p5.image(section.logo, x, y + (isMobile ? 30 : 40), isMobile ? 45 : 60, isMobile ? 45 : 60); // Smaller logos for mobile
        }

        // Text color - keep simple
        if (isMobile && activeSectionIndex === index) {
          p5.fill(255, 255, 255, 255); // Full white for active section
        } else {
          p5.fill(255, 255, 255, 220); // Semi-transparent white
        }
        
        p5.noStroke();
        p5.textFont(customFont, isMobile ? 11 : 14); // Smaller font for mobile
        p5.text(section.name, x, y + (isMobile ? 55 : 75)); // Adjusted position for mobile

        if (section.branches.length > 0) {
          p5.drawingContext.filter = "blur(3px)";
          p5.strokeWeight(0.5);
          p5.stroke(0, 0, 128 * p5.sin(p5.millis() / 1000));
          p5.fill(200, 200, 150, 200 + 128 * p5.sin(p5.millis() / 1000));
          p5.ellipse(x, y + (isMobile ? 75 : 95), 8, 8); // Adjusted position for mobile
          p5.drawingContext.filter = "none";
        }

        if (section.isVisible || section.branchAnimProgress > 0) {
          animateSubBranches(x, y + (isMobile ? 80 : 100), section);
        }
      });
    }

    function animateSubBranches(x: number, y: number, section: typeof sections[0]) {
      if (!section.adjustedDistances || !section.angles) return;

      // Store positions to check for overlaps
      const branchPositions: Array<{x: number, y: number, width: number, height: number}> = [];

      section.branches.forEach((branch: string, idx: number) => {
        let distance = section.adjustedDistances![idx];
        let angle = section.angles![idx];
        
        // On mobile, if this is the only open section, use more space and better angles
        if (isMobile && activeSectionIndex !== -1) {
          // Increase distance for better spacing when only one section is open
          distance = distance * 1.8;
          
          // Calculate better fan-out angles based on the number of branches
          const totalBranches = section.branches.length;
          const angleSpread = p5.PI / 3; // 60-degree spread
          const startAngle = p5.PI / 2 - angleSpread / 2; // Start from 30 degrees
          
          // Distribute branches evenly across the spread
          if (totalBranches === 1) {
            angle = p5.PI / 2; // Straight down for single branch
          } else {
            angle = startAngle + (idx / (totalBranches - 1)) * angleSpread;
          }
        }
        
        // Ensure angles point downward (positive Y values)
        // In p5.js, positive Y goes down, so we want positive sin values
        if (p5.sin(angle) < 0) {
          angle = p5.PI - angle; // Flip the angle to point downward
        }
        
        const subX = x + section.branchAnimProgress * distance * p5.cos(angle);
        const subY = y + section.branchAnimProgress * distance * p5.sin(angle);

        p5.textFont(customFont, isMobile ? 8 : 8); // Larger font for mobile sub-branches
        const textW = p5.textWidth(branch) + (isMobile ? 12 : 10); // More padding for mobile
        const textH = isMobile ? 22 : 20; // Larger height for mobile
        const alpha = p5.map(Math.abs(section.branchAnimProgress), 0, 1, 0, 255);

        // Calculate the final target position for collision detection
        const finalSubX = x + distance * p5.cos(angle);
        const finalSubY = y + distance * p5.sin(angle);
        
        // Check for overlaps and adjust final position if needed
        let finalAdjustedY = finalSubY;
        const minSpacing = isMobile ? 30 : 30; // Increased spacing for mobile
        
        for (const pos of branchPositions) {
          const verticalOverlap = Math.abs(finalAdjustedY - pos.y) < minSpacing;
          const horizontalOverlap = Math.abs(finalSubX - pos.x) < (textW + pos.width) / 2 + 5;
          
          if (verticalOverlap && horizontalOverlap) {
            // Move this branch down to avoid overlap
            finalAdjustedY = pos.y + minSpacing;
          }
        }

        // Store this branch's final position for future collision detection
        branchPositions.push({
          x: finalSubX,
          y: finalAdjustedY,
          width: textW,
          height: textH
        });
        
        // Track sub-branch position for hover detection
        if (section.branchAnimProgress >= 1) {
          subBranchPositions.push({
            x: finalSubX,
            y: finalAdjustedY,
            sectionName: section.name,
            branchName: branch
          });
        }
        
        // Interpolate between start position and final adjusted position based on animation progress
        const startY = y;
        const adjustedY = p5.lerp(startY, finalAdjustedY, section.branchAnimProgress);

        // Draw connection line
        p5.stroke(255, 255, 255, alpha); // White lines with transparency
        p5.strokeWeight(0.7);
        p5.noFill();
        p5.beginShape();
        p5.vertex(x, y);
        p5.bezierVertex(
          x,
          adjustedY + (y - adjustedY) / 2,
          subX,
          y + (adjustedY - y) / 2,
          subX,
          adjustedY
        );
        p5.endShape();

        // Check if this sub-branch is being hovered
        const isThisSubBranchHovered = hoveredSubBranch && 
          hoveredSubBranch.sectionName === section.name && 
          hoveredSubBranch.branchName === branch;

        // Add subtle glow to connection line for hovered sub-branch
        if (isThisSubBranchHovered && section.branchAnimProgress >= 1) {
          p5.stroke(255, 255, 255, alpha * 1.2); // Slightly brighter connection line
          p5.strokeWeight(1.5);
          p5.noFill();
          p5.beginShape();
          p5.vertex(x, y);
          p5.bezierVertex(
            x,
            adjustedY + (y - adjustedY) / 2,
            subX,
            y + (adjustedY - y) / 2,
            subX,
            adjustedY
          );
          p5.endShape();
        }

        // Standard fill for sub-branch rectangles
        p5.fill(255, 255, 255, alpha * 0.6); // More transparent white for normal state

        p5.rect(subX - textW / 2, adjustedY - textH / 2, textW, textH, isMobile ? 8 : 10); // Larger radius for mobile

        p5.fill(0, alpha); // Black text for contrast against the white/grey background rectangles
        p5.noStroke();
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(branch, subX, adjustedY);
      });

      // Update animation progress
      if (section.isVisible && section.branchAnimProgress < 1) {
        section.branchAnimProgress += isMobile ? 0.07 : 0.15; // Faster on desktop
      } else if (!section.isVisible && section.branchAnimProgress > 0) {
        section.branchAnimProgress -= isMobile ? 0.07 : 0.15; // Faster on desktop
      }
    }

    function drawAnimatedLogo(x: number, y: number, size: number) {
      const scale = size / 350; // SVG viewBox is 350x380
      
      p5.push();
      // Center the logo by offsetting it - the circle is at (175, 195) in the SVG
      p5.translate(x - (175 * scale), y - (195 * scale));
      p5.scale(scale);
      
      // Draw the large circle (element 0) - STATIC, no animation
      p5.fill(255);
      p5.stroke(0);
      p5.strokeWeight(1 / scale);
      p5.circle(175, 195, 300); // Center at (175, 195), radius 150
      
      // Draw the lines (elements 1-13)
      p5.stroke(0);
      p5.noFill();
      
      const lines = [
        [200, 120, 225, 210], // Line 1
        [115, 265, 245, 250], // Line 2
        [200, 120, 90, 240],  // Line 3
        [130, 95, 250, 250],  // Line 4
        [250, 130, 177, 300], // Line 5
        [150, 105, 180, 280], // Line 6
        [245, 170, 100, 150], // Line 7
        [50, 190, 280, 210],  // Line 8
        [230, 130, 176, 230], // Line 9
        [230, 220, 100, 150], // Line 10
        [250, 135, 115, 265], // Line 11
        [115, 200, 230, 290], // Line 12
        [200, 120, 225, 210]  // Line 13
      ];
      
      for (let i = 0; i < lines.length; i++) {
        const linePulse = logoElementScales[i + 1];
        p5.strokeWeight((1 / scale) * linePulse);
        p5.line(lines[i][0], lines[i][1], lines[i][2], lines[i][3]);
      }
      
      // Draw the circles (elements 14-21)
      p5.fill(0);
      p5.noStroke();
      
      const circles = [
        [108.5, 150, 17], // Circle 1
        [206, 120, 12],   // Circle 2
        [202.5, 260, 15], // Circle 3
        [254.5, 250, 19], // Circle 4
        [261, 137, 22],   // Circle 5
        [216, 160, 12],   // Circle 6
        [126.5, 260, 13], // Circle 7
        [162, 230, 24],   // Circle 8
        [199, 200, 18],   // Circle 9
        [229.5, 215, 9]   // Circle 10
      ];
      
      for (let i = 0; i < circles.length; i++) {
        const circlePulse = logoElementScales[i + 14];
        p5.circle(circles[i][0], circles[i][1], circles[i][2] * circlePulse);
      }
      
      p5.pop();
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clearActiveSection: () => {
      activeSectionRef.current = null;
      // Close all open branches when navigating to home
      sectionsRef.current.forEach((section: any) => {
        section.isVisible = false;
        section.branchAnimProgress = 0;
      });
    }
  }));

  return (
    <div className={className} style={{ zIndex: 20, position: 'relative', pointerEvents: 'none' }}>
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );
});

export default MindMap; 