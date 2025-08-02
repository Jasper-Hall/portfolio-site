import MindMap from '@/components/MindMap';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <Navigation />
      <MindMap className="w-full h-screen" />
      </main>
  );
}
