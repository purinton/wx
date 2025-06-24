import fs from 'fs';
import path from 'path';
import log from '../log.mjs';
import OpenAI from 'openai';
import { getCurrentDirname } from '../esm-filename.mjs';

export async function saveLatLon(location, locale) {
    const dirname = getCurrentDirname(import.meta);
    const locatePath = path.join(dirname, '..', 'prompts', 'locate.json');
    const locateConfig = JSON.parse(fs.readFileSync(locatePath, 'utf8'));
    locateConfig.messages[0].content[0].text = locateConfig.messages[0].content[0].text
        .replace('{user_input}', location)
        .replace('{locale}', locale);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');
    const openai = new OpenAI({ apiKey });
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

export async function getReport(weatherData, locationName, units, locale, timezone) {
    const dirname = getCurrentDirname(import.meta);
    const reportPath = path.join(dirname, '..', 'prompts', 'report.json');
    const reportConfig = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    let timeString;
    try {
        timeString = new Date().toLocaleString(locale, { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        timeString = new Date().toLocaleString(locale, { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    reportConfig.messages[0].content[0].text = reportConfig.messages[0].content[0].text
        .replace('{weather_data}', JSON.stringify(weatherData))
        .replace('{location_name}', locationName)
        .replace('{units}', units)
        .replace('{locale}', locale)
        .replace('{time_string}', timeString);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');
    const openai = new OpenAI({ apiKey });
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
