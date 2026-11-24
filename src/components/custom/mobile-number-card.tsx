'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient, useSession } from '@/lib/auth-client';
import { describeAddPhoneError, normalizeIndianPhone, PHONE_LOGIN_ENABLED } from '@/lib/phone';

type Step = 'number' | 'code';

// Adds a verified mobile number to the signed-in account, so signing in by phone
// later opens THIS account (and its dogs and records) instead of creating a
// second one. Hidden until mobile-number sign-in is switched on.
export function MobileNumberCard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>('number');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!PHONE_LOGIN_ENABLED || !session?.user) return null;

  const current = session.user.phoneNumber;
  if (current && session.user.phoneNumberVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mobile number</CardTitle>
          <CardDescription>
            {current} is part of your account. You can log in with it.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const normalized = normalizeIndianPhone(phone);

  async function sendCode() {
    setBusy(true);
    setError(null);
    const { error: sendError } = await authClient.phoneNumber.sendOtp({ phoneNumber: normalized });
    setBusy(false);
    if (sendError) {
      setError(describeAddPhoneError(sendError.code));
      return;
    }
    setCode('');
    setStep('code');
  }

  async function verify() {
    setBusy(true);
    setError(null);
    const { error: verifyError } = await authClient.phoneNumber.verify({
      phoneNumber: normalized,
      code,
      updatePhoneNumber: true,
    });
    setBusy(false);
    if (verifyError) {
      setError(describeAddPhoneError(verifyError.code));
      setCode('');
      return;
    }
    toast.success('Mobile number added to your account');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add your mobile number</CardTitle>
        <CardDescription>
          Add it to this account so you can also log in with it. Your dogs and records stay together
          in one account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {step === 'number' ? (
          <>
            <Label htmlFor="add-phone">Mobile number</Label>
            <Input
              id="add-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button disabled={busy || phone.trim().length < 10} onClick={sendCode}>
              {busy ? 'Sending…' : 'Send code'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to <span className="font-medium">{normalized}</span>.
            </p>
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button disabled={busy || code.length !== 6} onClick={verify}>
              {busy ? 'Verifying…' : 'Verify and add'}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setStep('number')}>
              Change number
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
