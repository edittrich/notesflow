import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Note {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const fetchGraphQL = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'GraphQL Error');
  }

  return json.data as T;
};

// Query Hook
export function useNotes(sortBy = 'NEWEST_FIRST') {
  return useQuery({
    queryKey: ['notes', sortBy],
    queryFn: () =>
      fetchGraphQL<{ getNotes: Note[] }>(
        `
        query GetNotes($sortBy: String) {
          getNotes(sortBy: $sortBy) {
            id
            title
            description
            createdAt
            updatedAt
          }
        }
      `,
        { sortBy }
      ).then((data) => data.getNotes),
  });
}

// Create Mutation
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { title: string; description: string }) =>
      fetchGraphQL<{ createNote: Note }>(
        `
        mutation CreateNote($title: String!, $description: String!) {
          createNote(title: $title, description: $description) {
            id
            title
            description
            createdAt
            updatedAt
          }
        }
      `,
        variables
      ).then((data) => data.createNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Update Mutation
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; title?: string; description?: string }) =>
      fetchGraphQL<{ updateNote: Note }>(
        `
        mutation UpdateNote($id: ID!, $title: String, $description: String) {
          updateNote(id: $id, title: $title, description: $description) {
            id
            title
            description
            createdAt
            updatedAt
          }
        }
      `,
        variables
      ).then((data) => data.updateNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Delete Mutation
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string }) =>
      fetchGraphQL<{ deleteNote: { id: string } }>(
        `
        mutation DeleteNote($id: ID!) {
          deleteNote(id: $id) {
            id
          }
        }
      `,
        variables
      ).then((data) => data.deleteNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
