// events/ready.mjs
export default async function ({ log }, client) {
    log.debug('ready', { tag: client.user.tag });
    log.info(`Logged in as ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: 'App Template', type: 4 }], status: 'online' });
}
