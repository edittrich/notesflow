'use client';

import { Note } from '@/hooks/useNotes';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const t = useTranslations('NoteCard');
  const locale = useLocale();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const isModified = Math.abs(new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime()) > 1000;

  return (
    <Card className="flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300 border-border bg-card/40 backdrop-blur-xs min-h-[220px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold tracking-tight line-clamp-2 break-words">
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words line-clamp-5">
          {note.description}
        </p>
      </CardContent>
      <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex flex-col gap-0.5 max-w-[70%]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            {t('created')}: {formatDate(note.createdAt)}
          </span>
          {isModified && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {t('updated')}: {formatDate(note.updatedAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(note)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label={t('edit')}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note.id)}
            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10 cursor-pointer"
            aria-label={t('delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
