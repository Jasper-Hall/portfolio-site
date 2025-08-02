'use client';

import React from "react";
import { type Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import p5 from "p5";

interface MindMapProps {
  className?: string;
}

const MindMap: React.FC<MindMapProps> = ({ className = '' }) => {
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

    p5.preload = () => {
      customFont = p5.loadFont("/JetBrainsMono-Medium.ttf");
      blueCircle = p5.loadImage("/blueCircle.png");
      jaeceLogo = p5.loadImage("/logos/jaeceYtlogonotext.png");
      xtsuiLogo = p5.loadImage("/logos/portfoliologo1.png");
      purgeFilesLogo = p5.loadImage("/logos/purgeFileslogodraft1.png");
    };

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noFill();
      p5.strokeWeight(1);

      centerX = p5.width / 2;
      radiusX = p5.width * 0.3;
      radiusY = (p5.height - 64) * 0.33; // Account for navigation bar height
      curveHeight = 70 + 64; // Add navigation bar height

      // Initialize logo element scales for individual pulsing (22 elements in the SVG)
      logoElementScales = Array(22).fill(1);
      
      // Initialize signal progress for each branch
      signalProgress = Array(sections.length).fill(0);

      initSections();
      computeScalingFactorAndAdjustDistances();
    };

    p5.draw = () => {
      p5.background(220);
      
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
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      centerX = p5.width / 2;
      radiusX = p5.width * 0.3;
      radiusY = (p5.height - 64) * 0.33; // Account for navigation bar height
      curveHeight = 70 + 64; // Add navigation bar height
      computeScalingFactorAndAdjustDistances();
    };

    p5.mouseClicked = () => {
      if (p5.touches.length === 0) {
        sections.forEach((section, index) => {
          const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
          const movement = p5.sin(p5.frameCount * 0.02 + index) * 3;
          const x = centerX + radiusX * p5.cos(angle) + movement;
          const y = curveHeight + 50 + radiusY * p5.sin(angle) + movement + 95; // Match the grey circle position

          if (p5.dist(p5.mouseX, p5.mouseY, x, y) < 40) {
            section.isVisible = !section.isVisible;
            section.branchAnimProgress = section.isVisible ? 0 : 1;
          }
        });
      }
    };

    p5.touchStarted = () => {
      if (p5.touches.length > 0) {
        sections.forEach((section, index) => {
          const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
          const movement = p5.sin(p5.frameCount * 0.02 + index) * 3;
          const x = centerX + radiusX * p5.cos(angle) + movement;
          const y = curveHeight + 50 + radiusY * p5.sin(angle) + movement + 95; // Match the grey circle position

          if (p5.dist(p5.mouseX, p5.mouseY, x, y) < 40) {
            section.isVisible = !section.isVisible;
            section.branchAnimProgress = section.isVisible ? 0 : 1;
          }
        });
        return false;
      }
    };

    function initSections() {
      sections = [
        {
          name: "purgeFiles",
          logo: purgeFilesLogo,
          branches: ["archives", "youtube"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: [p5.PI / 27, p5.PI / 1.5],
          distances: [-80, 50],
        },
        {
          name: "jæce",
          logo: jaeceLogo,
          branches: ["live/bookings", "releases", "links"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: [p5.PI / 30, p5.PI / 1.2, p5.PI / 1.7],
          distances: [-50, 80, 70],
        },
        {
          name: "xtsui",
          logo: xtsuiLogo,
          branches: ["xtsuimart", "archives"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: [p5.PI / 4, p5.PI / 1.5],
          distances: [80, 66],
        },
        {
          name: "photography",
          logo: null,
          branches: ["portraits", "landscapes", "events"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: [p5.PI / 30, p5.PI / 3.7, p5.PI / 2.5],
          distances: [70, 70, 90],
        },
        {
          name: "technology",
          logo: null,
          branches: ["web", "mobile", "ai"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: [p5.PI / 30, p5.PI / 4.5, (3 * p5.PI) / 8],
          distances: [50, 70, 100],
        },
        {
          name: "art",
          logo: null,
          branches: ["digital", "traditional", "mixed"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: [p5.PI / 30, p5.PI / 4.5, p5.PI / 1.9],
          distances: [50, 70, 120],
        },
        {
          name: "design",
          logo: null,
          branches: ["graphic", "ui/ux", "branding"],
          isVisible: false,
          branchAnimProgress: 0,
          angles: [p5.PI / 30, p5.PI / 3.7, p5.PI / 2.5],
          distances: [70, 70, 90],
        },
      ];
    }

    function computeScalingFactorAndAdjustDistances() {
      const scalingFactors: number[] = [];
      const margin = 20;

      sections.forEach((section, index) => {
        const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
        const x = centerX + radiusX * p5.cos(angle);

        if (section.branches.length > 0 && section.angles && section.distances) {
          section.adjustedDistances = [];

          section.branches.forEach((branch: string, idx: number) => {
            const distance = section.distances![idx];
            const branchAngle = section.angles![idx];
            const subX = x + distance * p5.cos(branchAngle);

            p5.textFont(customFont, 8);
            const textW = p5.textWidth(branch) + 10;
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
      p5.textFont(customFont, 12);

      const logoX = centerX;
      const logoY = 120; // Back to original height
      const logoSize = 80; // Increased from 60 to 80

      // Draw animated central logo with individual element pulsing
      drawAnimatedLogo(logoX, logoY, logoSize);

      sections.forEach((section, index) => {
        const angle = p5.PI - (p5.PI / (sections.length - 1)) * index;
        const movement = p5.sin(p5.frameCount * 0.02 + index) * 3;
        const x = centerX + radiusX * p5.cos(angle) + movement;
        const y = curveHeight + 80 + radiusY * p5.sin(angle) + movement;

        // Draw connection line
        p5.strokeWeight(0.7);
        p5.stroke(0);
        p5.noFill();
        p5.beginShape();
        // The logo is centered at logoY, so the bottom edge is logoY + logoSize/2
        const logoBottomY = 120 + 40; // logoY + logoSize/2 (updated for new size)
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
          p5.circle(curveX, curveY, 10); // Increased from 6 to 10
          
          // Add a glow effect
          p5.fill(255, 0, 0, 100); // Brighter glow
          p5.circle(curveX, curveY, 20); // Increased from 12 to 20
        }

        p5.imageMode(p5.CENTER);
        p5.image(blueCircle, x, y, 30, 22); // Increased from 20x15 to 30x22

        if (section.logo) {
          p5.image(section.logo, x, y + 40, 60, 60); // Increased from 50x50 to 60x60
        }

        p5.fill(0);
        p5.noStroke();
        p5.textFont(customFont, 14); // Increased from 12 to 14
        p5.text(section.name, x, y + 75); // Moved down from y + 60 to y + 75

        if (section.branches.length > 0) {
          p5.drawingContext.filter = "blur(3px)";
          p5.strokeWeight(0.5);
          p5.stroke(0, 0, 128 * p5.sin(p5.millis() / 1000));
          p5.fill(200, 200, 150, 200 + 128 * p5.sin(p5.millis() / 1000));
          p5.ellipse(x, y + 95, 8, 8); // Moved down from y + 80 to y + 95
          p5.drawingContext.filter = "none";
        }

        if (section.isVisible || section.branchAnimProgress > 0) {
          animateSubBranches(x, y + 100, section);
        }
      });
    }

    function animateSubBranches(x: number, y: number, section: typeof sections[0]) {
      if (!section.adjustedDistances || !section.angles) return;

      section.branches.forEach((branch: string, idx: number) => {
        const distance = section.adjustedDistances![idx];
        const angle = section.angles![idx];
        const subX = x + section.branchAnimProgress * distance * p5.cos(angle);
        const subY = y + section.branchAnimProgress * distance * p5.sin(angle);

        p5.textFont(customFont, 8);
        const textW = p5.textWidth(branch) + 10;
        const textH = 20;
        const alpha = p5.map(Math.abs(section.branchAnimProgress), 0, 1, 0, 255);

        // Draw connection line
        p5.stroke(0, alpha);
        p5.strokeWeight(0.7);
        p5.noFill();
        p5.beginShape();
        p5.vertex(x, y);
        p5.bezierVertex(
          x,
          subY + (y - subY) / 2,
          subX,
          y + (subY - y) / 2,
          subX,
          subY
        );
        p5.endShape();

        if (section.branchAnimProgress >= 1) {
          if (p5.dist(p5.mouseX, p5.mouseY, subX, subY) < textW / 2) {
            p5.fill(220, 220, 255, alpha);
            p5.cursor(p5.HAND);
          } else {
            p5.fill(255, alpha);
            p5.cursor(p5.ARROW);
          }
        } else {
          p5.fill(255, alpha);
          p5.cursor(p5.ARROW);
        }

        p5.rect(subX - textW / 2, subY - textH / 2, textW, textH, 10);

        p5.fill(0, alpha);
        p5.noStroke();
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(branch, subX, subY);
      });

      // Update animation progress
      if (section.isVisible && section.branchAnimProgress < 1) {
        section.branchAnimProgress += 0.07;
      } else if (!section.isVisible && section.branchAnimProgress > 0) {
        section.branchAnimProgress -= 0.07;
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

  return (
    <div className={className}>
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );
};

export default MindMap; 