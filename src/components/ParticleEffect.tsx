import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}

interface ParticleEffectProps {
  trigger: boolean;
  type: 'confetti' | 'firework' | 'checkmark';
  x?: number;
  y?: number;
  onComplete?: () => void;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({ 
  trigger, 
  type, 
  x = window.innerWidth / 2, 
  y = window.innerHeight / 2,
  onComplete 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#EAB308'];
    const particleCount = type === 'confetti' ? 30 : type === 'firework' ? 50 : 20;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const velocity = type === 'firework' ? 8 + Math.random() * 4 : 3 + Math.random() * 3;
      
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: type === 'firework' ? Math.sin(angle) * velocity - 2 : Math.sin(angle) * velocity - Math.random() * 2,
        size: type === 'confetti' ? 8 + Math.random() * 4 : 4 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        rotation: Math.random() * 360,
      });
    }

    setParticles(newParticles);

    // Animate particles
    const animationInterval = setInterval(() => {
      setParticles(prev => {
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.3, // gravity
          opacity: particle.opacity - 0.02,
          rotation: particle.rotation + particle.vx * 2,
        })).filter(p => p.opacity > 0);

        if (updated.length === 0) {
          clearInterval(animationInterval);
          onComplete?.();
        }

        return updated;
      });
    }, 16);

    return () => clearInterval(animationInterval);
  }, [trigger, type, x, y, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
          }}
        >
          {type === 'confetti' ? (
            <div
              className="rounded-sm"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size * 0.6}px`,
                backgroundColor: particle.color,
              }}
            />
          ) : type === 'checkmark' ? (
            <svg
              width={particle.size * 2}
              height={particle.size * 2}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke={particle.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div
              className="rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};