'use client';

/* ════════════════════════════════════════════════════════════
   /admin/books — Book ingestion + knowledge base management
   Extracted from the former monolithic admin page.
   Contains 4 sub-sections: Upload, Recent Uploads, Knowledge Base, Chunk Browser.
   ════════════════════════════════════════════════════════════ */

import { useState, useCallback, useEffect } from 'react';
import {
  Upload, Trash2, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  RefreshCw, Eye, ChevronLeft, ChevronRight, Pencil, Check, X, Download, Clock, XCircle,
} from 'lucide-react';

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
type QueueItemStatus = 'pending' | 'processing' | 'done' | 'error';
type QueueItem = {
  id: string;
  file: File;
  title: string;
  author: string;
  status: QueueItemStatus;
  error?: string;
};
type DBBook = {
  title: string;
  author: string;
  chunks: number;
  storage_path?: string;
};
type Chunk = {
  id: string;
  technique_name: string;
  technique_id: string;
  category: string;
  chunk_type: string;
  difficulty: string;
  use_cases: string[];
  risk_level: string;
  content: string;
  token_count: number;
  created_at: string;
};

// PDF text extraction (runs client-side via pdfjs-dist)
async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText +=
      textContent.items
        // @ts-expect-error pdfjs-dist types
        .map((item) => item.str)
        .join(' ') + '\n\n';
  }
  return { text: fullText, pages: pdf.numPages };
}

function chunkText(text: string, maxWords: number = 800): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 30);
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

const CATEGORY_COLORS: Record<string, string> = {
  influence: 'bg-blue-500/20 text-blue-600 dark:text-blue-300',
  persuasion: 'bg-purple-500/20 text-purple-600 dark:text-purple-300',
  negotiation: 'bg-green-500/20 text-green-600 dark:text-green-300',
  dark_psychology: 'bg-red-500/20 text-red-600 dark:text-red-300',
  defense: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300',
  social_dynamics: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300',
  body_language: 'bg-orange-500/20 text-orange-600 dark:text-orange-300',
  nlp: 'bg-pink-500/20 text-pink-600 dark:text-pink-300',
  power_strategy: 'bg-amber-500/20 text-amber-600 dark:text-amber-300',
};

