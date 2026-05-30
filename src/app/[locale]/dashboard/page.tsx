import { Navbar } from '@/components/Navbar';
import { NoteList } from '@/components/NoteList';
import { setRequestLocale } from 'next-intl/server';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NoteList />
      </main>
    </div>
  );
}
