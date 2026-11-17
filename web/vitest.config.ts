import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Many tests run hundreds of random cases against a brute force. Alone they take a second
    // or two, but a full run on a busy machine or a two-core CI runner can stretch them past
    // vitest's 5 s default. They are CPU-bound and deterministic, so the limit only guards
    // against a hang; 20 s does that without failing a slow but correct run.
    testTimeout: 20_000,
  },
});
