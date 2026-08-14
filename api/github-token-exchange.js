export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const { code, code_verifier, client_id, redirect_uri } = req.body || {};

  if (!code || !code_verifier) {
    res.status(400).json({ error: 'Missing code and code_verifier.' });
    return;
  }

  const clientId = client_id || process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).json({
      error: 'Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET.',
    });
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    code_verifier,
    redirect_uri: redirect_uri || process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/oauth-callback.html',
  });

  try {
    const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await githubResponse.json();

    if (!githubResponse.ok || data.error || !data.access_token) {
      res.status(githubResponse.status || 400).json({
        error: data.error || 'GitHub token exchange failed.',
        details: data,
      });
      return;
    }

    res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Token exchange failed.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
