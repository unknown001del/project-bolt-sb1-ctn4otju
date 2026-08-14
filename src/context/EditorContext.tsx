import React, { createContext, useContext, useState } from 'react';

export interface FileDocument {
  path: string;
  content: string;
  language?: string;
}

interface EditorContextValue {
  documents: FileDocument[];
  activePath: string | null;
  openDocument: (doc: FileDocument) => void;
  updateDocument: (path: string, content: string) => void;
  setDocuments: (docs: FileDocument[]) => void;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

const DEFAULT_DOCUMENTS: FileDocument[] = [
  { path: 'src/App.tsx', content: "import React from 'react';\n\nexport default function App() {\n  return <div className='text-white'>Nova App Builder</div>;\n}\n", language: 'typescript' },
];

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocumentsState] = useState<FileDocument[]>(DEFAULT_DOCUMENTS);
  const [activePath, setActivePath] = useState<string | null>(documents[0]?.path || null);

  const openDocument = (doc: FileDocument) => {
    setDocumentsState(prev => {
      const exists = prev.find(d => d.path === doc.path);
      if (exists) {
        return prev.map(d => d.path === doc.path ? { ...d, content: doc.content, language: doc.language || d.language } : d);
      }
      return [...prev, doc];
    });
    setActivePath(doc.path);
  };

  const updateDocument = (path: string, content: string) => {
    setDocumentsState(prev => prev.map(d => d.path === path ? { ...d, content } : d));
  };

  return (
    <EditorContext.Provider value={{ documents, activePath, openDocument, updateDocument, setDocuments: setDocumentsState }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
};

export default EditorContext;
