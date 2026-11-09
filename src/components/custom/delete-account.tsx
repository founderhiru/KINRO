// @polsia:user-owned — "Delete account" for the website profile page. The
// same action exists in the mobile app (Profile → Delete account); this page
// is also the web route the privacy policy points to for account deletion.
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api-client';
import { signOut } from '@/lib/auth-client';

export function DeleteAccountCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await apiFetch('/api/account', {
        method: 'DELETE',
        body: JSON.stringify({ confirm: 'DELETE' }),
      });
    } catch {
      setDeleting(false);
      toast.error('We couldn’t delete your account. Please try again.');
      return;
    }
    // The server session is already gone; this clears the browser cookie.
    try {
      await signOut();
    } catch {
      // Nothing left to sign out of.
    }
    setDeleting(false);
    setOpen(false);
    router.replace('/');
    router.refresh();
  }

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg">Delete account</CardTitle>
          <CardDescription>
            Permanently delete your profile, your dogs with their photos and health records, and
            your conversations. This can’t be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => setOpen(true)}>
            Delete my account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Everything tied to your account is removed for good: your profile, your dogs, their
              photos and health records, and your conversations. You will be signed out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={deleting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
