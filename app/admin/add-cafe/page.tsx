import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AddCafeClient from './AddCafeClient';

export default async function AddCafePage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  return (
    <>
      <Navbar session={session} />
      <AddCafeClient />
      <Footer />
    </>
  );
}
