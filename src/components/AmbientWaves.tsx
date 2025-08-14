import React, { useEffect, useRef } from 'react';

interface AmbientWavesProps {
  isActive: boolean;
  color?: string;
}

export const AmbientWaves: React.FC<AmbientWavesProps> = ({ isActive, color = '#007AFF' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Wave parameters
    const waves = [
      { amplitude: 30, frequency: 0.01, speed: 0.002, offset: 0 },
      { amplitude: 25, frequency: 0.015, speed: 0.003, offset: Math.PI / 3 },
      { amplitude: 20, frequency: 0.02, speed: 0.004, offset: Math.PI / 2 },
    ];

    let time = 0;

    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerY = canvas.height / 2;
      const centerX = canvas.width / 2;
      
      waves.forEach((wave) => {
        ctx.beginPath();
        
        // Create circular waves emanating from center
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
          const radius = 200 + wave.amplitude * Math.sin(wave.frequency * angle * 100 + time * wave.speed + wave.offset);
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        
        // Create gradient effect
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
        gradient.addColorStop(0, `${color}00`);
        gradient.addColorStop(0.5, `${color}15`);
        gradient.addColorStop(1, `${color}05`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add subtle stroke
        ctx.strokeStyle = `${color}10`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Additional flowing particles
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + time * 0.0005;
        const radius = 150 + 100 * Math.sin(time * 0.001 + i);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const size = 2 + Math.sin(time * 0.002 + i) * 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}20`;
        ctx.fill();
      }
      
      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, color]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};