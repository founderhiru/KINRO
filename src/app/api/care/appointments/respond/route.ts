// KINRO Care — the page a vet opens from the request email. GET shows the
// request and two buttons (so email link scanners can't answer by accident);
// POST records the answer. The signed token is the only credential.
import 'server-only';

import { NextResponse } from 'next/server';
import { verifyResponseToken } from '@/lib/care/appointment-response';
import { MEETING_LINK_HELP, parseMeetingUrl } from '@/lib/care/meeting-link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function page(body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>KINRO visit request</title></head><body style="font-family:system-ui,sans-serif;background:#FBF8F3;color:#262A28;margin:0;padding:24px"><main style="max-width:440px;margin:40px auto;background:#fff;border-radius:20px;padding:24px">${body}</main></body></html>`,
    {
      status,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    },
  );
}

async function load(token: string | null) {
  const id = token ? verifyResponseToken(token) : null;
  if (!id) return null;
  return prisma.careAppointment.findUnique({
    where: { id },
    include: { relationship: { include: { provider: true, dog: true } } },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const appt = await load(token);
  if (!appt || !token)
    return page('<h1>This link has expired</h1><p>Ask the owner to send a new request.</p>', 410);
  if (appt.status !== 'requested') {
    return page(`<h1>Already ${esc(appt.status)}</h1><p>This request has been answered.</p>`);
  }
  return page(requestForm(token, appt));
}

function requestForm(
  token: string,
  appt: { mode: string; relationship: { dog: { name: string; breed: string; ageYears: number } } },
  error?: string,
) {
  const dog = appt.relationship.dog;
  const online = appt.mode === 'online';
  return `<h1 style="font-size:20px">${online ? 'Online consultation' : 'Visit'} request for ${esc(dog.name)}</h1>
<p>${esc(dog.breed)}, ${dog.ageYears} yr</p>${
    error ? `<p style="color:#9B2C2C;font-weight:600">${esc(error)}</p>` : ''
  }
<form method="post" style="margin-top:20px">
<input type="hidden" name="token" value="${esc(token)}">${
    online
      ? `<label style="display:block;font-weight:600;margin-bottom:6px" for="meetingUrl">Video-call link (needed to confirm)</label>
<input id="meetingUrl" name="meetingUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://meet.google.com/..." style="width:100%;box-sizing:border-box;min-height:48px;border:1px solid #ccc;border-radius:12px;padding:0 12px;font-size:16px">
<p style="font-size:13px;color:#555;margin:6px 0 16px">${esc(MEETING_LINK_HELP)} KINRO does not host or record the call.</p>`
      : ''
  }
<div style="display:flex;gap:12px">
<button name="action" value="confirm" style="flex:1;min-height:52px;border:0;border-radius:12px;background:#2F6B4F;color:#fff;font-weight:700;font-size:16px">Confirm</button>
<button name="action" value="decline" formnovalidate style="flex:1;min-height:52px;border:1px solid #ddd;border-radius:12px;background:#fff;font-weight:700;font-size:16px">Decline</button>
</div>
</form>`;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get('token') ?? '');
  const action = form.get('action');
  const appt = await load(token);
  if (!appt) return page('<h1>This link has expired</h1>', 410);
  if (action !== 'confirm' && action !== 'decline') return page('<h1>Unknown action</h1>', 400);
  let meetingUrl: string | null = null;
  if (action === 'confirm' && appt.mode === 'online' && appt.status === 'requested') {
    meetingUrl = parseMeetingUrl(form.get('meetingUrl'));
    if (!meetingUrl) {
      return page(
        requestForm(token, appt, `Please paste a valid video-call link. ${MEETING_LINK_HELP}`),
        400,
      );
    }
  }
  if (appt.status === 'requested') {
    await prisma.careAppointment.update({
      where: { id: appt.id },
      data: {
        status: action === 'confirm' ? 'confirmed' : 'declined',
        ...(meetingUrl ? { meetingUrl } : {}),
      },
    });
  }
  return page(
    action === 'confirm'
      ? meetingUrl
        ? '<h1>Confirmed</h1><p>Thank you. The owner will see a Join video call button with your link. Please also contact them on the number in the email to agree the time.</p>'
        : '<h1>Confirmed</h1><p>Thank you. Please contact the owner on the number in the email to agree the time.</p>'
      : '<h1>Declined</h1><p>The owner will see that this request was declined.</p>',
  );
}
