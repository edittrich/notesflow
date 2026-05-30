'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, Note } from '@/hooks/useNotes';
import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, Plus, Filter, Loader2, StickyNote, AlertCircle } from 'lucide-react';

export function NoteList() {
  const tDashboard = useTranslations('Dashboard');
  const tSorting = useTranslations('Sorting');
  const tDelete = useTranslations('DeleteDialog');
  const tForm = useTranslations('NoteForm');

  const [sortBy, setSortBy] = useState('NEWEST_FIRST');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: notes, isLoading, isError, refetch } = useNotes(sortBy);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  // Filter notes locally by search query
  const filteredNotes = notes?.filter((note) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      note.title.toLowerCase().includes(query) ||
      note.description.toLowerCase().includes(query)
    );
  }) || [];

  const handleCreateSubmit = (values: { title: string; description: string }) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setCreateOpen(false);
      },
    });
  };

  const handleEditSubmit = (values: { title: string; description: string }) => {
    if (!editNote) return;
    updateMutation.mutate(
      { id: editNote.id, ...values },
      {
        onSuccess: () => {
          setEditNote(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          setDeleteId(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">{tDashboard('loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <p className="font-semibold text-lg">{tDashboard('errorLoading')}</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="cursor-pointer">
          {tDashboard('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tDashboard('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 border border-border rounded-md px-3 h-10 bg-card/45 backdrop-blur-xs text-muted-foreground text-sm shrink-0 select-none">
            <Filter className="h-3.5 w-3.5" />
            <span>{tSorting('sortBy')}:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer shrink-0"
            id="sort-select"
          >
            <option value="NEWEST_FIRST">{tSorting('NEWEST_FIRST')}</option>
            <option value="OLDEST_FIRST">{tSorting('OLDEST_FIRST')}</option>
            <option value="TITLE_AZ">{tSorting('TITLE_AZ')}</option>
            <option value="TITLE_ZA">{tSorting('TITLE_ZA')}</option>
          </select>
          <Button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 h-10 cursor-pointer shrink-0 font-medium"
            id="new-note-btn"
          >
            <Plus className="h-4 w-4" />
            <span>{tDashboard('newNoteButton')}</span>
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-12 text-center min-h-[300px] bg-card/10 backdrop-blur-xs">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <StickyNote className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">{tDashboard('noNotesTitle')}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {tDashboard('noNotesDesc')}
          </p>
          <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            {tDashboard('newNoteButton')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setEditNote}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {/* Create Note Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent onClose={() => setCreateOpen(false)}>
          <DialogHeader>
            <DialogTitle>{tForm('createTitle')}</DialogTitle>
            <DialogDescription>{tForm('createDesc')}</DialogDescription>
          </DialogHeader>
          <NoteForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={!!editNote} onOpenChange={(open) => !open && setEditNote(null)}>
        <DialogContent onClose={() => setEditNote(null)}>
          <DialogHeader>
            <DialogTitle>{tForm('editTitle')}</DialogTitle>
            <DialogDescription>{tForm('editDesc')}</DialogDescription>
          </DialogHeader>
          {editNote && (
            <NoteForm
              initialValues={{ title: editNote.title, description: editNote.description }}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditNote(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent onClose={() => setDeleteId(null)} className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">{tDelete('title')}</DialogTitle>
            <DialogDescription>{tDelete('desc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleteMutation.isPending}
              className="cursor-pointer"
            >
              {tDelete('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="cursor-pointer"
              id="confirm-delete-btn"
            >
              {deleteMutation.isPending ? tDelete('deleting') : tDelete('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
