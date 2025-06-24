import fetch from 'node-fetch';
import log from '../log.mjs';

export async function getWeatherData(lat, lon, units) {
    const apiKey = process.env.OWM_API_KEY;
    if (!apiKey) {
        throw new Error('OWM_API_KEY is not set in environment variables');
    }
    let owmUnits = 'metric';
    if (units === 'F') owmUnits = 'imperial';
    if (units === 'C') owmUnits = 'metric';
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${owmUnits}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${owmUnits}`;
    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);
        if (!currentRes.ok) {
            throw new Error(`OpenWeatherMap API error: ${currentRes.status} ${currentRes.statusText}`);
        }
        if (!forecastRes.ok) {
            throw new Error(`OpenWeatherMap API error: ${forecastRes.status} ${forecastRes.statusText}`);
        }
        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();
        const now = Date.now() / 1000;
        const next24h = forecastData.list.filter(item => item.dt > now && item.dt <= now + 24 * 3600);
        currentData.forecast_24h = next24h;
        return currentData;
    } catch (err) {
        log.error("Error fetching weather data", { lat, lon, units, error: err.message });
        return null;
    }
}
