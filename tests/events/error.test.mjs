import { jest } from '@jest/globals';
import errorHandler from '../../events/error.mjs';

describe('error event', () => {
  it('logs error', async () => {
    const log = { error: jest.fn() };
    await errorHandler({ log }, 'err');
    expect(log.error).toHaveBeenCalledWith('error', { error: 'err' });
  });
});
