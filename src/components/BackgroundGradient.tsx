import React from 'react';

interface BackgroundGradientProps {
  style?: 'default' | 'loveable';
}

const BackgroundGradient: React.FC<BackgroundGradientProps> = ({ style = 'default' }) => {
  if (style === 'loveable') {
    return (
      <>
        {/* Loveable-inspired dark gradient base - always dark */}
        <div 
          className="fixed inset-0"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1c1c1c 75%, #050505 100%)'
          }}
        />
        
        {/* Blooming red and purple accents with stronger presence */}
        <div className="fixed inset-0">
          {/* Large red bloom */}
          <div 
            className="absolute top-1/4 right-1/3 w-[900px] h-[900px] rounded-full blur-[200px] animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, rgba(185, 28, 28, 0.3) 30%, rgba(153, 27, 27, 0.2) 60%, transparent 100%)'
            }}
          />
          
          {/* Medium red bloom */}
          <div 
            className="absolute bottom-1/3 left-1/4 w-[700px] h-[700px] rounded-full blur-[180px] animate-pulse-slower"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(220, 38, 38, 0.25) 40%, transparent 100%)'
            }}
          />
          
          {/* Rose accent */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, rgba(225, 29, 72, 0.2) 50%, transparent 100%)'
            }}
          />
          
          {/* Purple accent */}
          <div 
            className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-slower"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(126, 34, 206, 0.15) 50%, transparent 100%)'
            }}
          />
          
          {/* Deep red core */}
          <div 
            className="absolute top-3/4 right-1/2 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(127, 29, 29, 0.4) 0%, rgba(185, 28, 28, 0.2) 50%, transparent 100%)'
            }}
          />
        </div>
        
        {/* Heavy noise texture overlay */}
        <div 
          className="fixed inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' seed='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Strong vignette for dramatic effect */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
          }}
        />
      </>
    );
  }
  
  // Default gradient
  return (
    <>
      {/* Base gradient with subtle blooming red */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
      
      {/* Blooming red accent */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.02]">
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-red-500 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-rose-400 rounded-full blur-[100px] animate-pulse-slower" />
      </div>
      
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.015] dark:opacity-[0.02] mix-blend-multiply dark:mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px'
        }}
      />
    </>
  );
};

export default BackgroundGradient;