export default function BooksPage() {
  // Upload state
  const [uploads, setUploads] = useState<UploadBook[]>([]);
  const [dbBooks, setDbBooks] = useState<DBBook[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [expandedSkipped, setExpandedSkipped] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);
  const [attachingBook, setAttachingBook] = useState<string | null>(null);

  // Edit state
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Chunk browser state
  const [viewingBook, setViewingBook] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [chunkPage, setChunkPage] = useState(1);
  const [chunkTotal, setChunkTotal] = useState(0);
  const [chunkPages, setChunkPages] = useState(0);
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const chunkBrowserRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      const data = await res.json();
      if (Array.isArray(data)) setDbBooks(data);
    } catch {}
  };

  useEffect(() => {
    loadBooks();
  }, []);

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

  const addFilesToQueue = useCallback((files: FileList | File[]) => {
    const newItems: QueueItem[] = Array.from(files)
      .filter((f) => /\.(pdf|txt|md)$/i.test(f.name))
      .map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        title: f.name.replace(/\.(pdf|txt|md)$/i, '').replace(/[-_]/g, ' '),
        author: '',
        status: 'pending' as QueueItemStatus,
      }));
    if (newItems.length > 0) setUploadQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) addFilesToQueue(e.dataTransfer.files);
    },
    [addFilesToQueue]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFilesToQueue(e.target.files);
      e.target.value = '';
    }
  };

  const updateQueueItem = (id: string, updates: Partial<QueueItem>) => {
    setUploadQueue((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRetrySkipped = async (uploadId: string) => {
    const upload = uploads.find((u) => u.id === uploadId);
    if (!upload || upload.skipped.length === 0) return;

    setIsProcessing(true);
    const skippedTexts = upload.skipped.map((s) => s.text);
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
          else
            batch.forEach((t, j) =>
              stillSkipped.push({ index: i + j, reason: data.error || 'Unknown', text: t })
            );
        } catch {
          batch.forEach((t, j) =>
            stillSkipped.push({ index: i + j, reason: 'Non-JSON response', text: t })
          );
        }
      } catch (err) {
        batch.forEach((t, j) =>
          stillSkipped.push({
            index: i + j,
            reason: err instanceof Error ? err.message : String(err),
            text: t,
          })
        );
      }
      setStatusText(`Retrying: ${Math.min(i + BATCH_SIZE, skippedTexts.length)}/${skippedTexts.length}`);
    }

    setUploads((prev) =>
      prev.map((u) =>
        u.id === uploadId ? { ...u, chunks: u.chunks + retried, skipped: stillSkipped } : u
      )
    );
    setStatusText(retried > 0 ? `Recovered ${retried} chunks` : 'Retry complete');
    setIsProcessing(false);
    loadBooks();
  };

  const processOneBook = async (file: File, bookTitle: string, bookAuthor: string): Promise<void> => {
    const bookId = Date.now().toString();
    const skipped: UploadBook['skipped'] = [];

    setUploads((prev) => [
      {
        id: bookId,
        title: bookTitle,
        author: bookAuthor,
        fileName: file.name,
        chunks: 0,
        totalChunks: 0,
        status: 'extracting',
        skipped: [],
      },
      ...prev,
    ]);

    try {
      // 1. Upload original to storage
      setStatusText('Saving original file to storage...');
      let storagePath: string | null = null;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', bookTitle);
        formData.append('author', bookAuthor);
        const storageRes = await fetch('/api/admin/upload-file', { method: 'POST', body: formData });
        const storageData = await storageRes.json();
        if (storageData.stored && storageData.storagePath) {
          storagePath = storageData.storagePath;
          setStatusText('File saved. Extracting text...');
        } else {
          setStatusText(`Storage: ${storageData.error || 'skipped'}. Extracting text...`);
        }
      } catch {
        setStatusText('Storage upload skipped. Extracting text...');
      }

      // 2. Extract text
      let text = '';
      let pageCount = 0;
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const result = await extractPdfText(file);
        text = result.text;
        pageCount = result.pages;
        setStatusText(`Extracted ${pageCount} pages. Preparing chunks...`);
      } else {
        text = await file.text();
        setStatusText(`Read file. Preparing chunks...`);
      }

      if (text.length < 100) throw new Error('Could not extract enough text.');

      // 3. Chunk + ingest
      const allChunks = chunkText(text);
      const totalChunks = allChunks.length;
      setUploads((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, status: 'processing', totalChunks } : b))
      );
      setStatusText(`${pageCount ? pageCount + ' pages -> ' : ''}${totalChunks} chunks. Processing...`);

      const BATCH_SIZE = 3;
      let processed = 0;
      for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
        const batch = allChunks.slice(i, i + BATCH_SIZE);
        try {
          const res = await fetch('/api/admin/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chunks: batch,
              title: bookTitle,
              author: bookAuthor,
              storagePath,
            }),
          });
          const responseText = await res.text();
          try {
            const data = JSON.parse(responseText);
            if (res.ok && data.processed) {
              processed += data.processed;
              const failed = batch.length - data.processed;
              if (failed > 0) {
                for (let j = data.processed; j < batch.length; j++) {
                  skipped.push({ index: i + j, reason: 'Partial batch failure', text: batch[j] });
                }
              }
            } else {
              batch.forEach((t, j) =>
                skipped.push({ index: i + j, reason: data.error || 'API error', text: t })
              );
            }
          } catch {
            batch.forEach((t, j) =>
              skipped.push({
                index: i + j,
                reason: `Server error: ${responseText.slice(0, 80)}`,
                text: t,
              })
            );
          }
        } catch (err) {
          batch.forEach((t, j) =>
            skipped.push({
              index: i + j,
              reason: err instanceof Error ? err.message : 'Network error',
              text: t,
            })
          );
        }
        setUploads((prev) =>
          prev.map((b) =>
            b.id === bookId ? { ...b, chunks: processed, skipped: [...skipped] } : b
          )
        );
        setStatusText(
          `Processing: ${processed}/${totalChunks} chunks done${skipped.length > 0 ? ` (${skipped.length} skipped)` : ''}`
        );
      }

      setUploads((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, status: 'done', chunks: processed, skipped: [...skipped] } : b
        )
      );
      setStatusText('');
      loadBooks();
    } catch (err) {
      setUploads((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? { ...b, status: 'error', error: err instanceof Error ? err.message : String(err), skipped: [...skipped] }
            : b
        )
      );
      setStatusText('');
      throw err;
    }
  };

  const handleProcessQueue = async () => {
    const pending = uploadQueue.filter((q) => q.status === 'pending');
    if (pending.length === 0) return;
    setIsProcessing(true);

    for (const item of pending) {
      if (!item.title.trim() || !item.author.trim()) {
        updateQueueItem(item.id, { status: 'error', error: 'Title and author are required' });
        continue;
      }
      const isDuplicate = dbBooks.some(
        (b) =>
          b.title.toLowerCase() === item.title.trim().toLowerCase() &&
          b.author.toLowerCase() === item.author.trim().toLowerCase()
      );
      if (isDuplicate) {
        updateQueueItem(item.id, {
          status: 'error',
          error: `"${item.title.trim()}" by ${item.author.trim()} already exists. Delete it first to re-upload.`,
        });
        continue;
      }

      updateQueueItem(item.id, { status: 'processing' });
      try {
        await processOneBook(item.file, item.title.trim(), item.author.trim());
        updateQueueItem(item.id, { status: 'done' });
      } catch (err) {
        updateQueueItem(item.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Processing failed',
        });
      }
    }

    setIsProcessing(false);
    setStatusText('');
  };

  const handleDelete = async (bookTitle: string) => {
    if (!confirm(`Delete all chunks from "${bookTitle}"?`)) return;
    try {
      await fetch('/api/admin/ingest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bookTitle }),
      });
      setDbBooks((prev) => prev.filter((b) => b.title !== bookTitle));
      if (viewingBook === bookTitle) {
        setViewingBook(null);
        setChunks([]);
      }
    } catch {}
  };

  const handleDownload = async (book: DBBook) => {
    if (!book.storage_path) return;
    try {
      const res = await fetch(`/api/admin/upload-file?path=${encodeURIComponent(book.storage_path)}`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
          // BOOKS //
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
          Knowledge Base
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
          Upload books, ingest chunks into the knowledge base, browse techniques.
        </p>
      </div>

      {/* ═════════ UPLOAD ═════════ */}
      <section className="p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20">
        <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider mb-4">
          Upload Books
        </h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-[#D4A017] bg-[#D4A017]/10'
              : 'border-gray-300 dark:border-[#D4A017]/30 hover:border-gray-400 dark:hover:border-[#D4A017]/50'
          }`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt,.md"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-8 w-8 text-gray-500 dark:text-[#F4ECD8]/40 mx-auto mb-2" />
          <p className="text-gray-700 dark:text-[#F4ECD8]/80">Drop PDF, TXT, or MD files here</p>
          <p className="text-gray-500 dark:text-[#F4ECD8]/50 text-sm mt-1">or click to browse (multiple files supported)</p>
        </div>

        {/* Upload queue */}
        {uploadQueue.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500 dark:text-[#F4ECD8]/60 uppercase">
                Queue ({uploadQueue.filter((q) => q.status === 'pending').length} pending)
              </span>
              {uploadQueue.some((q) => q.status === 'done') && !isProcessing && (
                <button
                  onClick={() => setUploadQueue((prev) => prev.filter((q) => q.status !== 'done'))}
                  className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 hover:text-gray-900 dark:hover:text-[#F4ECD8]"
                >
                  Clear completed
                </button>
              )}
            </div>
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className={`p-3 border ${
                  item.status === 'processing'
                    ? 'bg-[#D4A017]/5 border-[#D4A017]/40'
                    : item.status === 'done'
                    ? 'bg-green-500/5 border-green-500/40'
                    : item.status === 'error'
                    ? 'bg-red-500/5 border-red-500/40'
                    : 'bg-gray-50 dark:bg-[#0A0A0A] border-gray-200 dark:border-[#D4A017]/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {item.status === 'pending' && <Clock className="h-4 w-4 text-gray-400 shrink-0" />}
                  {item.status === 'processing' && (
                    <Loader2 className="h-4 w-4 text-[#D4A017] animate-spin shrink-0" />
                  )}
                  {item.status === 'done' && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                  {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  <span className="text-xs text-gray-700 dark:text-[#F4ECD8]/80 font-mono truncate flex-1">
                    {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 ${
                      item.status === 'pending'
                        ? 'bg-gray-200 dark:bg-[#333] text-gray-600 dark:text-gray-400'
                        : item.status === 'processing'
                        ? 'bg-[#D4A017]/20 text-[#D4A017]'
                        : item.status === 'done'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.status === 'pending' && (
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 text-gray-500 hover:text-red-500 shrink-0"
                      title="Remove"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {(item.status === 'pending' || item.status === 'error') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateQueueItem(item.id, { title: e.target.value })}
                      placeholder="Book title"
                      disabled={isProcessing}
                      className="w-full p-2 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#F4ECD8] border border-gray-300 dark:border-[#D4A017]/30 text-sm focus:outline-none focus:border-[#D4A017] disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={item.author}
                      onChange={(e) => updateQueueItem(item.id, { author: e.target.value })}
                      placeholder="Author"
                      disabled={isProcessing}
                      className="w-full p-2 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#F4ECD8] border border-gray-300 dark:border-[#D4A017]/30 text-sm focus:outline-none focus:border-[#D4A017] disabled:opacity-50"
                    />
                  </div>
                )}
                {item.status === 'error' && item.error && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {uploadQueue.some((q) => q.status === 'pending') && (
          <button
            onClick={handleProcessQueue}
            disabled={
              isProcessing ||
              !uploadQueue.some((q) => q.status === 'pending' && q.title.trim() && q.author.trim())
            }
            className="mt-4 w-full py-3 bg-[#D4A017] text-black font-bold uppercase tracking-wider hover:bg-[#C4901A] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</>
            ) : (
              <><Upload className="h-5 w-5" /> Process Queue ({uploadQueue.filter((q) => q.status === 'pending').length} books)</>
            )}
          </button>
        )}
        {statusText && (
          <p className="text-[#D4A017] text-sm text-center mt-2 font-mono">{statusText}</p>
        )}
      </section>

      {/* ═════════ RECENT UPLOADS ═════════ */}
      {uploads.length > 0 && (
        <section className="p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20">
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider mb-4">
            Recent Uploads
          </h2>
          <div className="space-y-3">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="p-4 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {upload.status === 'extracting' && <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />}
                    {upload.status === 'processing' && <Loader2 className="h-5 w-5 text-[#D4A017] animate-spin" />}
                    {upload.status === 'done' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {upload.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    <div>
                      <p className="text-gray-900 dark:text-[#F4ECD8] font-medium">{upload.title}</p>
                      <p className="text-gray-500 dark:text-[#F4ECD8]/50 text-sm">
                        {upload.author} · {upload.fileName}
                      </p>
                    </div>
                  </div>
                </div>
                {upload.status === 'processing' && upload.totalChunks > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-[#F4ECD8]/60 mb-1">
                      <span>Processing chunks</span>
                      <span>
                        {upload.chunks}/{upload.totalChunks}
                        {upload.skipped.length > 0 && ` · ${upload.skipped.length} skipped`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-[#333] h-2">
                      <div
                        className="bg-[#D4A017] h-2 transition-all duration-300"
                        style={{
                          width: `${((upload.chunks + upload.skipped.length) / upload.totalChunks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {upload.status === 'done' && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                    ✓ {upload.chunks} chunks ingested
                    {upload.skipped.length > 0 && ` · ${upload.skipped.length} skipped`}
                  </p>
                )}
                {upload.status === 'error' && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2">{upload.error}</p>
                )}
                {upload.skipped.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedSkipped(expandedSkipped === upload.id ? null : upload.id)
                      }
                      className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-700"
                    >
                      {expandedSkipped === upload.id ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      {upload.skipped.length} skipped chunks · click to see why
                    </button>
                    {expandedSkipped === upload.id && (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {upload.skipped.map((s, i) => (
                          <div
                            key={i}
                            className="text-xs p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20"
                          >
                            <span className="text-yellow-600 dark:text-yellow-400">Chunk #{s.index + 1}:</span>{' '}
                            <span className="text-red-500">{s.reason}</span>
                            <p className="text-gray-500 dark:text-[#F4ECD8]/50 mt-1 truncate">
                              {s.text.slice(0, 120)}…
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {upload.status === 'done' && (
                      <button
                        onClick={() => handleRetrySkipped(upload.id)}
                        disabled={isProcessing}
                        className="mt-2 flex items-center gap-1 text-xs px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50"
                      >
                        <RefreshCw className="h-3 w-3" /> Retry skipped chunks
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═════════ KNOWLEDGE BASE (existing books) ═════════ */}
      <section className="p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider">Knowledge Base</h2>
          <button
            onClick={loadBooks}
            className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017] flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
        {dbBooks.length === 0 ? (
          <p className="text-gray-500 dark:text-[#F4ECD8]/50 text-center py-8">
            No books in the knowledge base yet.
          </p>
        ) : (
          <div className="space-y-2">
            {dbBooks.map((book) => (
              <div
                key={book.title}
                className="p-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20"
              >
                {editingBook === book.title ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-mono text-gray-500 dark:text-[#F4ECD8]/50 uppercase mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-sm text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-mono text-gray-500 dark:text-[#F4ECD8]/50 uppercase mb-1">
                          Author
                        </label>
                        <input
                          type="text"
                          value={editAuthor}
                          onChange={(e) => setEditAuthor(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-sm text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-gray-700"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={savingEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017] text-black text-xs font-mono font-bold hover:bg-[#C4901A] disabled:opacity-50"
                      >
                        {savingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 dark:text-[#F4ECD8] font-medium">{book.title}</p>
                      <p className="text-gray-500 dark:text-[#F4ECD8]/50 text-sm">
                        {book.author} · {book.chunks} chunks
                        {attachingBook === book.title && (
                          <span className="text-[#D4A017] ml-2">Uploading PDF…</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {book.storage_path ? (
                        <button
                          onClick={() => handleDownload(book)}
                          className="p-2 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017]"
                          title="Download original file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="p-2 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017]"
                          title="Attach PDF file"
                          disabled={attachingBook === book.title}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf';
                            input.onchange = async () => {
                              const file = input.files?.[0];
                              if (!file) return;
                              setAttachingBook(book.title);
                              try {
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('bookTitle', book.title);
                                const res = await fetch('/api/admin/upload-file', { method: 'PUT', body: formData });
                                const data = await res.json();
                                if (data.stored) loadBooks();
                                else alert('Upload failed: ' + (data.error || 'unknown error'));
                              } catch (err) {
                                alert('Upload error: ' + (err instanceof Error ? err.message : err));
                              } finally {
                                setAttachingBook(null);
                              }
                            };
                            input.click();
                          }}
                        >
                          {attachingBook === book.title ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[#D4A017]" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(book)}
                        className="p-2 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017]"
                        title="Edit book"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => loadChunks(book.title)}
                        className="p-2 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017]"
                        title="View chunks"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.title)}
                        className="p-2 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-red-500"
                        title="Delete book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═════════ CHUNK BROWSER ═════════ */}
      {viewingBook && (
        <section
          ref={chunkBrowserRef}
          className="p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20"
        >
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider truncate min-w-0">
              Chunks: {viewingBook} ({chunkTotal} total)
            </h2>
            <button
              onClick={() => {
                setViewingBook(null);
                setChunks([]);
              }}
              className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 hover:text-gray-900 dark:hover:text-[#F4ECD8]"
            >
              ✕ Close
            </button>
          </div>
          {loadingChunks ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-[#D4A017] animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="p-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-900 dark:text-[#F4ECD8] font-medium text-sm">
                          {chunk.technique_name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 font-mono ${
                            CATEGORY_COLORS[chunk.category] || 'bg-gray-500/20 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {chunk.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-[#F4ECD8]/50">{chunk.chunk_type}</span>
                        <span className="text-xs text-gray-500 dark:text-[#F4ECD8]/50">
                          {chunk.token_count} tokens
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedChunk(expandedChunk === chunk.id ? null : chunk.id)}
                        className="text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017]"
                      >
                        {expandedChunk === chunk.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {expandedChunk === chunk.id && (
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <MetaField label="Technique ID" value={chunk.technique_id || '—'} />
                          <MetaField
                            label="Difficulty"
                            value={chunk.difficulty || '—'}
                            color={
                              chunk.difficulty === 'advanced'
                                ? 'text-red-500'
                                : chunk.difficulty === 'intermediate'
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }
                          />
                          <MetaField
                            label="Risk Level"
                            value={chunk.risk_level || '—'}
                            color={
                              chunk.risk_level === 'high'
                                ? 'text-red-500'
                                : chunk.risk_level === 'medium'
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }
                          />
                          <MetaField label="Chunk Type" value={chunk.chunk_type || '—'} />
                          <div className="p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 col-span-2">
                            <span className="text-gray-500 dark:text-[#F4ECD8]/50 font-mono uppercase block mb-0.5">
                              Use Cases
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {chunk.use_cases?.length > 0 ? (
                                chunk.use_cases.map((uc, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-[#D4A017]/10 text-[#D4A017] text-[10px] font-mono"
                                  >
                                    {uc}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 dark:text-[#F4ECD8]/50">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 text-sm text-gray-700 dark:text-[#F4ECD8]/80 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                          {chunk.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {chunkPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => loadChunks(viewingBook, chunkPage - 1)}
                    disabled={chunkPage <= 1}
                    className="p-1 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017] disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-[#F4ECD8]/80 font-mono">
                    Page {chunkPage} of {chunkPages}
                  </span>
                  <button
                    onClick={() => loadChunks(viewingBook, chunkPage + 1)}
                    disabled={chunkPage >= chunkPages}
                    className="p-1 text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017] disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

function MetaField({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20">
      <span className="text-gray-500 dark:text-[#F4ECD8]/50 font-mono uppercase block mb-0.5">{label}</span>
      <span className={`font-medium ${color || 'text-gray-900 dark:text-[#F4ECD8]'}`}>{value}</span>
    </div>
  );
}
