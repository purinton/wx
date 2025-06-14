import { jest } from '@jest/globals';
test('project-template.mjs can be imported without error', async () => {
  process.env.LOG_LEVEL = 'none';
  await import('../project-template.mjs');
  expect(true).toBe(true);
});