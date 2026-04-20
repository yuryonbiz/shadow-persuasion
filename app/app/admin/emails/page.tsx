'use client';

/* ════════════════════════════════════════════════════════════
   /admin/emails — list every template + quick actions

   Shows every Resend template the system can send, grouped by
   sequence (cart_recovery steps 1–3 cluster together) and by
   standalone templates. System templates can't be deleted (only
   disabled); clones become regular editable templates.

   Firebase-owned templates (password reset) are called out in a
   separate info card — we can't edit those from here.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Mail,
  Copy,
  Trash2,
  Plus,
  ExternalLink,
  Lock,
} from 'lucide-react';

type Template = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  trigger_description: string | null;
  subject: string;
  from_name: string | null;
  from_email: string | null;
  provider: string;
  is_system: boolean;
  enabled: boolean;
  sequence_key: string | null;
  sequence_step: number | null;
  created_at: string;
  updated_at: string;
};

export default function EmailsListPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/emails');
      const d = await res.json();
      setTemplates(d.templates ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleClone(key: string) {
    const newKey = prompt(
      `Clone "${key}" as a new template. Enter a new key (lowercase letters, digits, underscores):`,
      `${key}_copy`
    );
    if (!newKey) return;
    setBusy(`clone:${key}`);
    try {
      const res = await fetch(`/api/admin/emails/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clone', newKey }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Clone failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(tpl: Template) {
    if (!confirm(`Delete template "${tpl.name}"? This cannot be undone.`)) return;
    setBusy(`delete:${tpl.key}`);
    try {
      const res = await fetch(`/api/admin/emails/${tpl.key}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleToggleEnabled(tpl: Template) {
    setBusy(`enable:${tpl.key}`);
    try {
      const res = await fetch(`/api/admin/emails/${tpl.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !tpl.enabled }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Update failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  // Group by sequence — sequences render as a vertical stack with
  // step numbers; standalone templates appear in a flat list below.
  const sequences: Record<string, Template[]> = {};
  const standalone: Template[] = [];
  for (const t of templates) {
    if (t.sequence_key) {
      if (!sequences[t.sequence_key]) sequences[t.sequence_key] = [];
      sequences[t.sequence_key].push(t);
    } else {
      standalone.push(t);
    }
  }
  for (const k of Object.keys(sequences)) {
    sequences[k].sort(
      (a, b) => (a.sequence_step ?? 0) - (b.sequence_step ?? 0)
    );
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // EMAILS //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Email Templates
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            {templates.length} template{templates.length === 1 ? '' : 's'} · Every automated email the system sends.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-[#D4A017] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/app/admin/emails/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] font-mono text-xs uppercase tracking-wider font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            New Template
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-3 mb-5 font-mono text-sm">
          {error}
        </div>
      )}

      {/* Sequences */}
      {Object.entries(sequences).map(([seqKey, steps]) => (
        <div
          key={seqKey}
          className="mb-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#D4A017] mb-3">
            Sequence · {seqKey}
          </p>
          <div className="space-y-2">
            {steps.map((t) => (
              <TemplateRow
                key={t.key}
                tpl={t}
                busy={busy}
                onClone={handleClone}
                onDelete={handleDelete}
                onToggleEnabled={handleToggleEnabled}
                fmtDate={fmtDate}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Standalone templates */}
      {standalone.length > 0 && (
        <div className="mb-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#D4A017] mb-3">
            Standalone templates
          </p>
          <div className="space-y-2">
            {standalone.map((t) => (
              <TemplateRow
                key={t.key}
                tpl={t}
                busy={busy}
                onClone={handleClone}
                onDelete={handleDelete}
                onToggleEnabled={handleToggleEnabled}
                fmtDate={fmtDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Firebase callout */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#D4A017] mb-3">
          Provider-managed emails
        </p>
        <div className="flex items-start gap-3 py-2">
          <Lock className="h-5 w-5 text-gray-400 dark:text-[#F4ECD8]/40 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-[#F4ECD8] text-sm">
              Password Reset
            </p>
            <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 mt-1">
              Sent by Firebase Authentication when a user clicks &ldquo;Forgot Password.&rdquo; Template lives
              in the Firebase console, not in this app. Edit it at Firebase Console → Authentication → Templates → Password reset.
            </p>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
            >
              Open Firebase console <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateRow({
  tpl,
  busy,
  onClone,
  onDelete,
  onToggleEnabled,
  fmtDate,
}: {
  tpl: Template;
  busy: string | null;
  onClone: (key: string) => void;
  onDelete: (tpl: Template) => void;
  onToggleEnabled: (tpl: Template) => void;
  fmtDate: (iso: string) => string;
}) {
  return (
    <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/10 flex-wrap">
      <Mail className="h-5 w-5 text-[#D4A017] mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/app/admin/emails/${tpl.key}`}
            className="font-bold text-gray-900 dark:text-[#F4ECD8] hover:text-[#D4A017] text-sm"
          >
            {tpl.name}
          </Link>
          {tpl.sequence_step != null && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#D4A017]/10 text-[#D4A017]">
              Step {tpl.sequence_step}
            </span>
          )}
          {tpl.is_system && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#F4ECD8]/70">
              System
            </span>
          )}
          {!tpl.enabled && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
              Disabled
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] text-gray-500 dark:text-[#F4ECD8]/50 mt-1">
          <span className="uppercase tracking-wider">{tpl.key}</span>
          {' · '}
          Subject: {tpl.subject}
        </p>
        {tpl.trigger_description && (
          <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 mt-1 line-clamp-2">
            {tpl.trigger_description}
          </p>
        )}
        <p className="font-mono text-[10px] text-gray-400 dark:text-[#F4ECD8]/40 mt-1">
          Updated {fmtDate(tpl.updated_at)}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <Link
          href={`/app/admin/emails/${tpl.key}`}
          className="px-2.5 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] font-mono text-[10px] uppercase tracking-wider"
        >
          Edit
        </Link>
        <button
          onClick={() => onToggleEnabled(tpl)}
          disabled={busy === `enable:${tpl.key}`}
          className="px-2.5 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-[10px] uppercase tracking-wider"
        >
          {tpl.enabled ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => onClone(tpl.key)}
          disabled={busy === `clone:${tpl.key}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-[10px] uppercase tracking-wider"
        >
          <Copy className="h-3 w-3" />
          Clone
        </button>
        <button
          onClick={() => onDelete(tpl)}
          disabled={busy === `delete:${tpl.key}` || tpl.is_system}
          title={tpl.is_system ? 'System templates can\'t be deleted' : ''}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#111] border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-[10px] uppercase tracking-wider"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  );
}
