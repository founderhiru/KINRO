// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/db', () => ({
  prisma: {
    conversation: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'c1',
        match: { status: 'active', senderId: 'a', receiverId: 'b' },
      }),
    },
  },
}));
const isBlockedBetween = vi.fn();
vi.mock('@/lib/safety', () => ({ isBlockedBetween }));

describe('loadOwnedConversation with blocking', () => {
  it('opens normally when nobody is blocked', async () => {
    isBlockedBetween.mockResolvedValue(false);
    const { loadOwnedConversation } = await import('@/lib/conversation-ownership');
    await expect(loadOwnedConversation('c1', 'a')).resolves.toMatchObject({ id: 'c1' });
  });

  it('is a plain 404 for BOTH people once either has blocked the other', async () => {
    isBlockedBetween.mockResolvedValue(true);
    const { loadOwnedConversation } = await import('@/lib/conversation-ownership');
    await expect(loadOwnedConversation('c1', 'a')).rejects.toMatchObject({ status: 404 });
    await expect(loadOwnedConversation('c1', 'b')).rejects.toMatchObject({ status: 404 });
  });
});
