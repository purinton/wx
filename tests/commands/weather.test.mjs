import { jest } from '@jest/globals';
import weather from '../../commands/weather.mjs';

const mockLog = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
const mockMsg = jest.fn((key, def) => def);
const mockOwm = {};
const mockOpenai = { getReport: jest.fn().mockResolvedValue('Weather report') };
const mockReport = {
  resolveLocationAndUnits: jest.fn().mockResolvedValue({ lat: 1, lon: 2, locationName: 'Test', units: 'C', timezone: 'UTC' }),
  fetchWeather: jest.fn().mockResolvedValue({ currentData: { main: { temp: 20, feels_like: 19, humidity: 50, pressure: 1013 }, wind: { speed: 2 }, weather: [{ description: 'Clear', icon: '01d' }] }, forecastData: [] }),
  buildWeatherEmbed: jest.fn().mockReturnValue({ title: 'Weather', fields: [] })
};
const mockLocateConfig = {};
const mockReportConfig = {};

describe('weather command', () => {
  it('replies with weather embed', async () => {
    const reply = jest.fn();
    const editReply = jest.fn();
    const options = { getString: jest.fn().mockReturnValue('Test') };
    const interaction = { reply, editReply, options };
    await weather({ log: mockLog, msg: mockMsg, owm: mockOwm, openai: mockOpenai, report: mockReport, locateConfig: mockLocateConfig, reportConfig: mockReportConfig }, interaction);
    expect(reply).toHaveBeenCalled();
    expect(editReply).toHaveBeenCalled();
    expect(mockReport.resolveLocationAndUnits).toHaveBeenCalled();
    expect(mockReport.fetchWeather).toHaveBeenCalled();
    expect(mockOpenai.getReport).toHaveBeenCalled();
    expect(mockReport.buildWeatherEmbed).toHaveBeenCalled();
  });
});
