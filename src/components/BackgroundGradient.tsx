import React from 'react';

interface BackgroundGradientProps {
  style?: 'default' | 'loveable';
}

const BackgroundGradient: React.FC<BackgroundGradientProps> = ({ style = 'default' }) => {
  if (style === 'loveable') {
    return (
      <>
        {/* Loveable-inspired dark gradient base */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black" />
        
        {/* Blooming red and purple accents */}
        <div className="fixed inset-0">
          {/* Large red bloom */}
          <div className="absolute top-1/4 right-1/3 w-[800px] h-[800px] bg-red-600 rounded-full blur-[180px] opacity-20 animate-pulse-slow" />
          
          {/* Medium red bloom */}
          <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-red-500 rounded-full blur-[150px] opacity-15 animate-pulse-slower" />
          
          {/* Rose accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600 rounded-full blur-[120px] opacity-10 animate-pulse-slow" />
          
          {/* Purple accent */}
          <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px] opacity-10 animate-pulse-slower" />
          
          {/* Pink accent */}
          <div className="absolute top-1/3 left-1/5 w-[350px] h-[350px] bg-pink-500 rounded-full blur-[90px] opacity-8 animate-pulse-slow" />
        </div>
        
        {/* Heavy noise texture overlay */}
        <div 
          className="fixed inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px'
          }}
        />
        
        {/* Subtle vignette */}
        <div className="fixed inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
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