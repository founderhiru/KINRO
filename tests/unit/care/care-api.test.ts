// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const sendEmailMock = vi.fn();
vi.mock('@/lib/care/appointment-response', () => ({
  sendProviderRequestEmail: sendEmailMock,
}));

class FakeAuthError extends Error {
  readonly status = 401;
}
const requireAuthenticatedUserMock = vi.fn();
vi.mock('@/lib/auth', () => ({
  AuthError: FakeAuthError,
  requireAuthenticatedUser: requireAuthenticatedUserMock,
}));

const db = {
  dogProfile: { findUnique: vi.fn() },
  careProvider: { findUnique: vi.fn(), findMany: vi.fn() },
  careRelationship: { upsert: vi.fn(), findMany: vi.fn() },
  careAppointment: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
};
vi.mock('@/lib/db', () => ({ prisma: db }));

const USER = { id: 'user_a' };
const post = (body: unknown) =>
  new Request('http://x/api/care/appointments', { method: 'POST', body: JSON.stringify(body) });
const valid = {
  providerId: 'prov_1',
  dogId: 'dog_1',
  mode: 'in_person',
  reason: 'check_up',
  ownerPhone: '+91 98765 43210',
};

beforeEach(() => {
  requireAuthenticatedUserMock.mockReset().mockResolvedValue(USER);
  sendEmailMock.mockReset().mockResolvedValue(undefined);
  for (const group of Object.values(db)) for (const fn of Object.values(group)) fn.mockReset();
});

describe('POST /api/care/appointments', () => {
  it('401 when signed out', async () => {
    requireAuthenticatedUserMock.mockRejectedValue(new FakeAuthError('Authentication required'));
    const { POST } = await import('@/app/api/care/appointments/route');
    expect((await POST(post(valid))).status).toBe(401);
  });

  it('400 on invalid body', async () => {
    const { POST } = await import('@/app/api/care/appointments/route');
    expect((await POST(post({ ...valid, mode: 'video' }))).status).toBe(400);
  });

  it("404 when the dog isn't the caller's", async () => {
    db.dogProfile.findUnique.mockResolvedValue({ id: 'dog_1', ownerId: 'someone_else' });
    const { POST } = await import('@/app/api/care/appointments/route');
    expect((await POST(post(valid))).status).toBe(404);
    expect(db.careAppointment.create).not.toHaveBeenCalled();
  });

  it('404 for unpublished or suspended providers', async () => {
    db.dogProfile.findUnique.mockResolvedValue({ id: 'dog_1', ownerId: USER.id });
    const { POST } = await import('@/app/api/care/appointments/route');
    db.careProvider.findUnique.mockResolvedValue({
      listingStatus: 'draft',
      verificationStatus: 'verified',
    });
    expect((await POST(post(valid))).status).toBe(404);
    db.careProvider.findUnique.mockResolvedValue({
      listingStatus: 'published',
      verificationStatus: 'suspended',
    });
    expect((await POST(post(valid))).status).toBe(404);
  });

  it('rejects online booking when the provider has not opted in', async () => {
    db.dogProfile.findUnique.mockResolvedValue({ id: 'dog_1', ownerId: USER.id });
    db.careProvider.findUnique.mockResolvedValue({
      listingStatus: 'published',
      verificationStatus: 'verified',
      offersOnline: false,
      contactEmail: 'vet@example.com',
    });
    const { POST } = await import('@/app/api/care/appointments/route');
    const res = await POST(post({ ...valid, mode: 'online' }));
    expect(res.status).toBe(400);
    expect(db.careAppointment.create).not.toHaveBeenCalled();
  });

  it('creates the relationship and a requested appointment; shares nothing', async () => {
    db.dogProfile.findUnique.mockResolvedValue({ id: 'dog_1', ownerId: USER.id });
    db.careProvider.findUnique.mockResolvedValue({
      listingStatus: 'published',
      verificationStatus: 'verified',
      offersOnline: true,
      contactEmail: 'vet@example.com',
      name: 'Paws',
    });
    db.dogProfile.findUnique.mockResolvedValue({
      id: 'dog_1',
      ownerId: USER.id,
      name: 'Bodhi',
      breed: 'Lab',
      ageYears: 3,
    });
    db.careRelationship.upsert.mockResolvedValue({ id: 'rel_1' });
    db.careAppointment.create.mockResolvedValue({ id: 'appt_1', status: 'requested' });
    const { POST } = await import('@/app/api/care/appointments/route');
    const res = await POST(post({ ...valid, mode: 'online' }));
    expect(res.status).toBe(201);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'vet@example.com', ownerPhone: '+91 98765 43210' }),
    );
    expect(db.careRelationship.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { ownerId: USER.id, dogId: 'dog_1', providerId: 'prov_1' },
      }),
    );
  });
});

