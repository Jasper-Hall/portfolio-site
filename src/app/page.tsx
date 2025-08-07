import MindMap from '@/components/MindMap';
import Navigation from '@/components/Navigation';
import RippleShader from '@/components/RippleShader';
import ArchiveViewer from '@/components/ArchiveViewer';

export default function Home() {
  return (
    <main className="min-h-screen relative">
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
      <div className="relative z-10 min-h-screen pb-20 md:pb-24 lg:pb-28">
        <div className="p-2 md:p-4 lg:p-6 grid grid-cols-2 gap-4 grid-portrait-single xl:h-screen xl:overflow-hidden">
          
          {/* Left Panel - Mind Map */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden h-[500px] xl:h-auto">
            <RippleShader />
            <MindMap className="w-full h-full" />
          </div>
          
          {/* Right Panel - Archive Viewer */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden p-4 md:p-6 h-[600px] xl:h-auto">
            <ArchiveViewer className="w-full h-full" />
          </div>
          
        </div>
      </div>
      
      {/* Navigation */}
      <Navigation />
    </main>
  );
}
