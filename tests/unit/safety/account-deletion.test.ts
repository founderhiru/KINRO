// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const userFindUnique = vi.fn();
const dogFindMany = vi.fn();
const dogDeleteMany = vi.fn((arg: unknown) => ({ op: 'dogs', arg }));
const verificationDeleteMany = vi.fn((arg: unknown) => ({ op: 'verification', arg }));
const userDelete = vi.fn((arg: unknown) => ({ op: 'user', arg }));
const transaction = vi.fn().mockResolvedValue([]);
vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: userFindUnique, delete: userDelete },
    dogProfile: { findMany: dogFindMany, deleteMany: dogDeleteMany },
    verification: { deleteMany: verificationDeleteMany },
    $transaction: transaction,
  },
}));
const deletePublic = vi.fn();
const deletePrivate = vi.fn();
vi.mock('@/lib/storage', () => ({
  deletePublicObject: deletePublic,
  deletePrivateObject: deletePrivate,
}));

beforeEach(() => {
  for (const m of [userFindUnique, dogFindMany, transaction, deletePublic, deletePrivate])
    m.mockReset();
  transaction.mockResolvedValue([]);
  userFindUnique.mockResolvedValue({ email: 'a@b.com', phoneNumber: '+919999999999' });
  dogFindMany.mockResolvedValue([
    {
      id: 'd1',
      photos: [{ storageKey: 'p1' }, { storageKey: 'p2' }],
      healthRecords: [{ documents: [{ storageKey: 'doc1' }] }],
    },
  ]);
});

describe('deleteAccount', () => {
  it('deletes dogs, sign-in codes and the user in one transaction, then the files', async () => {
    const { deleteAccount } = await import('@/lib/account-deletion');
    await deleteAccount('u1');

    expect(dogDeleteMany).toHaveBeenCalledWith({ where: { ownerId: 'u1' } });
    expect(verificationDeleteMany).toHaveBeenCalledWith({
      where: { identifier: { in: ['a@b.com', '+919999999999'] } },
    });
    expect(userDelete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deletePublic.mock.calls.map((c) => c[0])).toEqual(['p1', 'p2']);
    expect(deletePrivate.mock.calls.map((c) => c[0])).toEqual(['doc1']);
  });

  it('still succeeds if a stored file cannot be deleted', async () => {
    deletePublic.mockRejectedValue(new Error('r2 down'));
    const { deleteAccount } = await import('@/lib/account-deletion');
    await expect(deleteAccount('u1')).resolves.toBeUndefined();
  });

  it('does not touch storage if the database delete fails', async () => {
    transaction.mockRejectedValue(new Error('db'));
    const { deleteAccount } = await import('@/lib/account-deletion');
    await expect(deleteAccount('u1')).rejects.toThrow('db');
    expect(deletePublic).not.toHaveBeenCalled();
    expect(deletePrivate).not.toHaveBeenCalled();
  });

  it('does nothing for a user that no longer exists', async () => {
    userFindUnique.mockResolvedValue(null);
    const { deleteAccount } = await import('@/lib/account-deletion');
    await deleteAccount('gone');
    expect(transaction).not.toHaveBeenCalled();
  });
});
