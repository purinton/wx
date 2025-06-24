#!/usr/bin/env node
import 'dotenv/config';
import * as owm from '@purinton/openweathermap';
import { createOpenAI } from '@purinton/openai';
import { createDiscord } from '@purinton/discord';
import { log, fs, path, registerHandlers, registerSignals } from '@purinton/common';

registerHandlers({ log });
registerSignals({ log });

const packageJson = JSON.parse(fs.readFileSync(path(import.meta, 'package.json')), 'utf8');
const version = packageJson.version;
const presence = { activities: [{ name: `/weather v${version}`, type: 4 }], status: 'online' };
const openai = await createOpenAI();
const client = await createDiscord({
    log,
    rootDir: path(import.meta),
    context: {
        owm,
        openai,
        presence,
        version
    }
});
registerSignals({ shutdownHook: () => client.destroy() });
