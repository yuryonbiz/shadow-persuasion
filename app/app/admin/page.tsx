'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Eye, ChevronLeft, ChevronRight, Pencil, Check, X, Plus, Power, ArrowUp, ArrowDown, Download, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useAdmin } from '@/lib/hooks/useAdmin';

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
  const { isAdmin, adminLoading } = useAdmin();

  useEffect(() => {
    if (!loading && !adminLoading && !isAdmin) {
      router.replace('/app');
    }
  }, [user, loading, adminLoading, router, isAdmin]);

  const [uploads, setUploads] = useState<UploadBook[]>([]);
  const [dbBooks, setDbBooks] = useState<DBBook[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [expandedSkipped, setExpandedSkipped] = useState<string | null>(null);

  // Multi-file upload queue
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);
  
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

  // Load existing books from DB once admin is confirmed
  useEffect(() => {
    if (isAdmin && !adminLoading) {
      loadBooks();
    }
  }, [isAdmin, adminLoading]);

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      const data = await res.json();
      if (Array.isArray(data)) setDbBooks(data);
    } catch {}
  };

  const chunkBrowserRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const addFilesToQueue = useCallback((files: FileList | File[]) => {
    const newItems: QueueItem[] = Array.from(files)
      .filter(f => /\.(pdf|txt|md)$/i.test(f.name))
      .map(f => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        title: f.name.replace(/\.(pdf|txt|md)$/i, '').replace(/[-_]/g, ' '),
        author: '',
        status: 'pending' as QueueItemStatus,
      }));
    if (newItems.length > 0) {
      setUploadQueue(prev => [...prev, ...newItems]);
    }
  }, []);

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
    if (e.dataTransfer.files?.length) {
      addFilesToQueue(e.dataTransfer.files);
    }
  }, [addFilesToQueue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFilesToQueue(e.target.files);
      e.target.value = ''; // reset so same files can be re-selected
    }
  };

  const updateQueueItem = (id: string, updates: Partial<QueueItem>) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
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

  const processOneBook = async (file: File, bookTitle: string, bookAuthor: string): Promise<void> => {
    const bookId = Date.now().toString();
    const skipped: UploadBook['skipped'] = [];

    setUploads(prev => [{
      id: bookId, title: bookTitle, author: bookAuthor, fileName: file.name,
      chunks: 0, totalChunks: 0, status: 'extracting', skipped: [],
    }, ...prev]);

    try {
      // 1. Upload original file to Supabase Storage
      setStatusText('Uploading file to storage...');
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
        }
      } catch {
        // Storage upload is best-effort; don't block ingestion
      }

      // 2. Extract text
      setStatusText('Reading file...');
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

      // 3. Chunk and ingest
      const allChunks = chunkText(text);
      const totalChunks = allChunks.length;

      setUploads(prev => prev.map(b =>
        b.id === bookId ? { ...b, status: 'processing', totalChunks } : b
      ));
      setStatusText(`${pageCount ? pageCount + ' pages -> ' : ''}${totalChunks} chunks. Processing...`);

      const BATCH_SIZE = 3;
      let processed = 0;

      for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
        const batch = allChunks.slice(i, i + BATCH_SIZE);
        try {
          const res = await fetch('/api/admin/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chunks: batch, title: bookTitle, author: bookAuthor, storagePath }),
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
      throw err; // rethrow so queue handler marks it as error
    }
  };

  const handleProcessQueue = async () => {
    const pending = uploadQueue.filter(q => q.status === 'pending');
    if (pending.length === 0) return;
    setIsProcessing(true);

    for (const item of pending) {
      if (!item.title.trim() || !item.author.trim()) {
        updateQueueItem(item.id, { status: 'error', error: 'Title and author are required' });
        continue;
      }

      // Check for duplicate (same title AND author)
      const isDuplicate = dbBooks.some(
        b => b.title.toLowerCase() === item.title.trim().toLowerCase() &&
             b.author.toLowerCase() === item.author.trim().toLowerCase()
      );
      if (isDuplicate) {
        updateQueueItem(item.id, { status: 'error', error: `"${item.title.trim()}" by ${item.author.trim()} already exists in the knowledge base. Delete it first if you want to re-upload.` });
        continue;
      }

      updateQueueItem(item.id, { status: 'processing' });
      try {
        await processOneBook(item.file, item.title.trim(), item.author.trim());
        updateQueueItem(item.id, { status: 'done' });
      } catch (err: any) {
        updateQueueItem(item.id, { status: 'error', error: err.message || 'Processing failed' });
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
      setDbBooks(prev => prev.filter(b => b.title !== bookTitle));
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
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
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

  // ===== Taxonomy state =====
  type TaxCategory = {
    id: string; name: string; emoji: string; description: string;
    sort_order: number; is_active: boolean; useCases: TaxUseCase[];
  };
  type TaxUseCase = {
    id: string; category_id: string; title: string;
    sort_order: number; is_active: boolean;
  };

  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxExpanded, setTaxExpanded] = useState<string | null>(null);
  const [taxEditingCat, setTaxEditingCat] = useState<string | null>(null);
  const [taxEditCat, setTaxEditCat] = useState({ name: '', emoji: '', description: '' });
  const [taxEditingUc, setTaxEditingUc] = useState<string | null>(null);
  const [taxEditUcTitle, setTaxEditUcTitle] = useState('');
  const [taxNewCat, setTaxNewCat] = useState(false);
  const [taxNewCatForm, setTaxNewCatForm] = useState({ name: '', emoji: '', description: '' });
  const [taxNewUcFor, setTaxNewUcFor] = useState<string | null>(null);
  const [taxNewUcTitle, setTaxNewUcTitle] = useState('');
  const [taxSaving, setTaxSaving] = useState(false);

  const getAuthHeaders = async () => {
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const loadTaxonomy = async () => {
    setTaxLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/taxonomy/admin', { headers });
      const data = await res.json();
      if (data.categories) setTaxCategories(data.categories);
    } catch {}
    setTaxLoading(false);
  };

  useEffect(() => { if (isAdmin) loadTaxonomy(); }, [user, isAdmin]);

  const taxApi = async (method: string, body?: any, params?: string) => {
    setTaxSaving(true);
    try {
      const headers = await getAuthHeaders();
      const url = '/api/taxonomy/admin' + (params || '');
      const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (!res.ok) { const d = await res.json(); console.error(d.error); }
      await loadTaxonomy();
    } catch (e) { console.error(e); }
    setTaxSaving(false);
  };

  const handleAddCategory = () => {
    if (!taxNewCatForm.name.trim()) return;
    taxApi('POST', { type: 'category', ...taxNewCatForm });
    setTaxNewCat(false);
    setTaxNewCatForm({ name: '', emoji: '', description: '' });
  };

  const handleSaveCatEdit = (id: string) => {
    taxApi('PUT', { type: 'category', id, ...taxEditCat });
    setTaxEditingCat(null);
  };

  const handleToggleCat = (cat: TaxCategory) => {
    taxApi('PUT', { type: 'category', id: cat.id, is_active: !cat.is_active });
  };

  const handleDeleteCat = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}" and all its use cases?`)) return;
    taxApi('DELETE', undefined, `?type=category&id=${id}`);
  };

  const handleAddUseCase = (categoryId: string) => {
    if (!taxNewUcTitle.trim()) return;
    taxApi('POST', { type: 'use_case', category_id: categoryId, title: taxNewUcTitle });
    setTaxNewUcFor(null);
    setTaxNewUcTitle('');
  };

  const handleSaveUcEdit = (id: string) => {
    taxApi('PUT', { type: 'use_case', id, title: taxEditUcTitle });
    setTaxEditingUc(null);
  };

  const handleDeleteUc = (id: string, title: string) => {
    if (!confirm(`Delete use case "${title}"?`)) return;
    taxApi('DELETE', undefined, `?type=use_case&id=${id}`);
  };

  const handleMoveUc = (uc: TaxUseCase, direction: 'up' | 'down', siblings: TaxUseCase[]) => {
    const sorted = [...siblings].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(s => s.id === uc.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    // Swap sort orders
    taxApi('PUT', { type: 'use_case', id: uc.id, sort_order: other.sort_order });
    taxApi('PUT', { type: 'use_case', id: other.id, sort_order: uc.sort_order });
  };

  if (loading || adminLoading || !isAdmin) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-[#D4A017] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">Knowledge Base — Admin</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload books and manage the AI knowledge base</p>
      </header>

      {/* Upload Section */}
      <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
        <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider mb-4">Upload Books</h2>
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${dragActive ? 'border-[#D4A017] bg-[#D4A017]/10' : 'border-gray-300 dark:border-[#444] hover:border-[#666]'}`}
          onClick={() => document.getElementById('file-input')?.click()}>
          <input id="file-input" type="file" accept=".pdf,.txt,.md" multiple onChange={handleFileSelect} className="hidden" />
          <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Drop PDF, TXT, or MD files here</p>
          <p className="text-gray-600 text-sm mt-1">or click to browse (multiple files supported)</p>
        </div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase">Queue ({uploadQueue.filter(q => q.status === 'pending').length} pending)</span>
              {uploadQueue.some(q => q.status === 'done') && !isProcessing && (
                <button onClick={() => setUploadQueue(prev => prev.filter(q => q.status !== 'done'))}
                  className="text-xs text-gray-500 hover:text-gray-300">Clear completed</button>
              )}
            </div>
            {uploadQueue.map(item => (
              <div key={item.id} className={`p-3 rounded-lg border ${
                item.status === 'processing' ? 'bg-[#D4A017]/5 border-[#D4A017]/30' :
                item.status === 'done' ? 'bg-green-500/5 border-green-500/30' :
                item.status === 'error' ? 'bg-red-500/5 border-red-500/30' :
                'bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#333]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {item.status === 'pending' && <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                  {item.status === 'processing' && <Loader2 className="h-4 w-4 text-[#D4A017] animate-spin flex-shrink-0" />}
                  {item.status === 'done' && <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />}
                  {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate flex-1">{item.file.name} ({(item.file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    item.status === 'pending' ? 'bg-gray-500/20 text-gray-400' :
                    item.status === 'processing' ? 'bg-[#D4A017]/20 text-[#D4A017]' :
                    item.status === 'done' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{item.status}</span>
                  {item.status === 'pending' && (
                    <button onClick={() => removeFromQueue(item.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0" title="Remove">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {(item.status === 'pending' || item.status === 'error') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" value={item.title} onChange={e => updateQueueItem(item.id, { title: e.target.value })}
                      placeholder="Book title" disabled={isProcessing}
                      className="w-full p-2 bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-[#E8E8E0] border border-gray-300 dark:border-[#444] rounded text-sm focus:ring-1 focus:ring-[#D4A017] focus:outline-none placeholder-gray-600 disabled:opacity-50" />
                    <input type="text" value={item.author} onChange={e => updateQueueItem(item.id, { author: e.target.value })}
                      placeholder="Author" disabled={isProcessing}
                      className="w-full p-2 bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-[#E8E8E0] border border-gray-300 dark:border-[#444] rounded text-sm focus:ring-1 focus:ring-[#D4A017] focus:outline-none placeholder-gray-600 disabled:opacity-50" />
                  </div>
                )}
                {item.status === 'error' && item.error && (
                  <p className="text-red-400 text-xs mt-1">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Process Queue button */}
        {uploadQueue.some(q => q.status === 'pending') && (
          <button onClick={handleProcessQueue} disabled={isProcessing || !uploadQueue.some(q => q.status === 'pending' && q.title.trim() && q.author.trim())}
            className="mt-4 w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</> : <><Upload className="h-5 w-5" /> Process Queue ({uploadQueue.filter(q => q.status === 'pending').length} books)</>}
          </button>
        )}
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
                      {book.storage_path && (
                        <button onClick={() => handleDownload(book)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors" title="Download original file">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
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

      {/* ===== TAXONOMY SECTION ===== */}
      <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider">Categories &amp; Use Cases</h2>
          <div className="flex items-center gap-2">
            <button onClick={loadTaxonomy} className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#D4A017] flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
            <button onClick={() => setTaxNewCat(true)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold rounded hover:bg-[#E8B030] transition-colors">
              <Plus className="h-3 w-3" /> Add Category
            </button>
          </div>
        </div>

        {taxLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-[#D4A017] animate-spin" /></div>}

        {/* New Category Form */}
        {taxNewCat && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-[#333] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[60px_1fr_1fr] gap-2">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Emoji</label>
                <input type="text" value={taxNewCatForm.emoji} onChange={e => setTaxNewCatForm(p => ({ ...p, emoji: e.target.value }))}
                  placeholder="💼" maxLength={4}
                  className="w-full p-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017] text-center" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Name</label>
                <input type="text" value={taxNewCatForm.name} onChange={e => setTaxNewCatForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full p-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Description</label>
                <input type="text" value={taxNewCatForm.description} onChange={e => setTaxNewCatForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description"
                  className="w-full p-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setTaxNewCat(false); setTaxNewCatForm({ name: '', emoji: '', description: '' }); }}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300"><X className="h-3 w-3 inline mr-1" />Cancel</button>
              <button onClick={handleAddCategory} disabled={taxSaving || !taxNewCatForm.name.trim()}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017] text-[#0A0A0A] text-xs font-mono font-bold rounded hover:bg-[#E8B030] disabled:opacity-50">
                {taxSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Create
              </button>
            </div>
          </div>
        )}

        {/* Category List */}
        <div className="space-y-2">
          {taxCategories.map(cat => (
            <div key={cat.id} className={`bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-[#333] ${!cat.is_active ? 'opacity-50' : ''}`}>
              {/* Category Header */}
              <div className="p-3 flex items-center justify-between">
                {taxEditingCat === cat.id ? (
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <input type="text" value={taxEditCat.emoji} onChange={e => setTaxEditCat(p => ({ ...p, emoji: e.target.value }))}
                      className="w-12 p-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-center text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]" />
                    <input type="text" value={taxEditCat.name} onChange={e => setTaxEditCat(p => ({ ...p, name: e.target.value }))}
                      className="flex-1 min-w-[100px] p-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]" />
                    <input type="text" value={taxEditCat.description} onChange={e => setTaxEditCat(p => ({ ...p, description: e.target.value }))}
                      className="flex-1 min-w-[100px] p-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]" />
                    <button onClick={() => handleSaveCatEdit(cat.id)} disabled={taxSaving}
                      className="p-1.5 text-green-400 hover:text-green-300"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setTaxEditingCat(null)}
                      className="p-1.5 text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setTaxExpanded(taxExpanded === cat.id ? null : cat.id)}
                      className="flex items-center gap-2 flex-1 text-left">
                      <span className="text-lg">{cat.emoji}</span>
                      <div>
                        <span className="text-gray-800 dark:text-[#E8E8E0] font-medium">{cat.name}</span>
                        <span className="text-gray-500 text-xs ml-2">{cat.description}</span>
                        <span className="text-gray-600 text-xs ml-2">({cat.useCases.length})</span>
                      </div>
                      {taxExpanded === cat.id ? <ChevronUp className="h-4 w-4 text-gray-500 ml-auto" /> : <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />}
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => { setTaxEditingCat(cat.id); setTaxEditCat({ name: cat.name, emoji: cat.emoji || '', description: cat.description || '' }); }}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#D4A017]" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleToggleCat(cat)}
                        className={`p-1.5 ${cat.is_active ? 'text-green-400 hover:text-red-400' : 'text-red-400 hover:text-green-400'}`}
                        title={cat.is_active ? 'Deactivate' : 'Activate'}><Power className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDeleteCat(cat.id, cat.name)}
                        className="p-1.5 text-gray-500 hover:text-red-400" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </>
                )}
              </div>

              {/* Expanded Use Cases */}
              {taxExpanded === cat.id && (
                <div className="px-3 pb-3 space-y-1">
                  <div className="border-t border-gray-200 dark:border-[#333] pt-2 mb-2">
                    <button onClick={() => { setTaxNewUcFor(cat.id); setTaxNewUcTitle(''); }}
                      className="flex items-center gap-1 text-xs text-[#D4A017] hover:text-[#E8B030]">
                      <Plus className="h-3 w-3" /> Add Use Case
                    </button>
                  </div>

                  {/* Add Use Case Form */}
                  {taxNewUcFor === cat.id && (
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333]">
                      <input type="text" value={taxNewUcTitle} onChange={e => setTaxNewUcTitle(e.target.value)}
                        placeholder="Use case title" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleAddUseCase(cat.id); if (e.key === 'Escape') setTaxNewUcFor(null); }}
                        className="flex-1 p-1.5 bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]" />
                      <button onClick={() => handleAddUseCase(cat.id)} disabled={taxSaving || !taxNewUcTitle.trim()}
                        className="p-1.5 text-green-400 hover:text-green-300 disabled:opacity-50"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setTaxNewUcFor(null)}
                        className="p-1.5 text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>
                    </div>
                  )}

                  {/* Use Case List */}
                  {[...cat.useCases].sort((a, b) => a.sort_order - b.sort_order).map(uc => (
                    <div key={uc.id} className="flex items-center gap-2 p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333] group">
                      {taxEditingUc === uc.id ? (
                        <>
                          <input type="text" value={taxEditUcTitle} onChange={e => setTaxEditUcTitle(e.target.value)}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveUcEdit(uc.id); if (e.key === 'Escape') setTaxEditingUc(null); }}
                            className="flex-1 p-1.5 bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-[#444] rounded text-sm text-gray-800 dark:text-[#E8E8E0] focus:outline-none focus:border-[#D4A017]" />
                          <button onClick={() => handleSaveUcEdit(uc.id)} disabled={taxSaving}
                            className="p-1 text-green-400 hover:text-green-300"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setTaxEditingUc(null)}
                            className="p-1 text-gray-500 hover:text-gray-300"><X className="h-3.5 w-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{uc.title}</span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleMoveUc(uc, 'up', cat.useCases)}
                              className="p-1 text-gray-500 hover:text-[#D4A017]" title="Move up"><ArrowUp className="h-3 w-3" /></button>
                            <button onClick={() => handleMoveUc(uc, 'down', cat.useCases)}
                              className="p-1 text-gray-500 hover:text-[#D4A017]" title="Move down"><ArrowDown className="h-3 w-3" /></button>
                            <button onClick={() => { setTaxEditingUc(uc.id); setTaxEditUcTitle(uc.title); }}
                              className="p-1 text-gray-500 hover:text-[#D4A017]" title="Edit"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => handleDeleteUc(uc.id, uc.title)}
                              className="p-1 text-gray-500 hover:text-red-400" title="Delete"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {cat.useCases.length === 0 && (
                    <p className="text-gray-500 text-xs text-center py-2">No use cases yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!taxLoading && taxCategories.length === 0 && (
          <p className="text-gray-500 text-center py-8">No categories yet. Run the migration first.</p>
        )}
      </div>

      {/* Chunk Browser */}
      {viewingBook && (
        <div ref={chunkBrowserRef} className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider truncate min-w-0">
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
                      <div className="mt-3 space-y-3">
                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333]">
                            <span className="text-gray-500 dark:text-gray-400 font-mono uppercase block mb-0.5">Technique ID</span>
                            <span className="text-gray-800 dark:text-[#E8E8E0] font-medium">{chunk.technique_id || '—'}</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333]">
                            <span className="text-gray-500 dark:text-gray-400 font-mono uppercase block mb-0.5">Difficulty</span>
                            <span className={`font-medium ${chunk.difficulty === 'advanced' ? 'text-red-400' : chunk.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-green-400'}`}>
                              {chunk.difficulty || '—'}
                            </span>
                          </div>
                          <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333]">
                            <span className="text-gray-500 dark:text-gray-400 font-mono uppercase block mb-0.5">Risk Level</span>
                            <span className={`font-medium ${chunk.risk_level === 'high' ? 'text-red-400' : chunk.risk_level === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                              {chunk.risk_level || '—'}
                            </span>
                          </div>
                          <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333]">
                            <span className="text-gray-500 dark:text-gray-400 font-mono uppercase block mb-0.5">Chunk Type</span>
                            <span className="text-gray-800 dark:text-[#E8E8E0] font-medium">{chunk.chunk_type || '—'}</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333] col-span-2">
                            <span className="text-gray-500 dark:text-gray-400 font-mono uppercase block mb-0.5">Use Cases</span>
                            <div className="flex flex-wrap gap-1">
                              {chunk.use_cases?.length > 0 ? chunk.use_cases.map((uc, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-[#D4A017]/10 text-[#D4A017] rounded text-[10px] font-mono">{uc}</span>
                              )) : <span className="text-gray-500">—</span>}
                            </div>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="p-3 bg-white dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#333] text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                          {chunk.content}
                        </div>
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
