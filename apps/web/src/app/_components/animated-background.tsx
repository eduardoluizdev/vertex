'use client';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-emerald-950" />
      
      {/* Animated orbs */}
      <div className="absolute top-0 -left-48 w-96 h-96 bg-violet-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-0 -right-48 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-emerald-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-violet-500/5" />
    </div>
  );
}
