# NOVA scaffold scripts
Run `npm run scaffold` to re-run the scaffold. Backups of overwritten files are stored in .nova-stash/

## GitHub OAuth PKCE proxy
The client app supports GitHub OAuth PKCE, but GitHub direct token exchange from the browser is often blocked by CORS. To complete the flow securely, deploy this small proxy and provide its URL in the AuthOverlay `Token Exchange URL` field.

### Local dev proxy
```bash
GITHUB_CLIENT_ID=your_client_id \
GITHUB_CLIENT_SECRET=your_client_secret \
node scripts/github-token-exchange.js
```
Then test the health endpoint:
```bash
curl http://localhost:3001/health
```

The exchange endpoint accepts JSON payloads like:
```json
{
  "code": "your_oauth_code",
  "code_verifier": "generated_pkce_verifier",
  "client_id": "your_client_id",
  "redirect_uri": "http://localhost:5173/oauth-callback.html"
}
```

It returns:
```json
{
  "access_token": "gho_xxx",
  "token_type": "bearer",
  "scope": "repo"
}
```

### Deploy to Vercel
Create a serverless function at `api/github-token-exchange.js` (already included) and set the following Environment Variables in your Vercel project:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- Optionally `GITHUB_REDIRECT_URI` (defaults to `http://localhost:5173/oauth-callback.html` during local dev)

Then configure the GitHub OAuth app Authorization callback URL to point to `https://<your-vercel-deploy>/oauth-callback.html` (or the hosted callback page you choose). In the NOVA app Auth UI, paste your `client_id` and the proxy URL (e.g., `https://<your-vercel-deploy>/api/github-token-exchange`) under "Token Exchange URL" before starting OAuth.

Vercel example steps:
1. Create a new Vercel project and point it to this repository.
2. Add environment variables in Vercel settings: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
3. Deploy. The serverless function `api/github-token-exchange.js` will handle the PKCE code exchange securely.

### Deploy to Netlify
You can also deploy the proxy as a Netlify Function. Create `netlify/functions/github-token-exchange.js` with the same handler logic and set the environment variables in Netlify's site settings.

### Local dev
Run the proxy locally for development:

```bash
GITHUB_CLIENT_ID=your_client_id \
GITHUB_CLIENT_SECRET=your_client_secret \
node scripts/github-token-exchange.js
```

Test the health endpoint:

```bash
curl http://localhost:3001/health
```

### Continuous dev flow (recommended)
Run two terminal tabs during development:

Terminal 1 (dev server):
  npm run dev

Terminal 2 (proxy):
  GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=yyy npm run proxy:github

### Recommended security notes
- Never expose `GITHUB_CLIENT_SECRET` in the browser.
- Keep all token exchange on the server side.
- Use a dedicated GitHub OAuth app for NOVA Studio.
- Store only the resulting `access_token` in browser localStorage for the current app session.
