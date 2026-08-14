import React, { createContext, useContext, useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

interface FileSystemContextValue {
  bound: boolean;
  name: string | null;
  bind: () => Promise<void>;
  unbind: () => void;
  writeFile: (relativePath: string, content: string) => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextValue | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle, setHandle] = useState<any | null>(null);
  const [name, setName] = useState<string | null>(null);

  const bind = async () => {
    if (!('showDirectoryPicker' in window)) throw new Error('File System Access API not supported');
    const dir = await (window as any).showDirectoryPicker();
    setHandle(dir);
    setName(dir.name || null);
  };

  const unbind = () => {
    setHandle(null);
    setName(null);
  };

  // Confirmation UI state and resolver
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMessage, setConfirmMessage] = React.useState<string>('');
  const confirmResolver = React.useRef<(v: boolean) => void | null>(null);

  const requestConfirm = (message: string) => {
    setConfirmMessage(message);
    setConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
    });
  };

  const resolveConfirm = (val: boolean) => {
    if (confirmResolver.current) confirmResolver.current(val);
    confirmResolver.current = null;
    setConfirmOpen(false);
    setConfirmMessage('');
  };

  const writeFile = async (relativePath: string, content: string) => {
    if (!handle) throw new Error('No directory bound');
    const parts = relativePath.split('/').filter(Boolean);
    let dir: any = handle;
    // Traverse or create subdirectories except the last part which is file
    for (let i = 0; i < parts.length - 1; i++) {
      const name = parts[i];
      dir = await dir.getDirectoryHandle(name, { create: true });
    }
    const fileName = parts[parts.length - 1];

    // Check if file exists to create a backup
    let existingContent: string | null = null;
    try {
      const existingHandle = await dir.getFileHandle(fileName, { create: false });
      const existingFile = await existingHandle.getFile();
      existingContent = await existingFile.text();
    } catch (e) {
      // file does not exist
      existingContent = null;
    }

    // If exists, create a timestamped backup under .nova-stash/<timestamp>/<relativePath>
    if (existingContent !== null) {
      try {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        let stashDir = await handle.getDirectoryHandle('.nova-stash', { create: true });
        stashDir = await stashDir.getDirectoryHandle(ts, { create: true });
        // create nested dirs for the path except file
        let stashSub = stashDir;
        for (let i = 0; i < parts.length - 1; i++) {
          stashSub = await stashSub.getDirectoryHandle(parts[i], { create: true });
        }
        const backupFile = await stashSub.getFileHandle(fileName, { create: true });
        const w = await backupFile.createWritable();
        await w.write(existingContent);
        await w.close();
        // Inform the user that a backup was created
        // eslint-disable-next-line no-console
        console.log(`Backup created at .nova-stash/${ts}/${parts.join('/')}`);

        // Show in-app confirmation modal instead of window.confirm
        const proceed = await requestConfirm(`File ${relativePath} exists. A backup was created at .nova-stash/${ts}/${parts.join('/')}. Overwrite file?`);
        if (!proceed) {
          // user aborted
          throw new Error('User aborted overwrite');
        }
      } catch (e) {
        // if any error during backup or user abort, rethrow to caller
        throw e;
      }
    }

    // Now write/overwrite the target file
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  };

  return (
    <FileSystemContext.Provider value={{ bound: !!handle, name, bind, unbind, writeFile }}>
      {children}
      <ConfirmModal
        open={confirmOpen}
        title="Overwrite file?"
        message={confirmMessage}
        confirmLabel="Overwrite"
        cancelLabel="Cancel"
        onConfirm={() => resolveConfirm(true)}
        onCancel={() => resolveConfirm(false)}
      />
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const ctx = useContext(FileSystemContext);
  if (!ctx) throw new Error('useFileSystem must be used within FileSystemProvider');
  return ctx;
};
