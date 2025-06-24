#!/usr/bin/env node
import 'dotenv/config';
import * as report from './src/report.mjs';
import * as owm from '@purinton/openweathermap';
import { createOpenAI } from '@purinton/openai';
import { createDiscord } from '@purinton/discord';
import { saveLatLon, getReport } from './src/openai.mjs';
import { log, fs, path, registerHandlers, registerSignals } from '@purinton/common';

registerHandlers({ log });
registerSignals({ log });

const locateConfig = JSON.parse(fs.readFileSync(path(import.meta, 'prompts', 'locate.json')), 'utf8');
const reportConfig = JSON.parse(fs.readFileSync(path(import.meta, 'prompts', 'report.json')), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path(import.meta, 'package.json')), 'utf8');

const version = packageJson.version;
const presence = { activities: [{ name: `/weather v${version}`, type: 4 }], status: 'online' };

const openai = await createOpenAI();
openai.saveLatLon = saveLatLon;
openai.getReport = getReport;
openai.locateConfig = locateConfig;
openai.reportConfig = reportConfig;

const client = await createDiscord({
    log,
    rootDir: path(import.meta),
    context: {
        owm,
        openai,
        report,
        presence,
        version
    }
});
registerSignals({ shutdownHook: () => client.destroy() });

