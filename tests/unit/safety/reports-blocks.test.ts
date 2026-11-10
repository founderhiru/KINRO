// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

class FakeAuthError extends Error {
  readonly status = 401;
}
const requireAuthenticatedUserMock = vi.fn();
vi.mock('@/lib/auth', () => ({
  AuthError: FakeAuthError,
  requireAuthenticatedUser: requireAuthenticatedUserMock,
}));

class FakeSafetyError extends Error {
  constructor(
    m: string,
    readonly status: number,
  ) {
    super(m);
  }
}
const resolveTargetMock = vi.fn();
vi.mock('@/lib/safety', () => ({
  SafetyTargetError: FakeSafetyError,
  resolveTarget: resolveTargetMock,
}));

const reportCount = vi.fn();
const reportCreate = vi.fn();
const blockUpsert = vi.fn();
const blockFindMany = vi.fn();
const blockDeleteMany = vi.fn();
vi.mock('@/lib/db', () => ({
  prisma: {
    report: { count: reportCount, create: reportCreate },
    block: { upsert: blockUpsert, findMany: blockFindMany, deleteMany: blockDeleteMany },
  },
}));
const sendEmail = vi.fn();
vi.mock('@/lib/email', () => ({ sendAuthEmail: sendEmail }));

const post = (body: unknown) =>
  new Request('http://x', { method: 'POST', body: JSON.stringify(body) });

beforeEach(() => {
  for (const m of [
    requireAuthenticatedUserMock,
    resolveTargetMock,
    reportCount,
    reportCreate,
    blockUpsert,
    blockFindMany,
    blockDeleteMany,
    sendEmail,
  ])
    m.mockReset();
  requireAuthenticatedUserMock.mockResolvedValue({ id: 'me' });
  resolveTargetMock.mockResolvedValue({ userId: 'them', dogId: 'd1' });
  reportCount.mockResolvedValue(0);
  reportCreate.mockResolvedValue({ id: 'r1' });
});

describe('POST /api/reports', () => {
  it('401 when signed out', async () => {
    requireAuthenticatedUserMock.mockRejectedValue(new FakeAuthError('Authentication required'));
    const { POST } = await import('@/app/api/reports/route');
    expect((await POST(post({ dogId: 'd1', reason: 'spam' }))).status).toBe(401);
  });

  it('400 for an invalid body', async () => {
    const { POST } = await import('@/app/api/reports/route');
    expect((await POST(post({ reason: 'spam' }))).status).toBe(400);
    expect(reportCreate).not.toHaveBeenCalled();
  });

  it('stores the report against the resolved user and emails support', async () => {
    const { POST } = await import('@/app/api/reports/route');
    const res = await POST(post({ dogId: 'd1', reason: 'spam', details: 'scam link' }));
    expect(res.status).toBe(201);
    expect(reportCreate).toHaveBeenCalledWith({
      data: {
        reporterId: 'me',
        targetUserId: 'them',
        targetDogId: 'd1',
        reason: 'spam',
        details: 'scam link',
      },
    });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('still succeeds if the support email fails', async () => {
    sendEmail.mockRejectedValue(new Error('resend'));
    const { POST } = await import('@/app/api/reports/route');
    expect((await POST(post({ dogId: 'd1', reason: 'spam' }))).status).toBe(201);
  });

  it('429 after too many reports in a day', async () => {
    reportCount.mockResolvedValue(20);
    const { POST } = await import('@/app/api/reports/route');
    expect((await POST(post({ dogId: 'd1', reason: 'spam' }))).status).toBe(429);
    expect(reportCreate).not.toHaveBeenCalled();
  });

  it('passes through a not-found or self-report from target resolution', async () => {
    resolveTargetMock.mockRejectedValue(new FakeSafetyError("You can't do this to yourself", 400));
    const { POST } = await import('@/app/api/reports/route');
    expect((await POST(post({ dogId: 'mine', reason: 'spam' }))).status).toBe(400);
  });
});

describe('/api/blocks', () => {
  it('POST blocks the resolved user, idempotently', async () => {
    blockUpsert.mockResolvedValue({ id: 'b1' });
    const { POST } = await import('@/app/api/blocks/route');
    const res = await POST(post({ conversationId: 'c1' }));
    expect(res.status).toBe(201);
    expect(blockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { blockerId_blockedId: { blockerId: 'me', blockedId: 'them' } },
      }),
    );
  });

  it('GET lists only the caller’s own blocks', async () => {
    blockFindMany.mockResolvedValue([
      { id: 'b1', createdAt: new Date('2026-01-01'), blocked: { name: 'Sam' } },
    ]);
    const { GET } = await import('@/app/api/blocks/route');
    const res = await GET();
    expect(blockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { blockerId: 'me' } }),
    );
    expect((await res.json()).items[0]).toMatchObject({ id: 'b1', userName: 'Sam' });
  });

  it('DELETE only removes a block the caller created', async () => {
    blockDeleteMany.mockResolvedValue({ count: 0 });
    const { DELETE } = await import('@/app/api/blocks/[id]/route');
    const res = await DELETE(new Request('http://x'), { params: Promise.resolve({ id: 'b9' }) });
    expect(blockDeleteMany).toHaveBeenCalledWith({ where: { id: 'b9', blockerId: 'me' } });
    expect(res.status).toBe(404);
    blockDeleteMany.mockResolvedValue({ count: 1 });
    expect(
      (await DELETE(new Request('http://x'), { params: Promise.resolve({ id: 'b1' }) })).status,
    ).toBe(200);
  });
});
