import { jest } from '@jest/globals';
import interactionCreate from '../../events/interactionCreate.mjs';

describe('interactionCreate event', () => {
  it('calls the correct command handler', async () => {
    const handler = jest.fn();
    const commandHandlers = { test: handler };
    const log = {};
    const msg = jest.fn();
    const interaction = { commandName: 'test', locale: 'en-US' };
    await interactionCreate({ client: {}, log, msg, commandHandlers }, interaction);
    expect(handler).toHaveBeenCalled();
  });
});
