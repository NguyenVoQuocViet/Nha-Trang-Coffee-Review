import { getSession } from '@/lib/auth';
import { getApprovedCafes } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MapClient from './MapClient';

export default async function MapPage() {
  const [session, cafes] = await Promise.all([
    getSession(),
    getApprovedCafes(),
  ]);

  return (
    <>
      <Navbar session={session} />
      <MapClient cafes={cafes} />
      <Footer />
    </>
  );
}
