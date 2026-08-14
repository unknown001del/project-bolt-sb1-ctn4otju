import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MonacoDiffModal from './MonacoDiffModal';
import { useEditor } from '../context/EditorContext';

export const GithubBrowser: React.FC = () => {
  const { auth } = useAuth();
  const token = auth.githubToken;

  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [path, setPath] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [fileContent, setFileContent] = useState('');
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [filePath, setFilePath] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update from NOVA Studio');
  const [status, setStatus] = useState<string | null>(null);
  const [showDiffPreview, setShowDiffPreview] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchRepos = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://api.github.com/user/repos?per_page=100', { headers: { Authorization: `token ${token}` } });
        const data = await res.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedRepo) return;
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const [owner, repo] = selectedRepo.split('/');
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, { headers: { Authorization: `token ${token}` } });
        const data = await res.json();
        setBranches(Array.isArray(data) ? data.map((b:any)=>b.name) : []);
        setSelectedBranch(data && data[0] ? data[0].name : null);
      } catch (e) {
        console.error(e);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, [token, selectedRepo]);

  const listFiles = async () => {
    if (!token || !selectedRepo) return;
    setLoading(true);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const apiPath = path || '';
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(apiPath)}${selectedBranch ? `?ref=${selectedBranch}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `token ${token}` } });
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (f: any) => {
    if (!token || !selectedRepo) return;
    setLoading(true);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const url = f.url; // API URL for content
      const res = await fetch(url + (selectedBranch ? `?ref=${selectedBranch}` : ''), { headers: { Authorization: `token ${token}` } });
      const data = await res.json();
      const content = data.content ? atob(data.content.replace(/\n/g, '')) : '';
      setFileContent(content);
      setOriginalContent(content);
      setFilePath(f.path);

      // If editor context exists, open document in code editor
      try {
        openDocument({ path: f.path, content, language: (f.name || '').split('.').pop() });
      } catch (e) {
        // fallback: no editor context
      }
    } catch (e) {
      console.error(e);
      setFileContent('');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateFile = async () => {
    if (!token || !selectedRepo || !filePath) return alert('Select repo and specify file path');
    // Instead of committing immediately, show diff preview first
    setShowDiffPreview(true);
  };

  const doCommit = async () => {
    if (!token || !selectedRepo || !filePath) return alert('Select repo and specify file path');
    setStatus('Working...');
    try {
      const [owner, repo] = selectedRepo.split('/');
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(filePath)}${selectedBranch ? `?ref=${selectedBranch}` : ''}`;
      // Check if exists
      const headRes = await fetch(getUrl, { headers: { Authorization: `token ${token}` } });
      const exists = headRes.ok;
      let sha: string | undefined = undefined;
      if (exists) {
        const headData = await headRes.json();
        sha = headData.sha;
      }

      const payload: any = {
        message: commitMessage || 'Update from NOVA Studio',
        content: btoa(fileContent),
      };
      if (selectedBranch) payload.branch = selectedBranch;
      if (sha) payload.sha = sha;

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(filePath)}`, {
        method: 'PUT',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const putData = await putRes.json();
      if (!putRes.ok) throw new Error(putData.message || 'Failed to write');
      setStatus('Commit successful: ' + (putData.commit?.sha || 'ok'));
      setShowDiffPreview(false);
      setOriginalContent(fileContent);
    } catch (e:any) {
      console.error(e);
      setStatus('Error: ' + (e.message || e));
    }
  };

  const cancelCommitPreview = () => {
    setShowDiffPreview(false);
  };

  if (!token) return <div className="p-3 bg-[#0b0b0d] rounded-md border border-zinc-800">Sign in with GitHub to browse repositories.</div>;

  return (
    <div className="p-3 bg-[#0b0b0d] rounded-md border border-zinc-800">
      <h4 className="text-xs font-mono font-bold text-zinc-300">GitHub Repo Browser</h4>
      {loading && <div className="text-[11px] text-zinc-500 mt-2">Loading...</div>}

      <div className="mt-3">
        <label className="text-[11px] text-zinc-400">Select Repo</label>
        <select className="w-full mt-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md" value={selectedRepo || ''} onChange={e=> setSelectedRepo(e.target.value || null)}>
          <option value="">-- choose repo --</option>
          {repos.map(r=> (
            <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
          ))}
        </select>
      </div>

      {selectedRepo && (
        <>
          <div className="mt-2">
            <label className="text-[11px] text-zinc-400">Branch</label>
            <select className="w-full mt-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md" value={selectedBranch||''} onChange={e=> setSelectedBranch(e.target.value||null)}>
              <option value="">-- default branch --</option>
              {branches.map(b=> <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="mt-2 flex gap-2">
            <input className="flex-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md" placeholder="path (leave empty for root)" value={path} onChange={e=>setPath(e.target.value)} />
            <button onClick={listFiles} className="px-3 py-2 bg-[#FF6B00] text-black rounded-md">List</button>
          </div>

          <div className="mt-3">
            <div className="text-[11px] text-zinc-400">Files/Dirs</div>
            <div className="mt-2 bg-[#050507] p-2 rounded-md max-h-40 overflow-auto">
              {files.length===0 && <div className="text-[11px] text-zinc-500">No files listed</div>}
              {files.map(f=> (
                <div key={f.sha||f.path} className="flex items-center justify-between p-1 border-b border-zinc-800">
                  <div className="text-sm text-zinc-200">{f.name}</div>
                  <div className="flex items-center gap-2">
                    {f.type==='file' && <button onClick={()=>loadFile(f)} className="text-[11px] px-2 py-1 bg-[#0d0d12] rounded">Open</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <label className="text-[11px] text-zinc-400">File Path (to create/update)</label>
            <input className="w-full mt-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md" value={filePath} onChange={e=>setFilePath(e.target.value)} placeholder="src/components/MyComp.tsx" />
            <label className="text-[11px] text-zinc-400 mt-2">Commit Message</label>
            <input className="w-full mt-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md" value={commitMessage} onChange={e=>setCommitMessage(e.target.value)} />
            <label className="text-[11px] text-zinc-400 mt-2">Content</label>
            <textarea className="w-full mt-1 p-2 bg-[#0d0d12] border border-zinc-800 rounded-md h-36 text-xs" value={fileContent} onChange={e=>setFileContent(e.target.value)} />
            <div className="mt-2 flex gap-2">
              <button onClick={createOrUpdateFile} className="px-3 py-2 bg-[#FF6B00] text-black rounded-md">Commit File</button>
              <button onClick={()=>{ setFileContent(''); setFilePath(''); }} className="px-3 py-2 border border-zinc-800 rounded-md">Clear</button>
            </div>

            <MonacoDiffModal
              open={showDiffPreview}
              filePath={filePath}
              originalContent={originalContent || ''}
              newContent={fileContent}
              onConfirm={doCommit}
              onCancel={cancelCommitPreview}
            />

            {status && <div className="mt-2 text-[12px] text-zinc-300">{status}</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default GithubBrowser;