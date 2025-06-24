import { jest } from '@jest/globals';
import { initCron } from '../../src/cron.mjs';

describe('initCron', () => {
  it('skips if cron file does not exist', async () => {
    const fs = { existsSync: jest.fn().mockReturnValue(false) };
    const log = { info: jest.fn() };
    await initCron({ fs, log, client: {}, cronFile: 'nofile', owm: {}, openai: {}, report: {}, cron: {} });
    expect(log.info).toHaveBeenCalledWith('No cron.json found, skipping scheduled reports.');
  });
  it('logs error if cron file is invalid', async () => {
    const fs = { existsSync: jest.fn().mockReturnValue(true), readFileSync: jest.fn().mockImplementation(() => '{') };
    const log = { error: jest.fn() };
    await initCron({ fs, log, client: {}, cronFile: 'badfile', owm: {}, openai: {}, report: {}, cron: {} });
    expect(log.error).toHaveBeenCalledWith('Failed to read or parse cron.json', expect.anything());
  });
  it('logs error if schedules missing', async () => {
    const fs = { existsSync: jest.fn().mockReturnValue(true), readFileSync: jest.fn().mockReturnValue('{}') };
    const log = { error: jest.fn() };
    await initCron({ fs, log, client: {}, cronFile: 'badfile', owm: {}, openai: {}, report: {}, cron: {} });
    expect(log.error).toHaveBeenCalledWith('Invalid cron.json: missing or invalid schedules array');
  });
});
