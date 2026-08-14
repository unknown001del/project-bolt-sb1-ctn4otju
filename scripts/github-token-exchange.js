const http = require('http');

const PORT = Number(process.env.PORT || 3001);
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const DEFAULT_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/oauth-callback.html';

const readBody = async (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
  });
  req.on('end', () => resolve(raw));
  req.on('error', reject);
});

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.url === '/health') {
    sendJson(res, 200, { ok: true, service: 'nova-github-token-exchange' });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const { code, code_verifier, client_id, redirect_uri } = payload;

    if (!code || !code_verifier) {
      sendJson(res, 400, { error: 'Missing required values: code and code_verifier.' });
      return;
    }

    const resolvedClientId = client_id || GITHUB_CLIENT_ID;
    if (!resolvedClientId) {
      sendJson(res, 400, { error: 'Missing GITHUB_CLIENT_ID. Set it in the environment or send client_id in the request.' });
      return;
    }

    if (!GITHUB_CLIENT_SECRET) {
      sendJson(res, 500, { error: 'Missing GITHUB_CLIENT_SECRET in environment. This proxy must be hosted with a server-side secret.' });
      return;
    }

    const form = new URLSearchParams({
      client_id: resolvedClientId,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      code_verifier,
      redirect_uri: redirect_uri || DEFAULT_REDIRECT_URI,
    });

    const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const data = await githubResponse.json();

    if (!githubResponse.ok || data.error || !data.access_token) {
      sendJson(res, githubResponse.status || 400, {
        error: data.error || 'GitHub token exchange failed.',
        details: data,
      });
      return;
    }

    sendJson(res, 200, {
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
    });
  } catch (error) {
    console.error('GitHub token exchange failed:', error);
    sendJson(res, 500, {
      error: 'Internal server error while exchanging code for access token.',
      message: error?.message || 'Unknown error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`NOVA GitHub token exchange proxy running on http://localhost:${PORT}`);
  console.log('Required env vars: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET');
  console.log('Optional: GITHUB_REDIRECT_URI (default: http://localhost:5173/oauth-callback.html)');
});
