// commands/weather.mjs
export default async function ({ log, msg, owm, openai, report, locateConfig, reportConfig }, interaction) {
    try {
        log.debug("Weather command interaction", interaction);

        const locale = interaction.guildLocale || interaction.locale || 'en-US';
        log.debug("Locales", { interactionLocale: interaction.locale, guildLocale: interaction.guildLocale, calculatedLocale: locale, });

        const location = interaction.options.getString('location') || null;
        const userUnits = interaction.options.getString('units') || null;

        if (!location) {
            log.warn("No location provided for weather command");
            await interaction.reply({
                content: msg('noLocation', 'Please provide a location.'),
                flags: 1 << 6, // ephemeral
            });
            return;
        }

        // Initial progress embed
        const progressEmbed = {
            color: 0x808080, // gray
            description: [
                msg('embed_getting_location', '⏳ Getting location data...'),
                msg('embed_getting_weather', '⏳ Getting weather data...'),
                msg('embed_generating_report', '⏳ Generating report...'),
            ].join('\n'),
        };
        await interaction.reply({ embeds: [progressEmbed], flags: 1 << 6 });

        // Step 1: Get location data
        const { lat, lon, locationName, units, timezone } =
            await report.resolveLocationAndUnits({ log, openai, locateConfig, location, locale, userUnits });

        let progressLines = [
            msg('embed_getting_location_ok', '✅ Getting location data... OK!'),
            msg('embed_getting_weather', '⏳ Getting weather data...'),
            msg('embed_generating_report', '⏳ Generating report...'),
        ];

        await interaction.editReply({
            embeds: [{ color: 0x808080, description: progressLines.join('\n') }],
        });

        if (!lat || !lon) {
            log.warn("Failed to get lat/lon for location", { location, lat, lon });
            await interaction.editReply({
                content: msg('invalidLocation', 'Invalid location provided.'),
                embeds: [],
            });
            return;
        }

        // Step 2: Get weather data
        const weatherData = await report.fetchWeather({ log, owm, lat, lon, units });

        progressLines[1] = msg('embed_getting_weather_ok', '✅ Getting weather data... OK!');
        await interaction.editReply({
            embeds: [{ color: 0x808080, description: progressLines.join('\n') }],
        });

        if (!weatherData) {
            log.error("Failed to get weather data", { lat, lon });
            await interaction.editReply({
                content: msg('error', 'Failed to retrieve weather data.'),
                embeds: [],
            });
            return;
        }

        // Step 3: Get weather report
        const weatherReport = await openai.getReport({ log, openai, reportConfig, weatherData, locationName, units, locale, timezone });

        progressLines[2] = msg('embed_generating_report_ok', '✅ Generating report... OK!');
        await interaction.editReply({
            embeds: [{ color: 0x808080, description: progressLines.join('\n') }],
        });

        if (!weatherReport) {
            log.error("Failed to get weather report", { locationName });
            await interaction.editReply({
                content: msg('error', 'Failed to generate weather report.'),
                embeds: [],
            });
            return;
        }

        const embed = report.buildWeatherEmbed({ weatherData, weatherReport, locationName, units, msg });

        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        log.error("Error in /weather handler", err);
        try {
            await interaction.editReply({
                content: msg('error', 'An error occurred while processing your request.'),
                embeds: [],
            });
        } catch (e) {
            log.error("Failed to reply with error message", e);
        }
    }
}
