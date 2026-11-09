// @polsia:user-owned — DELETE /api/account: permanently deletes the signed-in
// user's account and data (App Store / Play account-deletion requirement).
// Identity always comes from the session; the body only carries a literal
// confirmation word so a stray request can't delete anything.
import 'server-only';

import { NextResponse } from 'next/server';
import { deleteAccount } from '@/lib/account-deletion';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';
import { AccountDeleteWrite } from '@/lib/contracts/safety';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const parsed = AccountDeleteWrite.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
    }
    await deleteAccount(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unable to delete your account' }, { status: 500 });
  }
}
