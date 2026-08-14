// Lightweight, repository-side Codebase Matrix helper (first iteration).
// Exposes helpers that return a bundle of files to create/patch for a given "intent".

export type FileBundle = Record<string, string>;

export function generateStripeSubscriptionBundle(): FileBundle {
  const checkout = `import React from 'react';

export default function StripeCheckout() {
  return (
    <div className="p-4 bg-[#0b0b0d] rounded-lg border border-zinc-800">
      <h3 className="text-sm font-bold text-zinc-100">Subscribe to Nova Pro</h3>
      <p className="text-xs text-zinc-400 mt-1">Recurring billing (client-only demo). Replace with server-side Stripe integration for production.</p>
      <div className="mt-3">
        <button className="px-4 py-2 rounded-md bg-[#FF6B00] text-black font-bold">Start Free Trial</button>
      </div>
    </div>
  );
}
`;

  const server = `// Simulated server API handler for checkout (client-side preview only).
export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(()=>({}));
    return new Response(JSON.stringify({ ok: true, note: 'Simulated checkout created', payload }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}
`;

  const dbNote = `// To complete Stripe integration add the following optional fields to your Subscription model:
//   stripeSubscriptionId String?
//   priceId String?
// Edit src/database/schema.ts (or prisma/schema.prisma) to include these fields so that subscriptions can be linked to Stripe sessions.
`;

  return {
    'src/components/StripeCheckout.tsx': checkout,
    'src/server_stripe_api.ts': server,
    'src/database/stripe_fields_note.txt': dbNote
  };
}

export function applyIntent(intent: string): FileBundle {
  if (intent === 'add_stripe_subscription') return generateStripeSubscriptionBundle();
  return {};
}
