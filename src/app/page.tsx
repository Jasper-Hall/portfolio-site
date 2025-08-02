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
        <div className="absolute inset-4 md:inset-8 lg:inset-12 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <MindMap className="w-full h-screen" />
        </div>
      </div>
      
      {/* Navigation */}
      <Navigation />
    </main>
  );
}
