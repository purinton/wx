import {
    resolveLocationAndUnits,
    fetchWeather,
    generateWeatherReport,
    buildWeatherEmbed
} from '../custom/report.mjs';

export default async function ({ log, msg }, interaction, {
    resolveLocationAndUnitsDep = resolveLocationAndUnits,
    fetchWeatherDep = fetchWeather,
    generateWeatherReportDep = generateWeatherReport,
    buildWeatherEmbedDep = buildWeatherEmbed,
} = {}) {
    try {
        log.debug("Weather command interaction", interaction);

        const locale = interaction.guildLocale || interaction.locale || 'en-US';
        log.debug("Locales", {
            interactionLocale: interaction.locale,
            guildLocale: interaction.guildLocale,
            calculatedLocale: locale,
        });

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
                msg('embed_getting_location', '[23f[23f Getting location data...'),
                msg('embed_getting_weather', '[23f[23f Getting weather data...'),
                msg('embed_generating_report', '[23f[23f Generating report...'),
            ].join('\n'),
        };
        await interaction.reply({ embeds: [progressEmbed], flags: 1 << 6 });

        // Step 1: Get location data
        const { lat, lon, locationName, units, timezone } =
            await resolveLocationAndUnitsDep(location, locale, userUnits);

        let progressLines = [
            msg('embed_getting_location_ok', '[23f[23f Getting location data... OK!'),
            msg('embed_getting_weather', '[23f[23f Getting weather data...'),
            msg('embed_generating_report', '[23f[23f Generating report...'),
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
        const weatherData = await fetchWeatherDep(lat, lon, units);

        progressLines[1] = msg('embed_getting_weather_ok', '[23f[23f Getting weather data... OK!');
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
        const weatherReport = await generateWeatherReportDep(
            weatherData,
            locationName,
            units,
            locale,
            timezone
        );

        progressLines[2] = msg('embed_generating_report_ok', '[23f[23f Generating report... OK!');
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

        // Final weather embed (replace progress)
        const embed = buildWeatherEmbedDep(
            weatherData,
            weatherReport,
            locationName,
            units,
            locale
        );

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
