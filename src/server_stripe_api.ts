// Simulated server API handler for Stripe checkout (client-only placeholder).
export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(()=>({}));
    return new Response(JSON.stringify({ ok: true, note: 'Simulated checkout created', payload }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}
