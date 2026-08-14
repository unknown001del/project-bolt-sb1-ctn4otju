import React from 'react';

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
