import MindMap from '@/components/MindMap';
import Navigation from '@/components/Navigation';
import RippleShader from '@/components/RippleShader';

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
      
      {/* Panel Container - RippleShader will handle the glassmorphic background */}
      <div className="relative z-10 min-h-screen">
        <RippleShader />
        <MindMap className="w-full h-screen" />
      </div>
      
      {/* Navigation */}
      <Navigation />
    </main>
  );
}
