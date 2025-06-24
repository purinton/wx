import { jest } from '@jest/globals';
import help from '../../commands/help.mjs';

const mockLog = { debug: jest.fn() };
const mockMsg = jest.fn((key, def) => def);

describe('help command', () => {
    it('replies with help text', async () => {
        const reply = jest.fn();
        const interaction = { reply };
        await help({ log: mockLog, msg: mockMsg }, interaction);
        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.any(String) }));
        expect(mockLog.debug).toHaveBeenCalled();
    });
});
