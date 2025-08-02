import MindMap from '@/components/MindMap';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Forest Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/masaaki-komori-hFH1bK2CYSE-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Glassmorphic Panel */}
      <div className="relative z-10 min-h-screen">
        <div className="absolute inset-2 md:inset-4 lg:inset-6 bottom-20 md:bottom-24 lg:bottom-28 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <MindMap className="w-full h-screen" />
        </div>
      </div>
      
      {/* Navigation */}
      <Navigation />
    </main>
  );
}
