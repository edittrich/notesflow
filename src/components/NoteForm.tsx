'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const noteSchema = (t: (key: string) => string) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, t('validationTitleRequired'))
      .max(120, t('validationTitleMaxLength')),
    description: z
      .string()
      .trim()
      .min(1, t('validationDescriptionRequired'))
      .max(5000, t('validationDescriptionMaxLength')),
  });

type NoteFormValues = {
  title: string;
  description: string;
};

interface NoteFormProps {
  initialValues?: NoteFormValues;
  onSubmit: (values: NoteFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function NoteForm({ initialValues, onSubmit, onCancel, loading }: NoteFormProps) {
  const t = useTranslations('NoteForm');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema(t as unknown as (key: string) => string)),
    defaultValues: initialValues || {
      title: '',
      description: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t('fieldTitle')}</Label>
        <Input
          id="title"
          placeholder={t('fieldTitlePlaceholder')}
          {...register('title')}
          disabled={loading}
          autoFocus
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('fieldDescription')}</Label>
        <textarea
          id="description"
          placeholder={t('fieldDescriptionPlaceholder')}
          rows={6}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
          disabled={loading}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="cursor-pointer"
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? t('saving') : initialValues ? t('submitEdit') : t('submitCreate')}
        </Button>
      </div>
    </form>
  );
}
