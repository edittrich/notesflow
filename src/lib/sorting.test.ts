import { test } from 'node:test';
import assert from 'node:assert';
import { sortNotes, SortableNote } from './sorting';

test('sortNotes sorts notes correctly', () => {
  const sampleNotes: SortableNote[] = [
    { title: 'Banana', createdAt: new Date('2026-05-01') },
    { title: 'Apple', createdAt: new Date('2026-05-30') },
    { title: 'Cherry', createdAt: new Date('2026-05-15') },
  ];

  // Test Title A-Z
  const titleAZ = sortNotes(sampleNotes, 'TITLE_AZ');
  assert.strictEqual(titleAZ[0].title, 'Apple');
  assert.strictEqual(titleAZ[1].title, 'Banana');
  assert.strictEqual(titleAZ[2].title, 'Cherry');

  // Test Title Z-A
  const titleZA = sortNotes(sampleNotes, 'TITLE_ZA');
  assert.strictEqual(titleZA[0].title, 'Cherry');
  assert.strictEqual(titleZA[1].title, 'Banana');
  assert.strictEqual(titleZA[2].title, 'Apple');

  // Test Newest First
  const newest = sortNotes(sampleNotes, 'NEWEST_FIRST');
  assert.strictEqual(newest[0].title, 'Apple'); // May 30
  assert.strictEqual(newest[1].title, 'Cherry'); // May 15
  assert.strictEqual(newest[2].title, 'Banana'); // May 01

  // Test Oldest First
  const oldest = sortNotes(sampleNotes, 'OLDEST_FIRST');
  assert.strictEqual(oldest[0].title, 'Banana'); // May 01
  assert.strictEqual(oldest[1].title, 'Cherry'); // May 15
  assert.strictEqual(oldest[2].title, 'Apple'); // May 30
});
