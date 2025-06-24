import { jest } from '@jest/globals';
import { saveLatLon, getReport } from '../../src/openai.mjs';

describe('openai.mjs', () => {
  it('returns default array if tool call fails', async () => {
    const log = { debug: jest.fn(), error: jest.fn() };
    const openai = { locateConfig: { messages: [{ content: [{ text: '{user_input}' }] }] }, chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{}] }) } } };
    const result = await saveLatLon({ log, openai, location: 'nowhere', locale: 'en-US' });
    expect(result).toEqual([null, null, null, null, null]);
  });
  it('returns text from getReport', async () => {
    const log = { debug: jest.fn(), error: jest.fn() };
    const openai = { reportConfig: { messages: [{ content: [{ text: '{weather_data}' }] }] }, chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'report' } }] }) } } };
    const weatherData = {}; const locationName = 'Test';
    const result = await getReport({ log, openai, weatherData, locationName, units: 'C', locale: 'en-US', timezone: 'UTC' });
    expect(result).toBe('report');
  });
});
