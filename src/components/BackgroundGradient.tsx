import React from 'react';

const BackgroundGradient: React.FC = () => {
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