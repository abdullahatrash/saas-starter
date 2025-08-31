'use client';

import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Palette, Coins, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreditsDisplay() {
  const { data: dashboard } = useSWR('/api/user/dashboard', fetcher);
  
  if (!dashboard) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Credits Display */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
        <Coins className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-medium text-yellow-400">
          {dashboard.credits || 0} Credits
        </span>
      </div>
      
      {/* Plan Badge */}
      {(dashboard.subscription?.isActive || dashboard.subscription?.hasCredits) && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          dashboard.subscription?.isActive 
            ? 'bg-purple-500/10 border-purple-500/20' 
            : 'bg-green-500/10 border-green-500/20'
        }`}>
          <Crown className={`h-4 w-4 ${
            dashboard.subscription?.isActive ? 'text-purple-400' : 'text-green-400'
          }`} />
          <span className={`text-sm font-medium ${
            dashboard.subscription?.isActive ? 'text-purple-400' : 'text-green-400'
          }`}>
            {dashboard.subscription?.planType === 'subscription' 
              ? dashboard.subscription.type 
              : 'Pay As You Go'}
          </span>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-300 hover:text-yellow-400"
        >
          Pricing
        </Link>
        <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-yellow-400/20">
          <Avatar className="cursor-pointer size-9">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback className="bg-yellow-400 text-black">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/studio" className="flex w-full items-center">
            <Palette className="mr-2 h-4 w-4" />
            <span>Tattoo Studio</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-yellow-400/20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-black text-yellow-400 uppercase tracking-tight">
            TattooAI
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9 w-9 bg-yellow-400/20 rounded-full animate-pulse" />}>
            <CreditsDisplay />
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
