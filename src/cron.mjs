import fs from 'fs';
import path from 'path';
import { CronJob } from 'cron';
import log from '../log.mjs';
import {
    resolveLocationAndUnits,
    fetchWeather,
    generateWeatherReport,
    buildWeatherEmbed
} from './report.mjs';

export async function initCron(client, rootDir) {
    const cronPath = path.join(rootDir, 'cron.json');
    if (!fs.existsSync(cronPath)) {
        log.info('No cron.json found, skipping scheduled reports.');
        return;
    }
    let config;
    try {
        const raw = fs.readFileSync(cronPath, 'utf8');
        config = JSON.parse(raw);
    } catch (err) {
        log.error('Failed to read or parse cron.json', err);
        return;
    }
    if (!config.schedules || !Array.isArray(config.schedules)) {
        log.error('Invalid cron.json: missing or invalid schedules array');
        return;
    }
    for (const sched of config.schedules) {
        if (!sched.cron || !sched.channel_id || !sched.location) {
            log.warn('Skipping invalid schedule entry', sched);
            continue;
        }
        try {
            new CronJob(sched.cron, async () => {
                try {
                    const channel = await client.channels.fetch(sched.channel_id);
                    if (!channel) {
                        log.warn('Scheduled report: Channel not found', sched.channel_id);
                        return;
                    }
                    const locale = sched.locale || 'en-US';
                    const userUnits = sched.units || null;
                    const { lat, lon, locationName, units } = await resolveLocationAndUnits(sched.location, locale, userUnits);
                    if (!lat || !lon) {
                        log.warn('Scheduled report: Invalid location', sched.location);
                        return;
                    }
                    const weatherData = await fetchWeather(lat, lon, units);
                    if (!weatherData) {
                        log.warn('Scheduled report: Failed to fetch weather', sched.location);
                        return;
                    }
                    const weatherReport = await generateWeatherReport(weatherData, locationName, units, locale);
                    if (!weatherReport) {
                        log.warn('Scheduled report: Failed to generate report', sched.location);
                        return;
                    }
                    const embed = buildWeatherEmbed(weatherData, weatherReport, locationName, units, locale);
                    await channel.send({ embeds: [embed] });
                    log.info(`Scheduled weather report sent to channel ${sched.channel_id} for ${sched.location}`);
                } catch (err) {
                    log.error('Scheduled report error', err);
                }
            }, null, true, 'UTC');
            log.info(`Scheduled weather report: ${sched.cron} for ${sched.location} in channel ${sched.channel_id}`);
        } catch (err) {
            log.error('Failed to schedule cron job', err);
        }
    }
}
