import { jest } from '@jest/globals';
import debugHandler from '../../events/debug.mjs';

describe('debug event', () => {
  it('logs debug', async () => {
    const log = { debug: jest.fn() };
    await debugHandler({ log }, 'debug info');
    expect(log.debug).toHaveBeenCalledWith('debug', { debug: 'debug info' });
  });
});
