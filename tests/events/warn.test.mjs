import { jest } from '@jest/globals';
import warn from '../../events/warn.mjs';

describe('warn event', () => {
  it('logs warn', async () => {
    const log = { warn: jest.fn() };
    await warn({ log }, 'warning');
    expect(log.warn).toHaveBeenCalledWith('warn', { warn: 'warning' });
  });
});
