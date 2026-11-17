import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PrivacyToggle } from '@/components/PrivacyToggle';
import { ChatPanel } from '@/components/ChatPanel';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <header className="bg-[#121B2D] border-b border-[#243049] px-8 py-4 flex items-center justify-between">
          <PrivacyToggle />
        </header>
        <div className="p-8 pb-24 md:pb-8">{children}</div>
      </main>
      <ChatPanel />
    </div>
  );
}
