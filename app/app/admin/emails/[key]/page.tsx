'use client';

/* ════════════════════════════════════════════════════════════
   /admin/emails/[key] — single template editor

   Layout (desktop):
     left column  — metadata (name, subject, from, trigger notes) +
                    variable list + save/test-send actions
     right column — tabbed body editor (Visual / HTML / Preview)
                    and the plain-text body below

   The test-send sends a live email to whatever address the admin
   types in, with variables filled from either their overrides or
   the template's documented sample values.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send, RefreshCw, Trash2 } from 'lucide-react';
import EmailEditor from '@/components/admin/EmailEditor';

type Variable = { name: string; description?: string; sample?: string };

type Template = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  trigger_description: string | null;
  subject: string;
  body_html: string;
  body_text: string;
  from_name: string | null;
  from_email: string | null;
  variables: Variable[];
  provider: string;
  is_system: boolean;
  enabled: boolean;
  sequence_key: string | null;
  sequence_step: number | null;
  created_at: string;
  updated_at: string;
};

type Send = {
  id: string;
  to_email: string;
  subject: string | null;
  status: 'sent' | 'failed' | 'skipped';
  provider_id: string | null;
  error: string | null;
  created_at: string;
};

export default function EmailEditorPage() {
  const params = useParams<{ key: string }>();
  const router = useRouter();
  const key = params.key;

  const [tpl, setTpl] = useState<Template | null>(null);
  const [sends, setSends] = useState<Send[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Test-send UI state
  const [testTo, setTestTo] = useState('');
  const [testBusy, setTestBusy] = useState(false);
  const [varOverrides, setVarOverrides] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/emails/${key}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to load');
      setTpl(d.template);
      setSends(d.sends ?? []);
      // Preload variable overrides from the template's own sample values
      const initial: Record<string, string> = {};
      for (const v of (d.template?.variables ?? []) as Variable[]) {
        initial[v.name] = v.sample ?? '';
      }
      setVarOverrides(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  function patch<K extends keyof Template>(field: K, value: Template[K]) {
    setTpl((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave() {
    if (!tpl) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/emails/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tpl.name,
          description: tpl.description,
          trigger_description: tpl.trigger_description,
          subject: tpl.subject,
          body_html: tpl.body_html,
          body_text: tpl.body_text,
          from_name: tpl.from_name,
          from_email: tpl.from_email,
          variables: tpl.variables,
          enabled: tpl.enabled,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Save failed');
      setTpl(d.template);
      setFlash('Saved');
      setTimeout(() => setFlash(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleTestSend() {
    if (!tpl) return;
    if (!testTo || !/@/.test(testTo)) {
      setError('Enter a valid email to send the test to.');
      return;
    }
    setTestBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/emails/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          to: testTo,
          variables: varOverrides,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Test send failed');
      setFlash(`Test sent to ${testTo}${d.id ? ` (Resend id ${d.id})` : ''}`);
      setTimeout(() => setFlash(null), 5000);
      // Refresh sends log
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setTestBusy(false);
    }
  }

  async function handleDelete() {
    if (!tpl) return;
    if (!confirm(`Delete "${tpl.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/emails/${key}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      router.push('/app/admin/emails');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">Loading template…</p>
      </div>
    );
  }
  if (error && !tpl) {
    return (
      <div className="p-6 md:p-10">
        <Link href="/app/admin/emails" className="inline-flex items-center gap-2 text-[#D4A017] mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to emails
        </Link>
        <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
      </div>
    );
  }
  if (!tpl) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      {/* Back */}
      <Link
        href="/app/admin/emails"
        className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono"
      >
        <ArrowLeft className="h-4 w-4" /> Back to emails
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // EMAIL TEMPLATE //
          </p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8] break-words">
            {tpl.name}
          </h1>
          <p className="font-mono text-[11px] text-gray-500 dark:text-[#F4ECD8]/50 mt-2">
            {tpl.key}
            {tpl.is_system && ' · SYSTEM'}
            {!tpl.enabled && ' · DISABLED'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] font-mono text-xs uppercase tracking-wider"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] font-mono text-xs uppercase tracking-wider font-bold disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            {saving ? 'Saving…' : 'Save'}
          </button>
          {!tpl.is_system && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111] border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-mono text-xs uppercase tracking-wider"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-3 mb-5 font-mono text-sm">
          {error}
        </div>
      )}
      {flash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600 text-green-700 dark:text-green-300 p-3 mb-5 font-mono text-sm">
          ✓ {flash}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* LEFT — metadata + variables + test send */}
        <div className="space-y-5">
          {/* Core fields */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 space-y-3">
            <LabeledInput
              label="Name"
              value={tpl.name}
              onChange={(v) => patch('name', v)}
            />
            <LabeledInput
              label="Subject"
              value={tpl.subject}
              onChange={(v) => patch('subject', v)}
              hint="Supports {{variable}} placeholders"
            />
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput
                label="From name"
                value={tpl.from_name ?? ''}
                onChange={(v) => patch('from_name', v || null)}
              />
              <LabeledInput
                label="From email"
                value={tpl.from_email ?? ''}
                onChange={(v) => patch('from_email', v || null)}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#F4ECD8]/70 pt-1">
              <input
                type="checkbox"
                checked={tpl.enabled}
                onChange={(e) => patch('enabled', e.target.checked)}
                className="accent-[#D4A017]"
              />
              Enabled (disabled templates are skipped on send)
            </label>
          </div>

          {/* Trigger description (read-only context) */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
              Trigger
            </p>
            <textarea
              value={tpl.trigger_description ?? ''}
              onChange={(e) => patch('trigger_description', e.target.value || null)}
              rows={3}
              placeholder="Describe what makes this email fire"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-xs font-mono focus:outline-none focus:border-[#D4A017]"
            />
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mt-3 mb-2">
              Admin notes
            </p>
            <textarea
              value={tpl.description ?? ''}
              onChange={(e) => patch('description', e.target.value || null)}
              rows={3}
              placeholder="Internal notes for your team"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-xs focus:outline-none focus:border-[#D4A017]"
            />
          </div>

          {/* Variables */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
              Variables ({tpl.variables.length})
            </p>
            {tpl.variables.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                No variables declared.
              </p>
            ) : (
              <div className="space-y-2">
                {tpl.variables.map((v) => (
                  <div
                    key={v.name}
                    className="text-xs border border-gray-200 dark:border-[#D4A017]/10 p-2 bg-gray-50 dark:bg-[#0A0A0A]"
                  >
                    <p className="font-mono text-[11px] text-[#D4A017]">{`{{${v.name}}}`}</p>
                    {v.description && (
                      <p className="text-gray-600 dark:text-[#F4ECD8]/60 mt-1">{v.description}</p>
                    )}
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 mt-2 mb-1">
                      Preview / test value
                    </label>
                    <input
                      type="text"
                      value={varOverrides[v.name] ?? ''}
                      onChange={(e) =>
                        setVarOverrides((prev) => ({ ...prev, [v.name]: e.target.value }))
                      }
                      className="w-full px-2 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-xs font-mono focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test send */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
              Send a test
            </p>
            <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 mb-3">
              Sends the CURRENT saved version of the template to the address below. Save any
              edits first — the test uses what&apos;s in the DB, not unsaved changes.
            </p>
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 mb-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
            />
            <button
              onClick={handleTestSend}
              disabled={testBusy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] font-mono text-xs uppercase tracking-wider font-bold disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
              {testBusy ? 'Sending…' : 'Send test email'}
            </button>
          </div>

          {/* Recent sends */}
          {sends.length > 0 && (
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
                Recent sends ({sends.length})
              </p>
              <div className="space-y-2">
                {sends.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 text-[10px] font-mono border border-gray-200 dark:border-[#D4A017]/10 p-2 bg-gray-50 dark:bg-[#0A0A0A]"
                  >
                    <span
                      className={`px-1.5 py-0.5 uppercase tracking-wider ${
                        s.status === 'sent'
                          ? 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
                          : s.status === 'skipped'
                          ? 'bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#F4ECD8]/70'
                          : 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-gray-900 dark:text-[#F4ECD8] truncate">{s.to_email}</span>
                    <span className="text-gray-400 dark:text-[#F4ECD8]/40 ml-auto shrink-0">
                      {fmtDate(s.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — body editor + plain text */}
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
              HTML body
            </p>
            <EmailEditor
              value={tpl.body_html}
              onChange={(v) => patch('body_html', v)}
              previewVars={varOverrides}
            />
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
              Plain-text body
            </p>
            <textarea
              value={tpl.body_text}
              onChange={(e) => patch('body_text', e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-xs font-mono focus:outline-none focus:border-[#D4A017] resize-y"
              spellCheck={false}
            />
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 mt-1">
              Shown to email clients that can&apos;t render HTML. Supports the same{' '}
              <span className="text-[#D4A017]">&#x7B;&#x7B;variable&#x7D;&#x7D;</span> placeholders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
      />
      {hint && (
        <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50 mt-0.5">
          {hint}
        </p>
      )}
    </label>
  );
}
