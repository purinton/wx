#!/usr/bin/env node
import 'dotenv/config';
import { log, registerHandlers, registerSignals } from '@purinton/common';
registerHandlers({ logger: log }); registerSignals({ logger: log });

log.debug('Starting project...');