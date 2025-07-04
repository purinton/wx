import { msToMph, msToKmh, hpaToInHg } from './convert.mjs';

export async function resolveLocationAndUnits({ log, openai, location, locale, userUnits }) {
    const result = await openai.saveLatLon({ log, openai, location, locale });
    log.debug('[resolveLocationAndUnits] saveLatLon result:', result);
    const arr = Array.isArray(result) ? result : Object.values(result);
    const [lat, lon, locationNameOrig, aiUnits, timezone] = arr;
    if (!lat || !lon || !locationNameOrig || !aiUnits || !timezone) {
        log.warn('[resolveLocationAndUnits] Missing results', { result });
    }
    const locationName = locationNameOrig || location;
    const units = userUnits || aiUnits;
    return { lat, lon, locationName, units, timezone };
}

function getDateStrings(dt, tzOffset) {
    const utcDate = new Date(dt * 1000);
    const localDate = new Date((dt + tzOffset) * 1000);
    return {
        dt_text_utc: utcDate.toISOString().replace('T', ' ').replace(/\..+/, ''),
        dt_text_local: localDate.toISOString().replace('T', ' ').replace(/\..+/, '')
    };
}

export async function fetchWeather({ log, owm, lat, lon, units }) {
    try {
        const [currentData, forecastData] = await Promise.all([
            owm.getCurrent(lat, lon, { units }),
            owm.get24hForecast(lat, lon, { units })
        ]);
        log.debug('Fetched weather data', { lat, lon, units, currentData, forecastData });
        if (!currentData || !forecastData) {
            log.warn("No weather data returned from OpenWeatherMap", { lat, lon, units });
            return null;
        }
        // Use timezone offset from currentData, fallback to 0
        const tzOffset = typeof currentData.timezone === 'number' ? currentData.timezone : 0;
        if (currentData.dt !== undefined) {
            Object.assign(currentData, getDateStrings(currentData.dt, tzOffset));
        }
        if (Array.isArray(forecastData)) {
            forecastData.forEach(entry => {
                if (entry.dt !== undefined) {
                    Object.assign(entry, getDateStrings(entry.dt, tzOffset));
                }
            });
        }
        return { currentData, forecastData };
    } catch (err) {
        log.error("Error fetching weather data", { lat, lon, units, error: err.message });
        return null;
    }
}

export function buildWeatherEmbed({ weatherData, weatherReport, locationName, units, msg }) {
    let windValue = msg('embed_na', 'N/A');
    if (weatherData.currentData.wind && weatherData.currentData.wind.speed !== undefined) {
        if (units === 'F') {
            windValue = `${msToMph(weatherData.currentData.wind.speed).toFixed(1)} mph`;
        } else if (units === 'C') {
            windValue = `${msToKmh(weatherData.currentData.wind.speed).toFixed(1)} km/h`;
        } else {
            windValue = `${weatherData.currentData.wind.speed} m/s`;
        }
    }
    const weatherIcon = weatherData.currentData.weather && weatherData.currentData.weather[0] && weatherData.currentData.weather[0].icon
        ? `https://openweathermap.org/img/wn/${weatherData.currentData.weather[0].icon}@2x.png`
        : null;
    return {
        title: msg('embed_title', `Weather Report for ${locationName}`).replace('{location}', locationName),
        color: 0x808080,
        description: weatherReport,
        fields: [
            {
                name: msg('embed_temp', 'Temperature'),
                value: `${weatherData.currentData.main.temp}\u00b0${units}`,
                inline: true
            },
            {
                name: msg('embed_feelslike', 'Feels Like'),
                value: `${weatherData.currentData.main.feels_like}\u00b0${units}`,
                inline: true
            },
            {
                name: msg('embed_humidity', 'Humidity'),
                value: `${weatherData.currentData.main.humidity}%`,
                inline: true
            },
            {
                name: msg('embed_condition', 'Condition'),
                value: weatherData.currentData.weather && weatherData.currentData.weather[0] && weatherData.currentData.weather[0].description
                    ? weatherData.currentData.weather[0].description
                    : msg('embed_na', 'N/A'),
                inline: true
            },
            {
                name: msg('embed_wind', 'Wind'),
                value: windValue,
                inline: true
            },
            {
                name: msg('embed_pressure', 'Pressure'),
                value: weatherData.currentData.main && weatherData.currentData.main.pressure !== undefined
                    ? (units === 'F'
                        ? `${hpaToInHg(weatherData.currentData.main.pressure).toFixed(2)} inHg`
                        : `${weatherData.currentData.main.pressure} hPa`)
                    : msg('embed_na', 'N/A'),
                inline: true
            }
        ],
        thumbnail: weatherIcon ? { url: weatherIcon } : undefined
    };
}
