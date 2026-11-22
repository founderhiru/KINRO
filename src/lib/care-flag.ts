// KINRO Care is shown on the marketing site only when this is "true". The home
// page may describe only what the product does today, so keep it unset until
// Care is live for real users (set NEXT_PUBLIC_CARE_LIVE=true on Render).
export const careLive = process.env.NEXT_PUBLIC_CARE_LIVE === 'true';
