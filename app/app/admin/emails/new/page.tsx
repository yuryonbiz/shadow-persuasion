'use client';

/* ════════════════════════════════════════════════════════════
   /admin/emails/new — Create a blank template, then redirect
   into its editor.

   We collect the minimum needed to create a valid row (key,
   name, subject) plus optional sequence membership so an admin
   can add a new step to the cart_recovery sequence directly.
   Everything else (body, variables, from address, etc.) gets
   filled in on the editor page.
   ════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';

const DEFAULT_HTML_BODY = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
        <tr><td style="padding:32px;">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
            // SHADOW PERSUASION //
          </div>
          <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#1A1A1A;margin:0 0 18px 0;">
            {{greeting}}
          </h1>
          <p style="font-size:15px;line-height:1.6;margin:0 0 12px 0;">
            Replace this paragraph with your email body.
          </p>
          <p style="font-size:14px;line-height:1.7;margin:24px 0 6px 0;">Talk soon,</p>
          <p style="font-family:'Brush Script MT',cursive;font-size:24px;color:#1A1A1A;margin:0 0 24px 0;">Nate Harlan</p>
          <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>
          <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
            <a href="{{unsubscribe_url}}" style="color:#5C3A1E;">Unsubscribe</a> &middot; Shadow Persuasion
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const DEFAULT_TEXT_BODY = `{{greeting}}

Replace this with your email body.

Talk soon,
Nate Harlan

Unsubscribe: {{unsubscribe_url}}`;

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [triggerDescription, setTriggerDescription] = useState('');
  const [sequenceKey, setSequenceKey] = useState('');
  const [sequenceStep, setSequenceStep] = useState('');
  const [delayHours, setDelayHours] = useState('');
  const [isTransactional, setIsTransactional] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^[a-z0-9_]+$/.test(key)) {
      setError('Key must be lowercase letters, digits, or underscores only (e.g. "welcome_email").');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!subject.trim()) {
      setError('Subject is required.');
      return;
    }

    setSaving(true);
    try {
      // Sensible default variables so the editor preview has something
      // to substitute. The admin can add/remove variables afterwards.
      const variables = [
        { name: 'greeting', description: 'First name if known, else generic greeting', sample: 'Yury,' },
      ];
      if (!isTransactional) {
        variables.push({
          name: 'unsubscribe_url',
          description: 'Auto-populated one-click unsubscribe link (HMAC-signed).',
          sample: 'https://shadowpersuasion.com/api/unsubscribe?e=...&sig=...',
        });
      }

      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          name,
          subject,
          trigger_description: triggerDescription || null,
          body_html: DEFAULT_HTML_BODY,
          body_text: DEFAULT_TEXT_BODY,
          from_name: 'Nate Harlan',
          from_email: 'nate@shadowpersuasion.com',
          variables,
          // Optional sequence membership — only send if the admin filled them in.
          ...(sequenceKey.trim() ? { sequence_key: sequenceKey.trim() } : {}),
          ...(sequenceStep ? { sequence_step: Number(sequenceStep) } : {}),
          ...(delayHours ? { delay_hours: Number(delayHours) } : {}),
          is_transactional: isTransactional,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Create failed');

      // The POST route returns { template: <row> } — jump straight into the editor
      router.push(`/app/admin/emails/${d.template.key}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  // Auto-slug the key from the name if the user hasn't manually edited the key yet.
  function handleNameChange(next: string) {
    setName(next);
    // If the key is empty or was auto-derived from the previous name, keep it synced.
    const prevAutoKey = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (key === '' || key === prevAutoKey) {
      const auto = next
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setKey(auto);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <Link
        href="/app/admin/emails"
        className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono"
      >
        <ArrowLeft className="h-4 w-4" /> Back to emails
      </Link>

      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
          // NEW TEMPLATE //
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
          Create Email Template
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
          We&apos;ll seed the body with a styled Shadow Persuasion shell so the preview
          isn&apos;t empty. You can rewrite everything in the editor.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-3 mb-5 font-mono text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5 space-y-5"
      >
        <Field
          label="Name"
          hint="Admin-facing label. Shown in the templates list."
          required
        >
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Welcome Email"
            required
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
        </Field>

        <Field
          label="Key"
          hint="Lowercase letters, digits, underscores. Used in code to look up this template. Can't be changed later — clone-then-delete if you need to rename."
          required
        >
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="welcome_email"
            required
            pattern="[a-z0-9_]+"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
        </Field>

        <Field
          label="Subject"
          hint="Supports {{variable}} placeholders."
          required
        >
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Welcome, {{greeting}}"
            required
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
        </Field>

        <Field
          label="Trigger description"
          hint="Free text — describe what event fires this email. Useful for your team."
        >
          <textarea
            value={triggerDescription}
            onChange={(e) => setTriggerDescription(e.target.value)}
            rows={2}
            placeholder="e.g. Fires when a new Stripe subscription is created."
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
        </Field>

        <div className="pt-4 border-t border-gray-200 dark:border-[#D4A017]/10 space-y-5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
            Optional — sequence membership
          </p>
          <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 -mt-2">
            Leave these blank for a standalone template. Fill them in to add this template to
            a recurring sequence (e.g. cart_recovery) — the cron will automatically fire it.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Sequence key" hint='e.g. "cart_recovery"'>
              <input
                type="text"
                value={sequenceKey}
                onChange={(e) => setSequenceKey(e.target.value)}
                placeholder="cart_recovery"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
              />
            </Field>
            <Field label="Step" hint="1, 2, 3…">
              <input
                type="number"
                value={sequenceStep}
                onChange={(e) => setSequenceStep(e.target.value)}
                placeholder="4"
                min="1"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
              />
            </Field>
            <Field label="Delay hours" hint="Hours after trigger">
              <input
                type="number"
                value={delayHours}
                onChange={(e) => setDelayHours(e.target.value)}
                placeholder="168"
                min="0"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
              />
            </Field>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-[#F4ECD8]/70">
            <input
              type="checkbox"
              checked={isTransactional}
              onChange={(e) => setIsTransactional(e.target.checked)}
              className="accent-[#D4A017] mt-0.5"
            />
            <span>
              <span className="font-bold">Transactional</span> — bypasses unsubscribe check.
              Only use this for receipts, delivery, and required account notifications. Marketing
              emails must stay unchecked.
            </span>
          </label>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-[#D4A017]/10">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] font-mono text-xs uppercase tracking-wider font-bold disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            {saving ? 'Creating…' : 'Create & edit'}
          </button>
          <Link
            href="/app/admin/emails"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] font-mono text-xs uppercase tracking-wider"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {hint && (
        <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50 mt-1">{hint}</p>
      )}
    </label>
  );
}