describe('POST /api/care/appointments: delivery', () => {
  const post = (b: unknown) => new Request('http://x', { method: 'POST', body: JSON.stringify(b) });
  const setup = (contactEmail: string | null) => {
    db.dogProfile.findUnique.mockResolvedValue({
      id: 'dog_1',
      ownerId: USER.id,
      name: 'B',
      breed: 'L',
      ageYears: 2,
    });
    db.careProvider.findUnique.mockResolvedValue({
      listingStatus: 'published',
      verificationStatus: 'verified',
      offersOnline: false,
      contactEmail,
      name: 'Paws',
    });
    db.careRelationship.upsert.mockResolvedValue({ id: 'rel_1' });
    db.careAppointment.create.mockResolvedValue({ id: 'appt_1', status: 'requested' });
  };

  it('refuses a provider that cannot receive requests', async () => {
    setup(null);
    const { POST } = await import('@/app/api/care/appointments/route');
    expect((await POST(post(valid))).status).toBe(400);
    expect(db.careAppointment.create).not.toHaveBeenCalled();
  });

  it('removes the request and returns 502 when the email cannot be sent', async () => {
    setup('vet@example.com');
    sendEmailMock.mockRejectedValue(new Error('down'));
    (db.careAppointment as Record<string, ReturnType<typeof vi.fn>>).delete = vi.fn();
    const { POST } = await import('@/app/api/care/appointments/route');
    expect((await POST(post(valid))).status).toBe(502);
    expect(db.careAppointment.delete).toHaveBeenCalled();
  });
});

describe('PATCH /api/care/appointments/[id]', () => {
  const patch = (body: unknown) =>
    new Request('http://x', { method: 'PATCH', body: JSON.stringify(body) });
  const ctx = { params: Promise.resolve({ id: 'appt_1' }) };

  it("404 for another owner's appointment", async () => {
    db.careAppointment.findUnique.mockResolvedValue({
      status: 'requested',
      relationship: { ownerId: 'x' },
    });
    const { PATCH } = await import('@/app/api/care/appointments/[id]/route');
    expect((await PATCH(patch({ status: 'cancelled' }), ctx)).status).toBe(404);
  });

  it('only allows cancelling', async () => {
    const { PATCH } = await import('@/app/api/care/appointments/[id]/route');
    expect((await PATCH(patch({ status: 'confirmed' }), ctx)).status).toBe(400);
  });

  it('409 once completed; cancels a requested one', async () => {
    const { PATCH } = await import('@/app/api/care/appointments/[id]/route');
    db.careAppointment.findUnique.mockResolvedValue({
      status: 'completed',
      relationship: { ownerId: USER.id },
    });
    expect((await PATCH(patch({ status: 'cancelled' }), ctx)).status).toBe(409);
    db.careAppointment.findUnique.mockResolvedValue({
      status: 'requested',
      relationship: { ownerId: USER.id },
    });
    db.careAppointment.update.mockResolvedValue({ id: 'appt_1', status: 'cancelled' });
    expect((await PATCH(patch({ status: 'cancelled' }), ctx)).status).toBe(200);
  });
});

describe('GET /api/care/connections', () => {
  it('401 when signed out; scopes to the caller', async () => {
    const { GET } = await import('@/app/api/care/connections/route');
    db.careRelationship.findMany.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(db.careRelationship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ownerId: USER.id, status: 'active' } }),
    );
    requireAuthenticatedUserMock.mockRejectedValue(new FakeAuthError('Authentication required'));
    expect((await GET()).status).toBe(401);
  });
});

describe('GET /api/care/providers', () => {
  it('lists only published, non-suspended providers and never exposes registration numbers', async () => {
    db.careProvider.findMany.mockResolvedValue([
      {
        id: 'p1',
        kind: 'vet',
        name: 'Dr A',
        qualifications: null,
        specialties: [],
        languages: [],
        city: 'Hyderabad',
        locality: null,
        verificationStatus: 'verified',
        verifiedUntil: new Date('2020-01-01'),
        offersOnline: false,
        registrationLast4: '4821',
      },
    ]);
    const { GET } = await import('@/app/api/care/providers/route');
    const res = await GET(new Request('http://x/api/care/providers?kind=vet'));
    const json = await res.json();
    expect(db.careProvider.findMany.mock.calls[0][0].where).toMatchObject({
      listingStatus: 'published',
      kind: 'vet',
    });
    expect(json.items[0].verificationStatus).toBe('expired');
    expect(JSON.stringify(json)).not.toContain('4821');
  });
});
