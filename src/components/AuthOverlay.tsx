import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Database, Server, User } from 'lucide-react';

export const AuthOverlay: React.FC = () => {
  const { auth, signIn, update, signInWithGithubToken, signInWithEmail, startGithubOAuthPKCE } = useAuth();
  const [developerName, setDeveloperName] = useState(auth.developerName || '');
  const [studioName, setStudioName] = useState(auth.studioName || '');
  const [cloudTarget, setCloudTarget] = useState(auth.cloudTarget || '');
  const [databaseEngine, setDatabaseEngine] = useState(auth.databaseEngine || '');

  const [showGithubInput, setShowGithubInput] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [emailAddr, setEmailAddr] = useState('');
  const [loading, setLoading] = useState(false);

  const [clientId, setClientId] = useState('');
  const [tokenExchangeUrl, setTokenExchangeUrl] = useState('');
  const [oauthInProgress, setOauthInProgress] = useState(false);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    signIn({ developerName, studioName, cloudTarget: cloudTarget as any, databaseEngine: databaseEngine as any });
  };

  const onGithubConnect = async () => {
    if (!githubToken) return alert('Please paste a GitHub personal access token (repo scope recommended)');
    setLoading(true);
    try {
      await signInWithGithubToken(githubToken);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert('GitHub authentication failed: ' + ((e as Error).message || e));
    }
  };

  const onEmailSignIn = () => {
    if (!emailAddr) return alert('Please enter an email');
    signInWithEmail(emailAddr);
  };

  const onGoogleSimulate = () => {
    signIn({ provider: 'google', developerName: 'GoogleUser', studioName: 'Google Studio' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl backdrop-glass rounded-2xl border border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0ff] to-[#FF6B00] flex items-center justify-center">
            <span className="font-extrabold text-black">N</span>
          </div>
          <div>
            <h3 className="font-mono font-bold text-zinc-100 text-lg">Welcome to NOVA Studio</h3>
            <p className="text-xs text-zinc-400">Sign in to begin: your local-first, zero-cost, client-side app studio.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <button onClick={onGoogleSimulate} className="col-span-1 bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm">Sign in with Google (Simulate)</button>
          <button onClick={() => setShowGithubInput(s => !s)} className="col-span-1 bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm">Sign in with GitHub (Paste Token)</button>
          <button onClick={() => { const em = prompt('Enter your email'); if (em) signInWithEmail(em); }} className="col-span-1 bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm">Sign in with Email</button>
        </div>

        {showGithubInput && (
          <div className="mb-3">
            <label className="text-[11px] font-mono text-zinc-400 uppercase">GitHub Personal Access Token</label>
            <div className="mt-1 flex items-center gap-2">
              <input className="w-full bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm" value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="ghp_..." />
              <button onClick={onGithubConnect} disabled={loading} className="bg-[#FF6B00] px-3 py-2 rounded-md text-black">Connect</button>
            </div>
            <div className="text-[11px] text-zinc-500 mt-2">Paste a GitHub Personal Access Token to authenticate repository access. Tokens are stored locally only.</div>

            <div className="mt-3 border-t border-zinc-800 pt-3">
              <h4 className="text-[11px] font-mono text-zinc-300 mb-2">Or use OAuth (PKCE)</h4>
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Client ID</label>
              <input className="w-full mt-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md text-sm" value={clientId} onChange={e=>setClientId(e.target.value)} placeholder="GitHub OAuth App client_id" />
              <label className="text-[11px] font-mono text-zinc-400 uppercase mt-2">Token Exchange URL (optional)</label>
              <input className="w-full mt-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md text-sm" value={tokenExchangeUrl} onChange={e=>setTokenExchangeUrl(e.target.value)} placeholder="https://your-proxy.example.com/exchange" />
              <div className="mt-2 flex gap-2">
                <button onClick={async ()=>{
                  if (!clientId) return alert('Please enter client_id');
                  setOauthInProgress(true);
                  try {
                    await startGithubOAuthPKCE(clientId, tokenExchangeUrl || undefined, ['repo']);
                    setOauthInProgress(false);
                  } catch (e:any) {
                    setOauthInProgress(false);
                    alert('OAuth failed: ' + (e.message || e));
                  }
                }} className="px-3 py-2 bg-[#0d0d12] border border-zinc-800 rounded-md text-sm">Start OAuth (PKCE)</button>
                <div className="text-[11px] text-zinc-500">If token exchange is not provided, client-side exchange may fail due to CORS. Provide a small server endpoint to complete exchange securely.</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Developer / Alias</label>
            <div className="mt-1 flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-300" />
              <input className="w-full bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm" value={developerName} onChange={e => setDeveloperName(e.target.value)} />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Studio Name</label>
            <div className="mt-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-zinc-300" />
              <input className="w-full bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm" value={studioName} onChange={e => setStudioName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Cloud Target</label>
            <select value={cloudTarget} onChange={e => setCloudTarget(e.target.value)} className="mt-1 w-full bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm">
              <option value="">Select</option>
              <option>Vercel</option>
              <option>AWS</option>
              <option>Google Cloud</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Database Engine</label>
            <select value={databaseEngine} onChange={e => setDatabaseEngine(e.target.value)} className="mt-1 w-full bg-[#0d0d12] border border-zinc-800 rounded-md p-2 text-sm">
              <option value="">Select</option>
              <option>Postgres</option>
              <option>MongoDB</option>
              <option>MySQL</option>
            </select>
          </div>

          <div className="col-span-2 mt-4 flex items-center gap-3">
            <button type="submit" className="w-full bg-[#FF6B00] text-black rounded-lg p-3 font-bold">Enter NOVA Studio</button>
            <button type="button" onClick={() => update({ developerName: 'Guest', studioName: 'Guest Studio' })} className="px-3 py-2 border border-zinc-800 rounded-md text-sm">Guest</button>
          </div>
        </form>
      </div>
    </div>
  );
};
