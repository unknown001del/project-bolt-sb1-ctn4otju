import React, { createContext, useContext, useEffect, useState } from 'react';

type CloudTarget = 'Vercel' | 'AWS' | 'Google Cloud' | '';
export interface GithubUser { login: string; avatar_url?: string; name?: string; }
export interface AuthState {
  signedIn: boolean;
  developerName: string;
  studioName: string;
  cloudTarget: CloudTarget;
  databaseEngine: 'Postgres' | 'MongoDB' | 'MySQL' | '';
  provider?: 'google' | 'github' | 'email' | '';
  githubToken?: string | null;
  githubUser?: GithubUser | null;
  email?: string | null;
}

const DEFAULT_STATE: AuthState = {
  signedIn: false,
  developerName: '',
  studioName: '',
  cloudTarget: '',
  databaseEngine: '',
  provider: '',
  githubToken: null,
  githubUser: null,
  email: null
};

interface AuthContextProps {
  auth: AuthState;
  signIn: (payload: Partial<AuthState>) => void;
  signOut: () => void;
  update: (patch: Partial<AuthState>) => void;
  signInWithGithubToken: (token: string) => Promise<void>;
  signInWithEmail: (email: string, name?: string) => void;
  startGithubOAuthPKCE: (clientId: string, tokenExchangeUrl?: string, scopes?: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem('nova_auth_v1');
      return raw ? JSON.parse(raw) as AuthState : DEFAULT_STATE;
    } catch (e) {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nova_auth_v1', JSON.stringify(auth));
    } catch (e) {
      // ignore
    }
  }, [auth]);

  const signIn = (payload: Partial<AuthState>) => setAuth(prev => ({ ...prev, ...payload, signedIn: true } as AuthState));
  const signOut = () => setAuth(DEFAULT_STATE);
  const update = (patch: Partial<AuthState>) => setAuth(prev => ({ ...prev, ...patch }));

  const signInWithGithubToken = async (token: string) => {
    try {
      const res = await fetch('https://api.github.com/user', { headers: { Authorization: `token ${token}` } });
      if (!res.ok) throw new Error('Invalid token');
      const user = await res.json();
      const payload: Partial<AuthState> = { provider: 'github', githubToken: token, githubUser: { login: user.login, avatar_url: user.avatar_url, name: user.name }, developerName: user.name || user.login, studioName: user.login };
      signIn(payload);
    } catch (e) {
      console.error('GitHub sign-in failed', e);
      throw e;
    }
  };

  // PKCE helpers
  function base64urlencode(str: ArrayBuffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str) as unknown as number[]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async function sha256(plain: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return digest;
  }

  const startGithubOAuthPKCE = async (clientId: string, tokenExchangeUrl?: string, scopes: string[] = ['repo']) => {
    // Generate code_verifier and code_challenge
    const code_verifier = Array.from(crypto.getRandomValues(new Uint8Array(64))).map(b => ('0' + b.toString(16)).slice(-2)).join('');
    const hashed = await sha256(code_verifier);
    const code_challenge = base64urlencode(hashed);
    const state = Math.random().toString(36).slice(2);

    // store verifier/state to sessionStorage
    sessionStorage.setItem('nova_oauth_pkce_code_verifier', code_verifier);
    sessionStorage.setItem('nova_oauth_pkce_state', state);
    sessionStorage.setItem('nova_oauth_pkce_token_exchange_url', tokenExchangeUrl || '');
    sessionStorage.setItem('nova_oauth_pkce_client_id', clientId || '');

    const redirectUri = `${window.location.origin}/oauth-callback.html`;
    const scope = encodeURIComponent((scopes || ['repo']).join(' '));
    const authUrl = `https://github.com/login/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&code_challenge=${encodeURIComponent(code_challenge)}&code_challenge_method=S256`;

    // Open popup
    const popup = window.open(authUrl, 'github_oauth', 'width=900,height=700');

    if (!popup) throw new Error('Unable to open popup');

    // Listen for postMessage from oauth-callback.html
    return new Promise<void>((resolve, reject) => {
      const onMessage = async (ev: MessageEvent) => {
        try {
          if (!ev.data || ev.data.type !== 'oauth_callback') return;
          const { code, state: returnedState } = ev.data;
          const expectedState = sessionStorage.getItem('nova_oauth_pkce_state');
          if (returnedState !== expectedState) throw new Error('Invalid state');
          // retrieve verifier and tokenExchangeUrl
          const verifier = sessionStorage.getItem('nova_oauth_pkce_code_verifier') || '';
          const tokenExchange = sessionStorage.getItem('nova_oauth_pkce_token_exchange_url') || '';
          const client_id = sessionStorage.getItem('nova_oauth_pkce_client_id') || '';

          // If tokenExchangeUrl provided, POST to it and expect { access_token }
          if (tokenExchange) {
            try {
              const res = await fetch(tokenExchange, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, code_verifier: verifier, client_id })
              });
              const data = await res.json();
              if (!data.access_token) throw new Error('No access_token returned from token exchange');
              await signInWithGithubToken(data.access_token);
              window.removeEventListener('message', onMessage);
              resolve();
              return;
            } catch (ex) {
              console.error('Token exchange failed', ex);
              reject(ex);
              return;
            }
          }

          // Else: attempt client-side exchange (may fail due to CORS), GitHub expects client_secret normally
          try {
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ client_id, code, code_verifier: verifier, redirect_uri: `${window.location.origin}/oauth-callback.html` })
            });
            const tokenData = await tokenRes.json();
            if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
            if (!tokenData.access_token) throw new Error('No access_token returned');
            await signInWithGithubToken(tokenData.access_token);
            window.removeEventListener('message', onMessage);
            resolve();
            return;
          } catch (ex) {
            console.error('Direct token exchange failed (likely CORS). Provide a tokenExchangeUrl to complete server-side exchange.', ex);
            reject(ex);
            return;
          }
        } catch (e) {
          window.removeEventListener('message', onMessage);
          reject(e);
        }
      };
      window.addEventListener('message', onMessage);

      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', onMessage);
          reject(new Error('Popup closed by user before completing authentication'));
        }
      }, 500);
    });
  };

  const signInWithEmail = (email: string, name?: string) => {
    signIn({ provider: 'email', email, developerName: name || email.split('@')[0], studioName: name || 'Studio' });
  };

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut, update, signInWithGithubToken, signInWithEmail, startGithubOAuthPKCE }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
