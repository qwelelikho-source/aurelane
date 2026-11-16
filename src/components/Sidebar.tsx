'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, CreditCard, ClipboardList, Target, LogOut, BarChart3 } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Budgets', href: '/dashboard/budgets', icon: ClipboardList },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Charts', href: '/dashboard/charts', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut({ redirectTo: '/login' });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#121B2D] min-h-screen border-r border-[#243049]">
        <div className="p-6 overflow-hidden">
          <h1 className="text-2xl font-serif text-[#C9A24B] whitespace-nowrap">Aurelane</h1>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-6 py-3 rounded-l border-l-2 transition-all overflow-hidden ${
                      isActive
                        ? 'bg-[#0B1220]/50 border-[#C9A24B] text-[#C9A24B]'
                        : 'border-transparent text-[#8B95A8] hover:text-[#E8E4DA] hover:bg-[#0B1220]/30'
                    }`}
                    aria-label={item.name}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[14px] whitespace-nowrap">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-[#243049]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-6 py-3 text-[#8B95A8] hover:text-[#E8E4DA] transition-colors overflow-hidden"
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-[14px] whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#121B2D] border-t border-[#243049] z-50">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-4 py-2 text-sm transition-colors ${
                  isActive ? 'text-[#C9A24B]' : 'text-[#8B95A8]'
                }`}
                aria-label={item.name}
              >
                <Icon className={`w-6 h-6 mb-1 flex-shrink-0 ${isActive ? 'text-[#C9A24B]' : 'text-[#8B95A8]'}`} />
                <span className="text-xs whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
