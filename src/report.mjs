import { msToMph, msToKmh, hpaToInHg } from './convert.mjs';

export async function resolveLocationAndUnits({ log, openai, location, locale, userUnits }) {
    const result = await openai.saveLatLon({ openai, location, locale });
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
        return { currentData, forecastData };
    } catch (err) {
        log.error("Error fetching weather data", { lat, lon, units, error: err.message });
        return null;
    }
}

export function buildWeatherEmbed({weatherData, weatherReport, locationName, units, locale}) {
    let windValue = getMsg(locale, 'embed_na', 'N/A');
    if (weatherData.wind && weatherData.wind.speed !== undefined) {
        if (units === 'F') {
            windValue = `${msToMph(weatherData.wind.speed).toFixed(1)} mph`;
        } else if (units === 'C') {
            windValue = `${msToKmh(weatherData.wind.speed).toFixed(1)} km/h`;
        } else {
            windValue = `${weatherData.wind.speed} m/s`;
        }
    }
    const weatherIcon = weatherData.weather && weatherData.weather[0] && weatherData.weather[0].icon
        ? `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
        : null;
    return {
        title: getMsg(locale, 'embed_title', `Weather Report for ${locationName}`).replace('{location}', locationName),
        color: 0x808080,
        description: weatherReport,
        fields: [
            {
                name: getMsg(locale, 'embed_temp', 'Temperature'),
                value: `${weatherData.main.temp}\u00b0${units}`,
                inline: true
            },
            {
                name: getMsg(locale, 'embed_feelslike', 'Feels Like'),
                value: `${weatherData.main.feels_like}\u00b0${units}`,
                inline: true
            },
            {
                name: getMsg(locale, 'embed_humidity', 'Humidity'),
                value: `${weatherData.main.humidity}%`,
                inline: true
            },
            {
                name: getMsg(locale, 'embed_condition', 'Condition'),
                value: weatherData.weather && weatherData.weather[0] && weatherData.weather[0].description
                    ? weatherData.weather[0].description
                    : getMsg(locale, 'embed_na', 'N/A'),
                inline: true
            },
            {
                name: getMsg(locale, 'embed_wind', 'Wind'),
                value: windValue,
                inline: true
            },
            {
                name: getMsg(locale, 'embed_pressure', 'Pressure'),
                value: weatherData.main && weatherData.main.pressure !== undefined
                    ? (units === 'F'
                        ? `${hpaToInHg(weatherData.main.pressure).toFixed(2)} inHg`
                        : `${weatherData.main.pressure} hPa`)
                    : getMsg(locale, 'embed_na', 'N/A'),
                inline: true
            }
        ],
        thumbnail: weatherIcon ? { url: weatherIcon } : undefined
    };
}
