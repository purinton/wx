// events/interactionCreate.mjs
export default async function ({ client, log, msg, commandHandlers }, interaction) {
    const locale = interaction.locale || interaction.guild?.preferredLocale || 'en-US';
    const localeMsg = (key, defaultMsg) => msg(locale, key, defaultMsg, log);
    const handler = commandHandlers?.[interaction.commandName];
    if (handler) await handler(interaction, { client, log, msg: localeMsg });
}
