import { jest } from '@jest/globals';
import ready from '../../events/ready.mjs';

describe('ready event', () => {
  it('sets presence and logs in', async () => {
    const log = { debug: jest.fn(), info: jest.fn() };
    const presence = { activities: [] };
    const setPresence = jest.fn();
    const client = { user: { tag: 'test', setPresence } };
    await ready({ log, presence }, client);
    expect(log.debug).toHaveBeenCalledWith('ready', { tag: 'test' });
    expect(log.info).toHaveBeenCalledWith('Logged in as test');
    expect(setPresence).toHaveBeenCalledWith(presence);
  });
});
