import { getSession } from '@/lib/auth';
import { getApprovedCafes } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [session, cafes] = await Promise.all([
    getSession(),
    getApprovedCafes(),
  ]);

  return (
    <>
      <Navbar session={session} />
      <HomeClient cafes={cafes} session={session} />
      <Footer />
    </>
  );
}
