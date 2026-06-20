import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getCafeById } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EditCafeClient from './EditCafeClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCafePage({ params }: Props) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  const { id } = await params;
  const cafe = await getCafeById(id);
  if (!cafe) notFound();

  return (
    <>
      <Navbar session={session} />
      <EditCafeClient cafe={cafe} />
      <Footer />
    </>
  );
}
