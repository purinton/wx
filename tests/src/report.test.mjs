import { jest } from '@jest/globals';
import * as report from '../../src/report.mjs';

describe('report.mjs', () => {
  it('buildWeatherEmbed returns correct structure', () => {
    const weatherData = { currentData: { main: { temp: 10, feels_like: 8, humidity: 80, pressure: 1000 }, wind: { speed: 2 }, weather: [{ description: 'Cloudy', icon: '01d' }] } };
    const weatherReport = 'Cloudy';
    const locationName = 'Test';
    const units = 'C';
    const msg = jest.fn((k, d) => d);
    const embed = report.buildWeatherEmbed({ weatherData, weatherReport, locationName, units, msg });
    expect(embed).toHaveProperty('title');
    expect(embed).toHaveProperty('fields');
    expect(embed.fields.length).toBeGreaterThan(0);
  });
});
