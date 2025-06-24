export async function initCron({ fs, log, client, cronFile, owm, openai, report, cron }) {
    if (!fs.existsSync(cronFile)) {
        log.info('No cron.json found, skipping scheduled reports.');
        return;
    }
    let config;
    try {
        config = JSON.parse(fs.readFileSync(cronFile, 'utf8'));
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
            cron.schedule(sched.cron, async () => {
                try {
                    log.debug('Scheduled weather report triggered', sched);
                    const channel = await client.channels.fetch(sched.channel_id);
                    if (!channel) {
                        log.warn('Scheduled report: Channel not found', sched.channel_id);
                        return;
                    }
                    const locale = sched.locale || 'en-US';
                    const userUnits = sched.units || null;
                    const location = sched.location;
                    // Step 1: Get location data
                    const { lat, lon, locationName, units, timezone } =
                        await report.resolveLocationAndUnits({ log, openai, location, locale, userUnits });
                    if (!lat || !lon) {
                        log.warn('Scheduled report: Invalid location', sched.location);
                        return;
                    }
                    // Step 2: Get weather data
                    const weatherData = await report.fetchWeather({ log, owm, lat, lon, units });
                    if (!weatherData) {
                        log.warn('Scheduled report: Failed to fetch weather', sched.location);
                        return;
                    }
                    // Step 3: Get weather report
                    const weatherReport = await openai.getReport({ log, openai, weatherData, locationName, units, locale, timezone });
                    if (!weatherReport) {
                        log.warn('Scheduled report: Failed to generate report', sched.location);
                        return;
                    }
                    const embed = report.buildWeatherEmbed({ weatherData, weatherReport, locationName, units, msg: (k, d) => d });
                    await channel.send({ embeds: [embed] });
                    log.info(`Scheduled weather report sent to channel ${sched.channel_id} for ${sched.location}`);
                } catch (err) {
                    log.error('Scheduled report error', err);
                }
            }, { timezone: 'UTC' });
            log.info(`Scheduled weather report: ${sched.cron} for ${sched.location} in channel ${sched.channel_id}`);
        } catch (err) {
            log.error('Failed to schedule cron job', err);
        }
    }
}
