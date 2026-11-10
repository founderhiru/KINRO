// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const blockFindMany = vi.fn();
const blockCount = vi.fn();
const dogFindUnique = vi.fn();
const conversationFindUnique = vi.fn();
vi.mock('@/lib/db', () => ({
  prisma: {
    block: { findMany: blockFindMany, count: blockCount },
    dogProfile: { findUnique: dogFindUnique },
    conversation: { findUnique: conversationFindUnique },
  },
}));

beforeEach(() => {
  blockFindMany.mockReset();
  blockCount.mockReset();
  dogFindUnique.mockReset();
  conversationFindUnique.mockReset();
});

describe('getBlockedUserIds', () => {
  it('returns the other person for blocks in either direction, once each', async () => {
    blockFindMany.mockResolvedValue([
      { blockerId: 'me', blockedId: 'a' },
      { blockerId: 'b', blockedId: 'me' },
      { blockerId: 'a', blockedId: 'me' },
    ]);
    const { getBlockedUserIds } = await import('@/lib/safety');
    expect((await getBlockedUserIds('me')).sort()).toEqual(['a', 'b']);
  });
});

describe('resolveTarget', () => {
  it('resolves a dog to its owner', async () => {
    dogFindUnique.mockResolvedValue({ id: 'd1', ownerId: 'owner' });
    const { resolveTarget } = await import('@/lib/safety');
    expect(await resolveTarget({ dogId: 'd1' }, 'me')).toEqual({ userId: 'owner', dogId: 'd1' });
  });

  it('refuses your own dog', async () => {
    dogFindUnique.mockResolvedValue({ id: 'd1', ownerId: 'me' });
    const { resolveTarget } = await import('@/lib/safety');
    await expect(resolveTarget({ dogId: 'd1' }, 'me')).rejects.toMatchObject({ status: 400 });
  });

  it('treats a dog with no owner or a missing dog as not found', async () => {
    const { resolveTarget } = await import('@/lib/safety');
    dogFindUnique.mockResolvedValue({ id: 'd1', ownerId: null });
    await expect(resolveTarget({ dogId: 'd1' }, 'me')).rejects.toMatchObject({ status: 404 });
    dogFindUnique.mockResolvedValue(null);
    await expect(resolveTarget({ dogId: 'x' }, 'me')).rejects.toMatchObject({ status: 404 });
  });

  it('resolves a conversation to the other participant, either side', async () => {
    const { resolveTarget } = await import('@/lib/safety');
    conversationFindUnique.mockResolvedValue({ match: { senderId: 'me', receiverId: 'them' } });
    expect((await resolveTarget({ conversationId: 'c' }, 'me')).userId).toBe('them');
    conversationFindUnique.mockResolvedValue({ match: { senderId: 'them', receiverId: 'me' } });
    expect((await resolveTarget({ conversationId: 'c' }, 'me')).userId).toBe('them');
  });

  it('a conversation the caller is not in looks like not found', async () => {
    conversationFindUnique.mockResolvedValue({ match: { senderId: 'x', receiverId: 'y' } });
    const { resolveTarget } = await import('@/lib/safety');
    await expect(resolveTarget({ conversationId: 'c' }, 'me')).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('isBlockedBetween', () => {
  it('is true when a block exists in either direction', async () => {
    blockCount.mockResolvedValue(1);
    const { isBlockedBetween } = await import('@/lib/safety');
    expect(await isBlockedBetween('a', 'b')).toBe(true);
    blockCount.mockResolvedValue(0);
    expect(await isBlockedBetween('a', 'b')).toBe(false);
  });
});
