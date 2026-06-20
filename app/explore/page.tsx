import { getSession } from '@/lib/auth';
import { getApprovedCafes } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExploreClient from './ExploreClient';

export default async function ExplorePage() {
  const [session, cafes] = await Promise.all([
    getSession(),
    getApprovedCafes(),
  ]);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <Navbar session={session} />
      <ExploreClient cafes={cafes} />
      <Footer />
    </div>
  );
}
