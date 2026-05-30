'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, StickyNote } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('Navbar');
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-45 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <StickyNote className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
            {t('title')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label={t('signOut')}
            id="sign-out-btn"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-semibold">{t('signOut')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
