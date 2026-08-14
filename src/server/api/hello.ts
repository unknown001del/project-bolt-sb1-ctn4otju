export async function GET() {
  return new Response(JSON.stringify({ message: 'Hello from NOVA API (simulated)' }), { status: 200 });
}
