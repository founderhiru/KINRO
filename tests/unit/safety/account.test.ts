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
const deleteAccountMock = vi.fn();
vi.mock('@/lib/account-deletion', () => ({ deleteAccount: deleteAccountMock }));

const req = (body: unknown) =>
  new Request('http://x/api/account', { method: 'DELETE', body: JSON.stringify(body) });

beforeEach(() => {
  requireAuthenticatedUserMock.mockReset();
  deleteAccountMock.mockReset();
});

describe('DELETE /api/account', () => {
  it('401 when signed out, and deletes nothing', async () => {
    requireAuthenticatedUserMock.mockRejectedValue(new FakeAuthError('Authentication required'));
    const { DELETE } = await import('@/app/api/account/route');
    expect((await DELETE(req({ confirm: 'DELETE' }))).status).toBe(401);
    expect(deleteAccountMock).not.toHaveBeenCalled();
  });

  it('400 without the confirmation word', async () => {
    requireAuthenticatedUserMock.mockResolvedValue({ id: 'u1' });
    const { DELETE } = await import('@/app/api/account/route');
    expect((await DELETE(req({}))).status).toBe(400);
    expect((await DELETE(req({ confirm: 'yes' }))).status).toBe(400);
    expect(deleteAccountMock).not.toHaveBeenCalled();
  });

  it('deletes the SESSION user, never a client-supplied id', async () => {
    requireAuthenticatedUserMock.mockResolvedValue({ id: 'u1' });
    deleteAccountMock.mockResolvedValue(undefined);
    const { DELETE } = await import('@/app/api/account/route');
    const res = await DELETE(req({ confirm: 'DELETE', userId: 'someone-else' }));
    expect(res.status).toBe(200);
    expect(deleteAccountMock).toHaveBeenCalledWith('u1');
  });

  it('500 when deletion throws', async () => {
    requireAuthenticatedUserMock.mockResolvedValue({ id: 'u1' });
    deleteAccountMock.mockRejectedValue(new Error('db'));
    const { DELETE } = await import('@/app/api/account/route');
    expect((await DELETE(req({ confirm: 'DELETE' }))).status).toBe(500);
  });
});
