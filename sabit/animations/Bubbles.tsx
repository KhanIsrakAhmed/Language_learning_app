
import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

export const Bubbles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let bubbles: Bubble[] = [];
    let animationFrameId: number;
    
    // Make canvas full width and height
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Colors for bubbles
    const colors = [
      'rgba(155, 135, 245, 0.2)', // primary purple (lower opacity)
      'rgba(126, 105, 171, 0.2)', // secondary purple (lower opacity)
      'rgba(110, 89, 165, 0.2)',  // tertiary purple (lower opacity)
      'rgba(214, 188, 250, 0.2)', // light purple (lower opacity)
      'rgba(211, 228, 253, 0.2)', // soft blue (lower opacity)
    ];
    
    // Initialize bubbles
    const initBubbles = () => {
      bubbles = [];
      // Reduced number of bubbles - only 1 per 80px of width instead of 1 per 30px
      const bubbleCount = Math.floor(window.innerWidth / 80); 
      
      for (let i = 0; i < bubbleCount; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 100,
          size: Math.random() * 50 + 10,
          // Slower horizontal movement
          speedX: Math.random() * 0.8 - 0.4,
          // Slower vertical movement
          speedY: -Math.random() * 0.8 - 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.3 + 0.1 // Lower opacity
        });
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      bubbles.forEach((bubble, index) => {
        // Move bubbles
        bubble.x += bubble.speedX;
        bubble.y += bubble.speedY;
        
        // Draw bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        
        // Add highlight effect
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
        ctx.fill();
        
        // If bubble is out of canvas, reset it
        if (bubble.y < -bubble.size * 2) {
          bubbles[index] = {
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 100,
            size: Math.random() * 50 + 10,
            speedX: Math.random() * 0.8 - 0.4, // Slower horizontal movement
            speedY: -Math.random() * 0.8 - 0.2, // Slower vertical movement
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.3 + 0.1 // Lower opacity
          };
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    initBubbles();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
