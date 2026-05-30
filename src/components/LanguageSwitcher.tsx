'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const toggleLocale = () => {
    const nextLocale = currentLocale === 'en' ? 'de' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-3 h-9 cursor-pointer"
      aria-label="Switch Language"
      id="language-switcher"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-semibold uppercase">{currentLocale === 'en' ? 'DE' : 'EN'}</span>
    </Button>
  );
}
