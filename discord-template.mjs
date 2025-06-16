#!/usr/bin/env node
import 'dotenv/config';
import { log, path, registerHandlers, registerSignals } from '@purinton/common';
import { createDiscord } from '@purinton/discord';

registerHandlers({ log });
registerSignals({ log });

(async () => {
    const client = await createDiscord({
        log,
        rootDir: path(import.meta),
        intents: {
            Guilds: true,
            GuildMessages: true,
            MessageContent: true,
        },
        context: {
            presence: { activities: [{ name: 'example', type: 4 }], status: 'online' },
        },
    });
    registerSignals({ shutdownHook: async () => {
        await client.destroy();
    }});
})();
