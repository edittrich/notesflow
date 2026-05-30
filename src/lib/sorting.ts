export interface SortableNote {
  title: string;
  createdAt: Date;
}

export function sortNotes(notes: SortableNote[], sortBy: string): SortableNote[] {
  const sorted = [...notes];
  switch (sortBy) {
    case 'NEWEST_FIRST':
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'OLDEST_FIRST':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'TITLE_AZ':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'TITLE_ZA':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted;
  }
}
