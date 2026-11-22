// Shared mapper from a CareProvider row to the public list item.
type ProviderRow = {
  id: string;
  kind: string;
  name: string;
  qualifications: string | null;
  specialties: string[];
  languages: string[];
  city: string;
  locality: string | null;
  verificationStatus: string;
  verifiedUntil: Date | null;
  offersOnline: boolean;
};

export function toProviderItem(p: ProviderRow) {
  // An expired verification is never shown as verified.
  const expired = p.verifiedUntil !== null && p.verifiedUntil.getTime() < Date.now();
  return {
    id: p.id,
    kind: p.kind === 'clinic' ? ('clinic' as const) : ('vet' as const),
    name: p.name,
    qualifications: p.qualifications,
    specialties: p.specialties,
    languages: p.languages,
    city: p.city,
    locality: p.locality,
    verificationStatus:
      p.verificationStatus === 'verified' && expired ? 'expired' : p.verificationStatus,
    verifiedUntil: p.verifiedUntil ? p.verifiedUntil.toISOString() : null,
    offersOnline: p.offersOnline,
  };
}
