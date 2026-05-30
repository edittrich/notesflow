'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const signupSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('validationEmailRequired'))
      .email(t('validationEmailInvalid')),
    password: z
      .string()
      .min(1, t('validationPasswordRequired'))
      .min(6, t('validationPasswordTooShort')),
  });

type SignupFormValues = {
  email: string;
  password: string;
};

export default function SignupPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema(t as unknown as (key: string) => string)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    setAuthError(null);
    setSuccessMessage(null);
    const supabase = createClient();

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
      } else if (signUpData.session) {
        // Logged in immediately (auto-confirm enabled)
        router.refresh();
        router.push('/dashboard');
      } else {
        // Verification email sent
        setSuccessMessage(t('successVerification'));
        setLoading(false);
      }
    } catch {
      setAuthError(t('errorGeneric'));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden bg-background">
      {/* Background Premium Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
            NotesFlow
          </h1>
        </div>

        <Card className="border border-border shadow-2xl backdrop-blur-md bg-card/90">
          <CardHeader>
            <CardTitle>{t('signUpTitle')}</CardTitle>
            <CardDescription>{t('signUpDesc')}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {authError && (
                <div className="p-3 text-sm rounded bg-destructive/15 text-destructive border border-destructive/25">
                  {authError}
                </div>
              )}
              {successMessage && (
                <div className="p-3 text-sm rounded bg-green-500/15 text-green-500 border border-green-500/25">
                  {successMessage}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  {...register('email')}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...register('password')}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? t('signingUp') : t('signUpButton')}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                {t('haveAccount')}{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  {t('signInLink')}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
