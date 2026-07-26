import { describe, expect, it } from 'vitest';
import { RailStateService } from './rail-state.service';

describe('RailStateService', () => {
  it('starts expanded (detail mode is default)', () => {
    const service = new RailStateService();
    expect(service.expanded()).toBe(true);
  });

  it('toggle() flips rail width state', () => {
    const service = new RailStateService();
    service.toggle();
    expect(service.expanded()).toBe(false);
    service.toggle();
    expect(service.expanded()).toBe(true);
  });
});
