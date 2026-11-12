import { describe, expect, it } from 'vitest';
import { levelRange } from './category';

describe('levelRange', () => {
  it('spans the lowest to the highest level present, in level order', () => {
    expect(levelRange(['Advanced', 'Beginner', 'Intermediate'])).toBe('Beginner to Advanced');
    expect(levelRange(['Intermediate', 'Beginner', 'Intermediate'])).toBe('Beginner to Intermediate');
  });
  it('names one level when all topics share it, and nothing for none', () => {
    expect(levelRange(['Intermediate', 'Intermediate'])).toBe('Intermediate');
    expect(levelRange([])).toBeUndefined();
  });
});
