import { describe, expect, it } from 'vitest';
import { growthConfig } from '@/lib/growth/config';

describe('growthConfig', () => {
  it('works with nothing set', () => {
    expect(growthConfig({} as NodeJS.ProcessEnv)).toEqual({ excludeUserIds: [], launchDay: null });
  });

  it('reads a trimmed, comma-separated exclusion list', () => {
    const cfg = growthConfig({
      GROWTH_EXCLUDE_USER_IDS: ' a, b ,,c ',
    } as unknown as NodeJS.ProcessEnv);
    expect(cfg.excludeUserIds).toEqual(['a', 'b', 'c']);
  });

  it('accepts a real launch day and ignores a malformed one', () => {
    expect(
      growthConfig({ GROWTH_LAUNCH_DATE: '2026-12-01' } as unknown as NodeJS.ProcessEnv).launchDay,
    ).toBe('2026-12-01');
    expect(
      growthConfig({ GROWTH_LAUNCH_DATE: '1 Dec' } as unknown as NodeJS.ProcessEnv).launchDay,
    ).toBeNull();
    expect(
      growthConfig({ GROWTH_LAUNCH_DATE: '2026-13-45' } as unknown as NodeJS.ProcessEnv).launchDay,
    ).toBeNull();
  });
});
