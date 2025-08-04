'use client';

import React, { useRef, useEffect, useState } from 'react';

interface RippleShaderProps {
  className?: string;
}

interface WebGLProgramWithUniforms extends WebGLProgram {
  uniforms: {
    resolution: WebGLUniformLocation | null;
    mouse: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    mouseDown: WebGLUniformLocation | null;
  };
}

const RippleShader: React.FC<RippleShaderProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgramWithUniforms | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Vertex shader - positions the vertices
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // Fragment shader - creates the ripple effect
  const fragmentShaderSource = `
    precision mediump float;
    
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_mouseDown;
    
    varying vec2 v_texCoord;
    
    void main() {
      vec2 uv = v_texCoord;
      vec2 mouse = u_mouse / u_resolution;
      
      // Calculate distance from mouse
      float dist = distance(uv, mouse);
      
      // Create ripple effect
      float ripple = sin(dist * 30.0 - u_time * 4.0) * exp(-dist * 8.0) * 0.08;
      
      // Add extra ripple when mouse is down
      float clickRipple = 0.0;
      if (u_mouseDown > 0.0) {
        clickRipple = sin(dist * 50.0 - u_time * 8.0) * exp(-dist * 12.0) * 0.15;
      }
      
      // Combine ripples
      float totalRipple = ripple + clickRipple;
      
      // Apply distortion
      vec2 distorted = uv + totalRipple * normalize(uv - mouse);
      
      // Sample the background (we'll use a simple color for now)
      vec3 background = vec3(0.1, 0.1, 0.1); // Dark grey to match glassmorphic panel
      
      // Add some transparency based on ripple intensity
      float alpha = 0.1 + totalRipple * 0.3;
      
      gl_FragColor = vec4(background, alpha);
    }
  `;

  // Initialize WebGL
  const initWebGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader) as WebGLProgramWithUniforms;
    programRef.current = program;

    // Set up geometry (full-screen quad)
    const positions = new Float32Array([
      -1, -1, 0, 0,  // bottom left
       1, -1, 1, 0,  // bottom right
      -1,  1, 0, 1,  // top left
       1,  1, 1, 1   // top right
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Set up attributes
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // Set up uniforms
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const mouseDownLocation = gl.getUniformLocation(program, 'u_mouseDown');

    // Store uniform locations
    program.uniforms = {
      resolution: resolutionLocation,
      mouse: mouseLocation,
      time: timeLocation,
      mouseDown: mouseDownLocation
    };

    // Set initial resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  };

  // Create shader helper
  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    
    return shader;
  };

  // Create program helper
  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create program');
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Program linking failed');
    }
    
    return program;
  };

  // Render function
  const render = (time: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    
    if (!gl || !program || !canvas) return;

    // Clear canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use shader program
    gl.useProgram(program);

    // Update uniforms
    const uniforms = program.uniforms;
    gl.uniform2f(uniforms.mouse, mousePosition.x, mousePosition.y);
    gl.uniform1f(uniforms.time, time * 0.001); // Convert to seconds
    gl.uniform1f(uniforms.mouseDown, isMouseDown ? 1.0 : 0.0);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Continue animation
    requestAnimationFrame(render);
  };

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Initialize and start rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      const gl = glRef.current;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        const program = programRef.current;
        if (program) {
          const uniforms = program.uniforms;
          gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        }
      }
    };

    // Initialize WebGL
    initWebGL();
    resizeCanvas();

    // Start rendering
    requestAnimationFrame(render);

    // Handle resize
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        zIndex: 5, // Above the glassmorphic panel but below the mind map
        mixBlendMode: 'overlay'
      }}
    />
  );
};

export default RippleShader; 