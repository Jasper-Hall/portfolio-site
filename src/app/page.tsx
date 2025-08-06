import MindMap from '@/components/MindMap';
import Navigation from '@/components/Navigation';
import RippleShader from '@/components/RippleShader';
import ArchiveViewer from '@/components/ArchiveViewer';

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
      
      {/* Main Content Grid */}
      <div className="relative z-10 min-h-screen">
        <div className="absolute inset-2 md:inset-4 lg:inset-6 bottom-20 md:bottom-24 lg:bottom-28 grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          
          {/* Left Panel - Mind Map */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden min-h-[500px] xl:min-h-auto">
            <RippleShader />
            <MindMap className="w-full h-full" />
          </div>
          
          {/* Right Panel - Archive Viewer */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden p-4 md:p-6 min-h-[600px] xl:min-h-auto">
            <ArchiveViewer className="w-full h-full" />
          </div>
          
        </div>
      </div>
      
      {/* Navigation */}
      <Navigation />
    </main>
  );
}
