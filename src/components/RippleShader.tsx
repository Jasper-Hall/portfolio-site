'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface RippleShaderProps {
  className?: string;
}

const RippleShader: React.FC<RippleShaderProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      preserveDrawingBuffer: true 
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const prevMouse = new THREE.Vector2(0, 0);
    let frame = 0;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const options = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    let rta = new THREE.WebGLRenderTarget(width, height, options);
    let rtb = new THREE.WebGLRenderTarget(width, height, options);

    // Create a canvas to capture the glassmorphic panel background
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: true });

    if (ctx) {
      // Draw the glassmorphic panel background (simple rectangle)
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // bg-white/10 equivalent
      ctx.fillRect(0, 0, width, height);
    }

    const panelTexture = new THREE.CanvasTexture(canvas);
    panelTexture.minFilter = THREE.LinearFilter;
    panelTexture.magFilter = THREE.LinearFilter;
    panelTexture.format = THREE.RGBAFormat;

    // Simulation Shader - calculates the fluid dynamics
    const simulationVertexShader = `
      varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const simulationFragmentShader = `
      uniform sampler2D textureA;
      uniform vec2 mouse;
      uniform vec2 prevMouse;
      uniform vec2 resolution;
      uniform float time;
      uniform int frame;
      varying vec2 vUv;
    
    void main() {
        vec2 uv = vUv;
        if (frame == 0) {
          gl_FragColor = vec4(0.0);
          return;
        }

        vec4 data = texture2D(textureA, uv);
        float pressure = data.x;
        float pVel = data.y;
        vec2 velocity = data.zw;

        // Viscous liquid behavior - gradual settling
        float viscosity = 0.95; // Controls how quickly the liquid settles (slower fade)
        float surfaceTension = 0.99; // Controls how much the surface wants to flatten (slower fade)
        
        // Apply viscosity to velocity (creates resistance)
        velocity *= viscosity;
        
        // Apply surface tension - pressure gradually equalizes
        pressure *= surfaceTension;
        pVel *= viscosity;
        
        // Add subtle diffusion to simulate liquid spreading
        float diffusion = 0.001;
        vec2 neighborPressure = vec2(0.0);
        
        // Sample neighboring pixels for diffusion
        for (int i = -1; i <= 1; i++) {
          for (int j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) continue;
            vec2 offset = vec2(float(i), float(j)) / resolution;
            vec4 neighborData = texture2D(textureA, uv + offset);
            neighborPressure += neighborData.zw * diffusion;
          }
        }
        
        // Apply diffusion to velocity
        velocity += neighborPressure;
        
        // Dampen very small movements (prevents infinite oscillation)
        if (length(velocity) < 0.0001) {
          velocity = vec2(0.0);
        }
        
        if (abs(pressure) < 0.001) {
          pressure = 0.0;
          pVel = 0.0;
        }

        // Only add pressure if the mouse has moved a minimum distance
        vec2 mouseUV = mouse / resolution;
        vec2 prevMouseUV = prevMouse / resolution;
        float minMove = 0.01;
        float pathLength = distance(mouseUV, prevMouseUV);

        if (mouse.x > 0.0 && prevMouse.x > 0.0 && pathLength > minMove) {
          float trailWidth = 0.04;
          for (int i = 0; i < 4; i++) {
            float t = float(i) / 3.0;
            vec2 trailPoint = mix(prevMouseUV, mouseUV, t);
            float dist = distance(uv, trailPoint);
            if (dist <= trailWidth) {
              float intensity = 1.0 - smoothstep(0.0, trailWidth, dist);
              intensity *= 1.0 - t * 0.7;
              pressure += intensity * 0.5; // Increased prominence
              vec2 flowDir = normalize(mouseUV - prevMouseUV) * intensity * 0.05;
              velocity += flowDir;
            }
          }
        }

        gl_FragColor = vec4(pressure, pVel, velocity);
      }
    `;

    // Render Shader - applies distortion to panel background with specular highlights
    const renderVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const renderFragmentShader = `
      uniform sampler2D textureA;
      uniform sampler2D textureB;
      varying vec2 vUv;

      void main() {
        vec4 data = texture2D(textureA, vUv);
        
        // Apply more prominent distortion to the panel texture
        vec2 distortion = 0.2 * data.zw;
        vec4 panelColor = texture2D(textureB, vUv + distortion);
        
        // Multi-directional specular highlights for smear effect
        vec3 normal = normalize(vec3(-data.z * 1.0, 0.5, -data.w * 1.0));
        vec3 lightDir1 = normalize(vec3(-3.0, 10.0, 3.0));
        vec3 lightDir2 = normalize(vec3(3.0, 10.0, 3.0)); // Second light source
        vec3 lightDir3 = normalize(vec3(0.0, -10.0, 3.0)); // Third light source from bottom
        float specular1 = pow(max(0.0, dot(normal, lightDir1)), 35.0) * 0.4;
        float specular2 = pow(max(0.0, dot(normal, lightDir2)), 35.0) * 0.4;
        float specular3 = pow(max(0.0, dot(normal, lightDir3)), 35.0) * 0.4;
        float specular = specular1 + specular2 + specular3; // Combine all three highlights
        
        // Combine panel color with directional specular highlights
        vec4 finalColor = panelColor + vec4(specular * 0.6);
        
        // Add more ripple visibility
        float rippleVisibility = length(distortion) * 0.7;
        finalColor.rgb += rippleVisibility * vec3(0.1, 0.15, 0.2);
        
        gl_FragColor = finalColor;
      }
    `;

    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        mouse: { value: mouse },
        prevMouse: { value: prevMouse },
        resolution: { value: new THREE.Vector2(width, height) },
        time: { value: 0 },
        frame: { value: 0 },
      },
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
    });

    const renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: panelTexture },
      },
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      transparent: true,
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const simQuad = new THREE.Mesh(plane, simMaterial);
    simScene.add(simQuad);
    const renderQuad = new THREE.Mesh(plane, renderMaterial);
    scene.add(renderQuad);

    // Event handlers
    const handleResize = () => {
      const newWidth = container.offsetWidth;
      const newHeight = container.offsetHeight;
      renderer.setSize(newWidth, newHeight);
      rta.setSize(newWidth, newHeight);
      rtb.setSize(newWidth, newHeight);
      simMaterial.uniforms.resolution.value.set(newWidth, newHeight);

      // Update panel texture
      canvas.width = newWidth;
      canvas.height = newHeight;
      if (ctx) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(0, 0, newWidth, newHeight);
      }
      panelTexture.needsUpdate = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      // Store previous mouse position before updating current
      prevMouse.copy(mouse);
      mouse.x = e.clientX - rect.left;
      mouse.y = rect.height - (e.clientY - rect.top); // Flip Y coordinate
    };

    const handleMouseLeave = () => {
      mouse.set(0, 0);
      prevMouse.set(0, 0);
    };

    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      // Update timing uniforms
      simMaterial.uniforms.frame.value = frame++;
      simMaterial.uniforms.time.value = performance.now() / 1000;

      // Simulation pass
      simMaterial.uniforms.textureA.value = rta.texture;
      renderer.setRenderTarget(rtb);
      renderer.render(simScene, camera);
      
      // Render pass
      renderMaterial.uniforms.textureA.value = rtb.texture;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      // Swap render targets
      const temp = rta;
      rta = rtb;
      rtb = temp;

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      rta.dispose();
      rtb.dispose();
      panelTexture.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`absolute top-2 left-2 right-2 bottom-20 md:top-4 md:left-4 md:right-4 md:bottom-20 lg:top-6 lg:left-6 lg:right-6 lg:bottom-20 xl:top-8 xl:left-8 xl:right-8 xl:bottom-20 rounded-3xl border border-white/20 overflow-hidden ${className}`}
      style={{
        zIndex: 15,
        pointerEvents: 'auto',
        mixBlendMode: 'normal',
        opacity: 1,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    />
  );
};

export default RippleShader; 