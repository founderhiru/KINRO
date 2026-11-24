// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { findUnique, update, verify } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  verify: vi.fn(),
}));
vi.mock('@/lib/db', () => ({ prisma: { careAppointment: { findUnique, update } } }));
vi.mock('@/lib/care/appointment-response', () => ({ verifyResponseToken: verify }));

import { GET, POST } from '@/app/api/care/appointments/respond/route';

const appt = (mode: 'online' | 'in_person', status = 'requested') => ({
  id: 'a1',
  mode,
  status,
  relationship: { dog: { name: 'Bruno', breed: 'Labrador', ageYears: 3 }, provider: {} },
});

const post = (fields: Record<string, string>) => {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  return POST(
    new Request('https://kinro.test/api/care/appointments/respond', { method: 'POST', body }),
  );
};

describe('vet response page: online consultations', () => {
  beforeEach(() => {
    findUnique.mockReset();
    update.mockReset();
    verify.mockReset();
    verify.mockReturnValue('a1');
  });

  it('asks for a video link on an online request', async () => {
    findUnique.mockResolvedValue(appt('online'));
    const html = await (await GET(new Request('https://kinro.test/x?token=t'))).text();
    expect(html).toContain('name="meetingUrl"');
    expect(html).toContain('Online consultation request');
  });

  it('does not ask for one on an in-person request', async () => {
    findUnique.mockResolvedValue(appt('in_person'));
    const html = await (await GET(new Request('https://kinro.test/x?token=t'))).text();
    expect(html).not.toContain('meetingUrl');
  });

  it('confirms an online request and stores the link', async () => {
    findUnique.mockResolvedValue(appt('online'));
    const res = await post({
      token: 't',
      action: 'confirm',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
    });
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: { status: 'confirmed', meetingUrl: 'https://meet.google.com/abc-defg-hij' },
    });
  });

  it('refuses to confirm an online request without a valid link', async () => {
    findUnique.mockResolvedValue(appt('online'));
    for (const meetingUrl of ['', 'https://example.com/call', 'http://meet.google.com/a']) {
      const res = await post({ token: 't', action: 'confirm', meetingUrl });
      expect(res.status).toBe(400);
      expect(await res.text()).toContain('valid video-call link');
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('lets the vet decline an online request without a link', async () => {
    findUnique.mockResolvedValue(appt('online'));
    const res = await post({ token: 't', action: 'decline' });
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ where: { id: 'a1' }, data: { status: 'declined' } });
  });

  it('confirms an in-person request exactly as before', async () => {
    findUnique.mockResolvedValue(appt('in_person'));
    await post({ token: 't', action: 'confirm' });
    expect(update).toHaveBeenCalledWith({ where: { id: 'a1' }, data: { status: 'confirmed' } });
  });

  it('never changes an already answered request', async () => {
    findUnique.mockResolvedValue(appt('online', 'confirmed'));
    await post({
      token: 't',
      action: 'confirm',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects a bad token', async () => {
    verify.mockReturnValue(null);
    expect((await post({ token: 'x', action: 'confirm' })).status).toBe(410);
  });
});
