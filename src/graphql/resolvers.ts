import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { z } from 'zod';
import { GraphQLError } from 'graphql';
import { type GraphQLContext } from './context';

// Zod schemas for input validation
const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be 120 characters or less'),
  description: z.string().trim().min(1, 'Description is required').max(5000, 'Description must be 5000 characters or less'),
});

const updateNoteSchema = z.object({
  id: z.string().uuid('Invalid note ID'),
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be 120 characters or less').optional(),
  description: z.string().trim().min(1, 'Description is required').max(5000, 'Description must be 5000 characters or less').optional(),
});

const deleteNoteSchema = z.object({
  id: z.string().uuid('Invalid note ID'),
});

export const resolvers = {
  Query: {
    getNotes: async (_parent: unknown, args: { sortBy?: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const sortBy = args.sortBy || 'NEWEST_FIRST';
      let orderByClause = desc(notes.createdAt);

      if (sortBy === 'OLDEST_FIRST') {
        orderByClause = asc(notes.createdAt);
      } else if (sortBy === 'TITLE_AZ') {
        orderByClause = asc(notes.title);
      } else if (sortBy === 'TITLE_ZA') {
        orderByClause = desc(notes.title);
      }

      try {
        const userNotes = await db
          .select()
          .from(notes)
          .where(eq(notes.userId, context.user.id))
          .orderBy(orderByClause);

        return userNotes.map((note) => ({
          ...note,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        }));
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        throw new GraphQLError('Failed to retrieve notes');
      }
    },
  },
  Mutation: {
    createNote: async (
      _parent: unknown,
      args: { title: string; description: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Input validation
      const validation = createNoteSchema.safeParse(args);
      if (!validation.success) {
        throw new GraphQLError(validation.error.issues[0].message, {
          extensions: { code: 'BAD_USER_INPUT', errors: validation.error.format() },
        });
      }

      const { title, description } = validation.data;

      try {
        const [newNote] = await db
          .insert(notes)
          .values({
            userId: context.user.id,
            title,
            description,
          })
          .returning();

        if (!newNote) {
          throw new Error('Failed to create note record.');
        }

        return {
          ...newNote,
          createdAt: newNote.createdAt.toISOString(),
          updatedAt: newNote.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Failed to create note:', error);
        throw new GraphQLError('Failed to create note');
      }
    },
    updateNote: async (
      _parent: unknown,
      args: { id: string; title?: string; description?: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Input validation
      const validation = updateNoteSchema.safeParse(args);
      if (!validation.success) {
        throw new GraphQLError(validation.error.issues[0].message, {
          extensions: { code: 'BAD_USER_INPUT', errors: validation.error.format() },
        });
      }

      const { id, title, description } = validation.data;

      try {
        const [updatedNote] = await db
          .update(notes)
          .set({
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
            updatedAt: new Date(),
          })
          .where(and(eq(notes.id, id), eq(notes.userId, context.user.id)))
          .returning();

        if (!updatedNote) {
          throw new GraphQLError('Note not found or unauthorized', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return {
          ...updatedNote,
          createdAt: updatedNote.createdAt.toISOString(),
          updatedAt: updatedNote.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Failed to update note:', error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update note');
      }
    },
    deleteNote: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Input validation
      const validation = deleteNoteSchema.safeParse(args);
      if (!validation.success) {
        throw new GraphQLError(validation.error.issues[0].message, {
          extensions: { code: 'BAD_USER_INPUT', errors: validation.error.format() },
        });
      }

      const { id } = validation.data;

      try {
        const [deletedNote] = await db
          .delete(notes)
          .where(and(eq(notes.id, id), eq(notes.userId, context.user.id)))
          .returning();

        if (!deletedNote) {
          throw new GraphQLError('Note not found or unauthorized', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return {
          ...deletedNote,
          createdAt: deletedNote.createdAt.toISOString(),
          updatedAt: deletedNote.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Failed to delete note:', error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to delete note');
      }
    },
  },
};
