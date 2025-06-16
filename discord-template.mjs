#!/usr/bin/env node
import 'dotenv/config';
import { log, path, registerHandlers, registerSignals } from '@purinton/common';
import { createDiscord } from '@purinton/discord';

registerHandlers({ log });
registerSignals({ log });

(async () => {
    await createDiscord({
        log,
        rootDir: path(import.meta),
        intents: {
            Guilds: true,
            GuildMessages: true,
            MessageContent: true
        }
    });
})();
