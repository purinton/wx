export async function saveLatLon({ log, openai, location, locale }) {
    const locateConfig = JSON.parse(JSON.stringify(openai.locateConfig));
    locateConfig.messages[0].content[0].text = locateConfig.messages[0].content[0].text
        .replace('{user_input}', location)
        .replace('{locale}', locale);
    log.debug('OpenAI locate config', locateConfig);
    const response = await openai.chat.completions.create(locateConfig);
    log.debug('OpenAI locate response', response);
    try {
        const toolCalls = response.choices?.[0]?.message?.tool_calls;
        if (toolCalls && toolCalls.length > 0) {
            const tool = toolCalls.find(tc => tc.type === 'function' && tc.function.name === 'saveLatLon');
            if (tool) {
                const args = JSON.parse(tool.function.arguments);
                return [args.lat, args.lon, args.location_name, args.units, args.timezone];
            }
        }
    } catch (err) {
        log.error('Failed to parse OpenAI tool call response', err);
    }
    return [null, null, null, null, null];
}

export async function getReport({ log, openai, weatherData, locationName, units, locale, timezone }) {
    let timeString;
    try {
        timeString = new Date().toLocaleString(locale, { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        timeString = new Date().toLocaleString(locale, { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    const reportConfig = JSON.parse(JSON.stringify(openai.reportConfig));
    reportConfig.messages[0].content[0].text = reportConfig.messages[0].content[0].text
        .replace('{weather_data}', JSON.stringify(weatherData))
        .replace('{location_name}', locationName)
        .replace('{units}', units)
        .replace('{locale}', locale)
        .replace('{time_string}', timeString);
    log.debug('OpenAI report config', reportConfig);
    const response = await openai.chat.completions.create(reportConfig);
    log.debug('OpenAI report response', response);
    try {
        const text = response.choices?.[0]?.message?.content;
        if (text) return text;
    } catch (err) {
        log.error('Failed to parse OpenAI report response', err);
    }
    return null;
}
