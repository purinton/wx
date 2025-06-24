import { jest } from '@jest/globals';
import { msToMph, msToKmh, hpaToInHg } from '../../src/convert.mjs';

describe('convert.mjs', () => {
  it('converts m/s to mph', () => {
    expect(msToMph(1)).toBeCloseTo(2.23694);
  });
  it('converts m/s to km/h', () => {
    expect(msToKmh(1)).toBeCloseTo(3.6);
  });
  it('converts hPa to inHg', () => {
    expect(hpaToInHg(1)).toBeCloseTo(0.02953);
  });
});
