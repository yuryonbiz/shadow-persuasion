'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, BookOpen, Trash2, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Eye, ChevronLeft, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const ADMIN_EMAILS = ['ybyalik@gmail.com'];

type BookStatus = 'extracting' | 'processing' | 'done' | 'error';
type UploadBook = {
  id: string;
  title: string;
  author: string;
  fileName: string;
  chunks: number;
  totalChunks: number;
  status: BookStatus;
  error?: string;
  skipped: { index: number; reason: string; text: string }[];
};

type DBBook = {
  title: string;
  author: string;
  chunks: number;
};

type Chunk = {
  id: string;
  technique_name: string;
  category: string;
  chunk_type: string;
  difficulty: string;
  content: string;
  token_count: number;
};

async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
  }
  return { text: fullText, pages: pdf.numPages };
}

function chunkText(text: string, maxWords: number = 800): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
  const chunks: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    const combined = current + '\n\n' + para;
    if (combined.split(/\s+/).length > maxWords && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = combined;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user?.email || !ADMIN_EMAILS.includes(user.email))) {
      router.replace('/app');
    }
  }, [user, loading, router]);

  const [uploads, setUploads] = useState<UploadBook[]>([]);
  const [dbBooks, setDbBooks] = useState<DBBook[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [expandedSkipped, setExpandedSkipped] = useState<string | null>(null);
  
  // Edit book state
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = (book: DBBook) => {
    setEditingBook(book.title);
    setEditTitle(book.title);
    setEditAuthor(book.author);
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setEditTitle('');
    setEditAuthor('');
  };

  const saveEdit = async () => {
    if (!editingBook || (!editTitle.trim() && !editAuthor.trim())) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldTitle: editingBook,
          newTitle: editTitle.trim() || undefined,
          newAuthor: editAuthor.trim() || undefined,
        }),
      });
      if (res.ok) {
        await loadBooks();
        cancelEdit();
      }
    } catch (e) {
      console.error('Failed to update book:', e);
    } finally {
      setSavingEdit(false);
    }
  };

  // Chunk browser state
  const [viewingBook, setViewingBook] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [chunkPage, setChunkPage] = useState(1);
  const [chunkTotal, setChunkTotal] = useState(0);
  const [chunkPages, setChunkPages] = useState(0);
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Load existing books from DB
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      const data = await res.json();
      if (Array.isArray(data)) setDbBooks(data);
    } catch {}
  };

  const loadChunks = async (bookTitle: string, page: number = 1) => {
    setLoadingChunks(true);
    try {
      const res = await fetch(`/api/admin/chunks?book=${encodeURIComponent(bookTitle)}&page=${page}`);
      const data = await res.json();
      setChunks(data.chunks || []);
      setChunkTotal(data.total || 0);
      setChunkPages(data.totalPages || 0);
      setChunkPage(page);
      setViewingBook(bookTitle);
    } catch {}
    setLoadingChunks(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.(pdf|txt|md)$/i, '').replace(/[-_]/g, ' '));
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.(pdf|txt|md)$/i, '').replace(/[-_]/g, ' '));
    }
  };

  // Retry skipped chunks
  const handleRetrySkipped = async (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload || upload.skipped.length === 0) return;

    setIsProcessing(true);
    const skippedTexts = upload.skipped.map(s => s.text);
    let retried = 0;
    const stillSkipped: typeof upload.skipped = [];

    const BATCH_SIZE = 3;
    for (let i = 0; i < skippedTexts.length; i += BATCH_SIZE) {
      const batch = skippedTexts.slice(i, i + BATCH_SIZE);
      try {
        const res = await fetch('/api/admin/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunks: batch, title: upload.title, author: upload.author }),
        });
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (res.ok && data.processed) retried += data.processed;
          else batch.forEach((t, j) => stillSkipped.push({ index: i + j, reason: data.error || 'Unknown', text: t }));
        } catch {
          batch.forEach((t, j) => stillSkipped.push({ index: i + j, reason: 'Non-JSON response', text: t }));
        }
      } catch (err: any) {
        batch.forEach((t, j) => stillSkipped.push({ index: i + j, reason: err.message, text: t }));
      }
      setStatusText(`Retrying: ${Math.min(i + BATCH_SIZE, skippedTexts.length)}/${skippedTexts.length}`);
    }

    setUploads(prev => prev.map(u =>
      u.id === uploadId ? { ...u, chunks: u.chunks + retried, skipped: stillSkipped } : u
    ));
    setStatusText(retried > 0 ? `Recovered ${retried} chunks` : 'Retry complete');
    setIsProcessing(false);
    loadBooks();
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !author) return;
    setIsProcessing(true);
    const bookId = Date.now().toString();
    const skipped: UploadBook['skipped'] = [];

    setUploads(prev => [{
      id: bookId, title, author, fileName: selectedFile.name,
      chunks: 0, totalChunks: 0, status: 'extracting', skipped: [],
    }, ...prev]);

    try {
      setStatusText('Reading file...');
      let text = '';
      let pageCount = 0;

      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        const result = await extractPdfText(selectedFile);
        text = result.text;
        pageCount = result.pages;
        setStatusText(`Extracted ${pageCount} pages. Preparing chunks...`);
      } else {
        text = await selectedFile.text();
        setStatusText(`Read file. Preparing chunks...`);
      }

      if (text.length < 100) throw new Error('Could not extract enough text.');

      const allChunks = chunkText(text);
      const totalChunks = allChunks.length;

      setUploads(prev => prev.map(b =>
        b.id === bookId ? { ...b, status: 'processing', totalChunks } : b
      ));
      setStatusText(`${pageCount ? pageCount + ' pages → ' : ''}${totalChunks} chunks. Processing...`);

      const BATCH_SIZE = 3;
      let processed = 0;

      for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
        const batch = allChunks.slice(i, i + BATCH_SIZE);
        try {
          const res = await fetch('/api/admin/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chunks: batch, title, author }),
          });
          const responseText = await res.text();
          try {
            const data = JSON.parse(responseText);
            if (res.ok && data.processed) {
              processed += data.processed;
              // Track partially failed chunks in batch
              const failed = batch.length - data.processed;
              if (failed > 0) {
                for (let j = data.processed; j < batch.length; j++) {
                  skipped.push({ index: i + j, reason: 'Partial batch failure', text: batch[j] });
                }
              }
            } else {
              batch.forEach((t, j) => skipped.push({ index: i + j, reason: data.error || 'API error', text: t }));
            }
          } catch {
            batch.forEach((t, j) => skipped.push({ index: i + j, reason: `Server error: ${responseText.slice(0, 80)}`, text: t }));
          }
        } catch (err: any) {
          batch.forEach((t, j) => skipped.push({ index: i + j, reason: err.message || 'Network error', text: t }));
        }

        setUploads(prev => prev.map(b =>
          b.id === bookId ? { ...b, chunks: processed, skipped: [...skipped] } : b
        ));
        setStatusText(`Processing: ${processed}/${totalChunks} chunks done${skipped.length > 0 ? ` (${skipped.length} skipped)` : ''}`);
      }

      setUploads(prev => prev.map(b =>
        b.id === bookId ? { ...b, status: 'done', chunks: processed, skipped: [...skipped] } : b
      ));
      setStatusText('');
      loadBooks();

    } catch (err: any) {
      setUploads(prev => prev.map(b =>
        b.id === bookId ? { ...b, status: 'error', error: err.message, skipped: [...skipped] } : b
      ));
      setStatusText('');
    }

    setIsProcessing(false);
    setSelectedFile(null);
    setTitle('');
    setAuthor('');
  };

  const handleDelete = async (bookTitle: string) => {
    if (!confirm(`Delete all chunks from "${bookTitle}"?`)) return;
    try {
      await fetch('/api/admin/ingest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bookTitle }),
      });
      setDbBooks(prev => prev.filter(b => b.title !== bookTitle));
      if (viewingBook === bookTitle) {
        setViewingBook(null);
        setChunks([]);
      }
    } catch {}
  };

  const categoryColors: Record<string, string> = {
    influence: 'bg-blue-500/20 text-blue-300',
    persuasion: 'bg-purple-500/20 text-purple-300',
    negotiation: 'bg-green-500/20 text-green-300',
    dark_psychology: 'bg-red-500/20 text-red-300',
    defense: 'bg-yellow-500/20 text-yellow-300',
    social_dynamics: 'bg-cyan-500/20 text-cyan-300',
    body_language: 'bg-orange-500/20 text-orange-300',
    nlp: 'bg-pink-500/20 text-pink-300',
    power_strategy: 'bg-amber-500/20 text-amber-300',
  };

  if (loading || !user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">Knowledge Base — Admin</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload books and manage the AI knowledge base</p>
      </header>

      {/* Upload Section */}
      <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
        <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider mb-4">Upload a Book</h2>
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${dragActive ? 'border-[#D4A017] bg-[#D4A017]/10' : 'border-gray-300 dark:border-[#444] hover:border-[#666]'}
            ${selectedFile ? 'border-green-500/50 bg-green-500/5' : ''}`}
          onClick={() => document.getElementById('file-input')?.click()}>
          <input id="file-input" type="file" accept=".pdf,.txt,.md" onChange={handleFileSelect} className="hidden" />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="h-6 w-6 text-green-400" />
              <span className="text-green-400 font-mono">{selectedFile.name}</span>
              <span className="text-gray-500 text-sm">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          ) : (
            <><Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" /><p className="text-gray-500 dark:text-gray-400">Drop a PDF, TXT, or MD file here</p><p className="text-gray-600 text-sm mt-1">or click to browse</p></>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">Book Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Influence"
              className="w-full p-2.5 bg-gray-50 dark:bg-[#222] text-gray-800 dark:text-[#E8E8E0] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:outline-none placeholder-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">Author</label>
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Robert Cialdini"
              className="w-full p-2.5 bg-gray-50 dark:bg-[#222] text-gray-800 dark:text-[#E8E8E0] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:outline-none placeholder-gray-600" />
          </div>
        </div>
        <button onClick={handleUpload} disabled={!selectedFile || !title || !author || isProcessing}
          className="mt-4 w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</> : <><Upload className="h-5 w-5" /> Ingest Book</>}
        </button>
        {statusText && <p className="text-[#D4A017] text-sm text-center mt-2 font-mono">{statusText}</p>}
      </div>

      {/* Recent Uploads (with skipped tracking) */}
      {uploads.length > 0 && (
        <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider mb-4">Recent Uploads</h2>
          <div className="space-y-3">
            {uploads.map(upload => (
              <div key={upload.id} className="p-4 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-[#333]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {upload.status === 'extracting' && <Loader2 className="h-5 w-5 text-gray-500 dark:text-gray-400 animate-spin" />}
                    {upload.status === 'processing' && <Loader2 className="h-5 w-5 text-[#D4A017] animate-spin" />}
                    {upload.status === 'done' && <CheckCircle className="h-5 w-5 text-green-400" />}
                    {upload.status === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                    <div>
                      <p className="text-gray-800 dark:text-[#E8E8E0] font-medium">{upload.title}</p>
                      <p className="text-gray-500 text-sm">{upload.author} · {upload.fileName}</p>
                    </div>
                  </div>
                </div>

                {upload.status === 'processing' && upload.totalChunks > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Processing chunks</span>
                      <span>{upload.chunks}/{upload.totalChunks}{upload.skipped.length > 0 && ` · ${upload.skipped.length} skipped`}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-[#333] rounded-full h-2">
                      <div className="bg-[#D4A017] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((upload.chunks + upload.skipped.length) / upload.totalChunks) * 100}%` }} />
                    </div>
                  </div>
                )}

                {upload.status === 'done' && (
                  <p className="text-green-400 text-sm mt-2">✓ {upload.chunks} chunks ingested{upload.skipped.length > 0 && ` · ${upload.skipped.length} skipped`}</p>
                )}

                {upload.status === 'error' && <p className="text-red-400 text-sm mt-2">{upload.error}</p>}

                {/* Skipped chunks details */}
                {upload.skipped.length > 0 && (
                  <div className="mt-3">
                    <button onClick={() => setExpandedSkipped(expandedSkipped === upload.id ? null : upload.id)}
                      className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300">
                      {expandedSkipped === upload.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {upload.skipped.length} skipped chunks — click to see why
                    </button>
                    {expandedSkipped === upload.id && (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {upload.skipped.map((s, i) => (
                          <div key={i} className="text-xs p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333]">
                            <span className="text-yellow-400">Chunk #{s.index + 1}:</span>{' '}
                            <span className="text-red-400">{s.reason}</span>
                            <p className="text-gray-500 mt-1 truncate">{s.text.slice(0, 120)}...</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {upload.status === 'done' && (
                      <button onClick={() => handleRetrySkipped(upload.id)} disabled={isProcessing}
                        className="mt-2 flex items-center gap-1 text-xs px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 disabled:opacity-50">
                        <RefreshCw className="h-3 w-3" /> Retry skipped chunks
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Books in DB */}
      <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider">Knowledge Base</h2>
          <button onClick={loadBooks} className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#D4A017] flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>

        {dbBooks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No books in the knowledge base yet.</p>
        ) : (
          <div className="space-y-2">
            {dbBooks.map(book => (
              <div key={book.title} className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-[#333]">
                {editingBook === book.title ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Author</label>
                        <input
                          type="text"
                          value={editAuthor}
                          onChange={(e) => setEditAuthor(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={cancelEdit} className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Cancel">
                        <X className="h-4 w-4" />
                      </button>
                      <button onClick={saveEdit} disabled={savingEdit} className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017] text-[#0A0A0A] text-xs font-mono font-bold rounded hover:bg-[#E8B830] disabled:opacity-50 transition-colors">
                        {savingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-[#E8E8E0] font-medium">{book.title}</p>
                      <p className="text-gray-500 text-sm">{book.author} · {book.chunks} chunks</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(book)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors" title="Edit book">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => loadChunks(book.title)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors" title="View chunks">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(book.title)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Delete book">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chunk Browser */}
      {viewingBook && (
        <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider">
              Chunks: {viewingBook} ({chunkTotal} total)
            </h2>
            <button onClick={() => { setViewingBook(null); setChunks([]); }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">✕ Close</button>
          </div>

          {loadingChunks ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-[#D4A017] animate-spin" /></div>
          ) : (
            <>
              <div className="space-y-2">
                {chunks.map(chunk => (
                  <div key={chunk.id} className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-[#333]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-800 dark:text-[#E8E8E0] font-medium text-sm">{chunk.technique_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${categoryColors[chunk.category] || 'bg-gray-500/20 text-gray-600 dark:text-gray-300'}`}>
                          {chunk.category}
                        </span>
                        <span className="text-xs text-gray-500">{chunk.chunk_type}</span>
                        <span className="text-xs text-gray-600">{chunk.token_count} tokens</span>
                      </div>
                      <button onClick={() => setExpandedChunk(expandedChunk === chunk.id ? null : chunk.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-[#D4A017]">
                        {expandedChunk === chunk.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    {expandedChunk === chunk.id && (
                      <div className="mt-3 p-3 bg-white dark:bg-[#1A1A1A] rounded text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {chunk.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {chunkPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button onClick={() => loadChunks(viewingBook, chunkPage - 1)} disabled={chunkPage <= 1}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#D4A017] disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">Page {chunkPage} of {chunkPages}</span>
                  <button onClick={() => loadChunks(viewingBook, chunkPage + 1)} disabled={chunkPage >= chunkPages}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#D4A017] disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
