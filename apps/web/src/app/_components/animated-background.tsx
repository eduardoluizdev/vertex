'use client';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-vibe-bg">
      {/* Base subtle radial ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,179,0,0.04)_0%,transparent_100%)]" />
      
      {/* Premium Animated orbs using Vibe Primary and Surface layers for depth */}
      <div className="absolute top-[10%] -left-32 w-96 h-96 bg-vibe-primary/10 rounded-full blur-[120px] animate-blob" />
      <div className="absolute top-[20%] -right-32 w-[30rem] h-[30rem] bg-vibe-primary/5 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[50rem] h-[40rem] bg-vibe-surface/80 rounded-full blur-[140px] animate-blob animation-delay-4000" />
      
      {/* Minimal grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px),
                           linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
        }}
      />
      
      {/* Fade the grid subtly into the background edges for an infinite feel */}
      <div className="absolute inset-0 bg-vibe-bg [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_90%)] pointer-events-none" />
      
      {/* Base linear overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-vibe-bg via-transparent to-vibe-bg/40 pointer-events-none" />
    </div>
  );
}
