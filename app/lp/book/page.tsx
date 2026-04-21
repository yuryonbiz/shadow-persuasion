'use client';

/* ════════════════════════════════════════════════════════════
   /lp/book — Shadow Persuasion Front-End Funnel
   The 47 Counterintuitive Conversation Tactics
   $7 ebook funnel — built using Alen Sultanic's AC template
   ════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { Special_Elite } from 'next/font/google';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  AlertTriangle,
  ChevronDown,
  Lock,
  Zap,
  ChevronsRight,
  Briefcase,
  Eye,
  Sparkles,
} from 'lucide-react';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

/* ─────────────── Reusable yellow highlighter span ─────────────── */
const HL = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{ background: 'rgba(212, 160, 23, 0.30)', padding: '0 4px', borderRadius: 2 }}
    className="font-semibold"
  >
    {children}
  </span>
);

/* ─────────────── Reusable: Document divider ─────────────── */
function DocDivider({ text }: { text?: string }) {
  return (
    <div className="border-t-2 border-b-2 border-[#5C3A1E] py-1 my-12 text-xs text-center text-[#6B5B3E] tracking-[0.25em] uppercase">
      <p>{text || 'CLASSIFICATION: PUBLIC DROP'}</p>
    </div>
  );
}

/* ─────────────── Order CTA box (used multiple times) ─────────────── */
function OrderBox({ small = false, bgVariant = 'cream' }: { small?: boolean; bgVariant?: 'cream' | 'dark' }) {
  const isDark = bgVariant === 'dark';
  return (
    <div
      className={`mx-auto max-w-2xl border-4 ${
        isDark ? 'border-[#D4A017] bg-[#1A1A1A] text-[#F4ECD8]' : 'border-black bg-[#F4ECD8] text-[#1A1A1A]'
      } p-6 md:p-10 text-center shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]`}
    >
      <p className={`text-xs font-mono uppercase tracking-[0.25em] ${isDark ? 'text-[#D4A017]' : 'text-[#5C3A1E]'} mb-3`}>
        ⏱  This Offer Expires Soon. Limited Time.
      </p>
      <div className="flex items-end justify-center gap-3 mb-2">
        <span className={`text-2xl line-through ${isDark ? 'text-[#F4ECD8]/40' : 'text-[#5C3A1E]/60'}`}>$47</span>
        <span className={`text-6xl md:text-7xl font-black ${isDark ? 'text-[#D4A017]' : 'text-black'}`}>$7</span>
      </div>
      <p className={`text-sm ${isDark ? 'text-[#D4A017]' : 'text-green-700'} font-bold uppercase tracking-wider mb-6`}>
        Save $40 Today
      </p>
      <p className={`text-base mb-6 ${isDark ? 'text-[#F4ECD8]/80' : 'text-[#3B2E1A]'}`}>
        Download the eBook for <span className="line-through">$47</span>{' '}just <strong>$7</strong>.<br />
        Delivered instantly. Start reading in the next 2 minutes.
      </p>
      <a
        href="/checkout/book"
        className={`inline-flex items-center gap-2 ${
          isDark
            ? 'bg-[#D4A017] hover:bg-[#C4901A] text-black'
            : 'bg-black hover:bg-[#1A1A1A] text-[#F4ECD8]'
        } font-mono uppercase font-bold text-base md:text-lg px-8 md:px-10 py-4 tracking-wider transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]`}
      >
        Download eBook Now
        <ArrowRight className="h-5 w-5" />
      </a>
      {!small && (
        <div className={`mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs ${isDark ? 'text-[#F4ECD8]/60' : 'text-[#5C3A1E]'}`}>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Secure checkout</span>
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 30-day money-back</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant delivery</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Testimonial card ─────────────── */
function Testimonial({
  name,
  result,
  quote,
  hidden,
}: {
  name: string;
  result: string;
  quote: string;
  hidden: string;
}) {
  return (
    <div className="bg-white border-2 border-[#5C3A1E]/30 p-6 md:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,0.10)] relative">
      <div className="absolute -top-3 left-6 bg-[#D4A017] text-black px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold">
        Operator Report
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5C3A1E] to-[#1A1A1A] flex items-center justify-center text-[#F4ECD8] font-mono font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-mono font-bold text-[#1A1A1A]">{name}</p>
          <p className="text-xs text-[#5C3A1E] uppercase tracking-wide">{result}</p>
        </div>
      </div>
      <p className="text-sm md:text-base leading-relaxed text-[#1A1A1A] mb-3 italic">&ldquo;{quote}&rdquo;</p>
      <div className="border-t border-[#5C3A1E]/20 pt-3 mt-3">
        <p className="text-xs text-[#5C3A1E] uppercase tracking-wider font-bold mb-1">Hidden Benefit:</p>
        <p className="text-sm text-[#3B2E1A]">{hidden}</p>
      </div>
    </div>
  );
}

/* ─────────────── Bullet for "what you'll discover" ─────────────── */
function DiscoveryBullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#5C3A1E]/15 last:border-b-0">
      <CheckCircle className="h-5 w-5 text-[#D4A017] shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-base md:text-lg leading-relaxed text-[#1A1A1A]">{children}</p>
      </div>
    </div>
  );
}

/* ─────────────── Bonus card ─────────────── */
function BonusCard({
  num,
  title,
  description,
  value,
  icon: Icon,
}: {
  num: string;
  title: string;
  description: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white border-2 border-black relative shadow-[6px_6px_0_0_#D4A017]">
      <div className="absolute -top-3 -left-3 bg-[#D4A017] text-black px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold border-2 border-black">
        Free Bonus #{num}
      </div>
      <div className="p-6 md:p-8 flex gap-5 items-start">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F4ECD8] border-2 border-black flex items-center justify-center shrink-0">
          <Icon className="h-8 w-8 md:h-10 md:w-10 text-[#D4A017]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">{title}</h3>
          <p className="text-sm md:text-base text-[#3B2E1A] leading-relaxed mb-3">{description}</p>
          <p className="font-mono text-xs uppercase tracking-wider text-[#5C3A1E]">
            Value: <span className="line-through">{value}</span> <span className="text-[#D4A017] font-bold">FREE</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── FAQ Accordion ─────────────── */
function FAQItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#5C3A1E]/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left py-5 group"
      >
        <span className="text-base md:text-lg font-bold text-[#1A1A1A] group-hover:text-[#D4A017] transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[#D4A017] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-5 text-base leading-relaxed text-[#3B2E1A]">{a}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */

export default function BookFunnelPage() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] overflow-x-hidden`}>
      {/* ═════════ TOP BANNER — urgency strip ═════════ */}
      <div className="bg-black text-[#F4ECD8] py-2.5 text-center text-xs md:text-sm font-mono uppercase tracking-wider">
        ⚠  Limited Time: Get The Field Manual For <span className="text-[#D4A017]">$7</span> (Normally $47).  <a href="/checkout/book" className="underline hover:text-[#D4A017]">Claim Now →</a>
      </div>

      {/* ═════════ 1. HERO ═════════ */}
      <section className="relative px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <img src="/logo.png" alt="Shadow Persuasion" className="w-32 md:w-44 mx-auto mb-8 dark:hidden" />

          <p className="text-lg md:text-2xl lg:text-3xl text-[#5C3A1E] font-bold uppercase tracking-wider leading-snug mb-8 max-w-4xl mx-auto">
            For Anyone Who&apos;s Ever Walked Out Of A Conversation Wondering Why They Just Agreed To Something They Didn&apos;t Want To Agree To
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
            New Field Manual Reveals The{' '}
            <span className="text-[#D4A017]">47 Counterintuitive Conversation Tactics</span>{' '}
            That Make People Say <HL>Yes Without Realizing Why</HL>
          </h1>

          <p className="text-lg md:text-xl text-[#3B2E1A] max-w-3xl mx-auto leading-relaxed mb-10">
            While bypassing their built-in &ldquo;persuasion detector,&rdquo; eliminating the awkwardness of memorized scripts,
            and working in real everyday conversations. Not just pitches and negotiations.
          </p>

          {/* Book mockup placeholder */}
          <div className="my-12 flex justify-center">
            <div className="relative">
              <div className="w-56 md:w-72 h-72 md:h-96 bg-gradient-to-br from-[#1A1A1A] via-[#2A1F0E] to-[#0A0A0A] border-4 border-[#D4A017] shadow-[12px_12px_0_0_rgba(0,0,0,0.4)] flex flex-col justify-between p-6 md:p-8 transform -rotate-2">
                <div>
                  <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#D4A017] mb-3">
                    Shadow Persuasion
                  </p>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#F4ECD8] leading-tight">
                    The 47 Counter-<br/>intuitive Conversation Tactics
                  </h2>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#F4ECD8]/70 italic mb-2">
                    That make people say yes without realizing why
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#D4A017]">
                    [Field Manual]
                  </p>
                </div>
                <div className="absolute -top-4 -right-4 bg-[#D4A017] text-black px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold border-2 border-black rotate-12">
                  $7
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <a
              href="/checkout/book"
              className="inline-flex items-center bg-black text-[#F4ECD8] font-mono uppercase font-bold text-lg md:text-xl px-10 md:px-14 py-5 tracking-wider hover:bg-[#1A1A1A] transition-all shadow-[6px_6px_0_0_#D4A017] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#D4A017]"
            >
              Get The Book For $7 <ArrowRight className="ml-3 h-6 w-6" />
            </a>
            <p className="text-sm text-[#5C3A1E]">
              <span className="font-bold">$47</span> <span className="line-through opacity-60">→</span> <span className="font-bold text-[#1A1A1A]">$7 today</span> · 30-day money-back guarantee · Instant download
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 2. WHAT IS SHADOW PERSUASION? ═════════ */}
      <DocDivider text="// WHAT IS SHADOW PERSUASION? //" />

      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider mb-6">
              What Is <span className="text-[#D4A017]">Shadow Persuasion</span>?
            </h2>
            <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
              <p>
                <strong>Shadow Persuasion</strong>{' '}is a counterintuitive approach to influence that lets you win
                the conversations that actually decide your life. Salary negotiations. Fights with your partner.
                Arguments with teenagers. Custody mediation. Reconnecting with estranged family. Sales calls.
                Job interviews. Conversations with manipulators you cannot cut out of your life.
              </p>
              <p>
                You win these conversations <HL>without the other person ever realizing they were being persuaded.</HL>
              </p>
              <p>
                We do it by deploying <strong>47 below-the-radar tactics</strong>{' '}that bypass the brain&apos;s
                built-in &ldquo;persuasion detector.&rdquo; That is the defense mechanism firing in your listener&apos;s head
                the second they sense you are trying to influence them. It is also the reason why 90% of the techniques
                you read about in every other influence book quietly stop working the moment you deploy them.
              </p>
              <p>
                This is <strong>Shadow Persuasion</strong>.
              </p>
            </div>
          </div>
          <div className="bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.10)]">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#5C3A1E] border-b border-[#5C3A1E]/30 pb-3 mb-5">
              How It Works // 4 Parts
            </p>
            <ol className="space-y-4">
              {[
                { n: '01', title: 'Disable The Detector', body: 'In the first 30 seconds, turn off the listener\'s "I\'m being sold" alarm.' },
                { n: '02', title: 'Plant The Conclusion', body: 'Structure the conversation so they reach your outcome on their own.' },
                { n: '03', title: 'Shift The Frame', body: 'When you can\'t win the conversation being had, quietly change what it\'s about.' },
                { n: '04', title: 'Lock In Without Closing', body: 'Exit in a way that prevents reversal without any visible "closing" move.' },
              ].map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="font-mono text-3xl font-black text-[#D4A017] leading-none">{s.n}</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-sm md:text-base text-[#1A1A1A]">{s.title}</p>
                    <p className="text-sm text-[#3B2E1A] mt-1">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ═════════ 3. SECONDARY HEADLINE ═════════ */}
      <DocDivider text="// THE STORY //" />

      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
          Here&apos;s How I Went From <HL>Losing Almost Every Important Conversation</HL>{' '}In My Life…
          <br className="hidden md:block" />
          To Closing Almost Every One I Walk Into
        </h2>
        <p className="text-base md:text-lg text-[#3B2E1A] max-w-3xl mx-auto">
          By throwing out every persuasion book on my shelf and doing the opposite of what they teach.
          <br />
          <em>This is something completely new, completely different, completely unlike anything you&apos;ve heard about influence before. Read the story below to discover Shadow Persuasion.</em>
        </p>
      </section>

      {/* ═════════ 4. THE LETTER ═════════ */}
      <section className="px-6 py-8 md:py-12 max-w-3xl mx-auto text-base md:text-lg leading-[1.85] text-[#1A1A1A] space-y-5">
        <p><strong>Dear Future Shadow Persuader,</strong></p>
        <p>
          <strong>From:</strong>{' '}The laptop of Nate Harlan<br />
          <strong>Re:</strong>{' '}Why every persuasion book in your house is making you worse at this (and the only counterintuitive way out)
        </p>

        <hr className="border-[#5C3A1E]/30 my-8" />

        <p>
          Would it surprise you to learn that I went from <HL>losing 90% of my important conversations</HL>{' '}to winning
          almost every one I walk into, using the information revealed in this field manual?
        </p>
        <p>Skeptical?</p>
        <p>You should be.</p>
        <p>After all, you can&apos;t believe everything you read on the internet :-)</p>

        <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-wide pt-6">
          So Let Me Prove It To You
        </h3>
        <p>But first, read this disclaimer:</p>
        <p>
          I have the benefit of spending the last eight years recording, dissecting, and reverse-engineering over four
          hundred hours of my own high-stakes conversations. Sales calls. Negotiations. Hard conversations with my wife.
          Parent-teacher conferences. Custody mediation. An ugly three-month kitchen renovation dispute. Coaching sessions
          with my private clients. I have watched my own tactics land and fail at a level of detail most people never get.
        </p>
        <p>
          The average person who buys any &ldquo;how to&rdquo; information gets little to no results. I&apos;m using
          these references for example purposes only.
        </p>
        <p>
          Your results will vary and depend on many factors. Including but not limited to your background, experience,
          and willingness to actually try the tactics in real conversations instead of just reading about them.
        </p>
        <p>
          All purchases entail risk as well as massive and consistent effort and action. If you&apos;re not willing to
          accept that, please <strong>DO NOT</strong>{' '}get this eBook.
        </p>
        <p>And yes, it took me time and energy to figure this out.</p>
        <p>With that said... let me jump right in and show you...</p>
      </section>

      {/* ═════════ 5. THE COUNTERINTUITIVE MODEL ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            And I Did It By Using A <HL>Completely Counterintuitive Model</HL>{' '}That I&apos;m About To Share With You On This Very Page
          </h2>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A] max-w-3xl mx-auto">
            <p>
              The same <strong>Shadow Persuasion</strong>{' '}model that{' '}
              <HL>1,200+ readers from every walk of life</HL>{' '}are now using to win conversations they used to lose.
            </p>
            <p>
              Sales professionals closing deals they used to leave on the table. Parents finally getting teenagers to listen.
              Underpaid employees landing raises they have been asking for unsuccessfully for two years. People in long
              recurring fights with partners and family members finally ending those fights in a single conversation.
              Readers facing custody mediation, contractor disputes, narcissistic bosses, and estranged family members.
            </p>
            <p>
              All of them getting outcomes they wanted, while <strong>never sounding &ldquo;salesy,&rdquo; never
              deploying a single memorized script, and never having anyone catch them &ldquo;running a technique&rdquo;</strong>{' '}on the other side of the table.
            </p>
            <p>And best of all, <HL>without reading another single persuasion book ever again.</HL></p>
          </div>
        </div>
      </section>

      {/* ═════════ 6. TESTIMONIALS ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-center mb-12">
          Just Like These Operators Who Downloaded The Book A Few Months Ago…
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Testimonial
            name="Marcus T."
            result="$42K Salary Increase"
            quote="Negotiated a $42,000 raise without my manager realizing the negotiation had even started. She walked out of the meeting thinking it was her idea."
            hidden="Every visible negotiation tactic damages the relationship. Even when it works. Shadow tactics do not."
          />
          <Testimonial
            name="Elena R."
            result="Reconciled with estranged father"
            quote="I had not spoken to my father in seven years. Used the opening tactic from Chapter 3 at my cousin's wedding. We have been talking weekly since."
            hidden="I had rehearsed every apology and reconciliation line. All of them fired his detector. What actually worked was a Cold Open about something unrelated."
          />
          <Testimonial
            name="Daniel K."
            result="Ended a 2-year recurring fight"
            quote="Finally ended a recurring fight with my wife that had been dragging on for two years. One 12-minute conversation, using tactics from Chapter 10."
            hidden="Couples therapy taught us frameworks. The book taught me what NOT to say. Removing those phrases ended the fight permanently."
          />
        </div>
      </section>

      {/* ═════════ 7. WE DON'T FOCUS ON ═════════ */}
      <section className="px-6 py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-10 text-center">
            This Is Something <span className="text-[#D4A017]">Completely Different</span>, Because…
          </h2>
          <ul className="space-y-4 text-lg md:text-xl">
            {[
              'memorizing techniques',
              'anchoring numbers',
              'mirroring body language',
              'building "rapport" through fake small talk',
              'closing scripts, pitches, or "frame control"',
            ].map((t) => (
              <li key={t} className="flex items-center gap-4">
                <span className="text-[#D4A017] font-mono text-xl">[ × ]</span>
                <span>We don&apos;t focus on <strong className="text-[#D4A017]">{t}</strong></span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-lg md:text-xl text-center leading-relaxed">
            In fact, <HL>we rarely (if ever) use anything that another person could possibly recognize as a &ldquo;technique.&rdquo;</HL>
          </p>
          <p className="mt-6 text-base md:text-lg text-center text-[#F4ECD8]/80 leading-relaxed">
            Instead, we deploy the 47 tactics most influence books never mention. They are too subtle to write a chapter
            about. Too quiet to film for YouTube. Too counterintuitive for the gurus selling you &ldquo;high-status frame
            control&rdquo; courses to even understand.
          </p>
        </div>
      </section>

      {/* ═════════ 8. CIRCLE OF DOOM ═════════ */}
      <section className="px-6 py-16 md:py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// THE OLD WAY //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            The <span className="text-[#8B0000]">Circle of Doom</span>
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A] mt-4 max-w-2xl mx-auto">
            If you&apos;ve ever tried to &ldquo;be more persuasive,&rdquo; you&apos;ve been here:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Read another persuasion book (Cialdini, Voss, Greene, Carnegie…)',
            'Highlight the techniques you want to start using',
            'Try to remember them in actual conversations',
            'Awkwardly deploy "anchoring" or "labeling emotions" mid-conversation',
            'Watch the other person\'s face change as they sense you\'re running a play',
            'Lose the conversation as their guard goes up and trust drops',
            'Decide you\'re "just bad at this" and buy another book',
            'Start over',
          ].map((step, i) => (
            <div key={i} className="bg-white border-2 border-[#8B0000]/40 p-4 md:p-5 flex gap-4 items-start">
              <span className="font-mono text-2xl font-black text-[#8B0000] leading-none shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm md:text-base text-[#1A1A1A] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-2xl mx-auto bg-[#8B0000]/10 border-2 border-[#8B0000]/40 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-[#8B0000] mx-auto mb-3" />
          <p className="text-base md:text-lg text-[#1A1A1A]">
            The Circle of Doom not only sucked. It kept me stuck for <HL>3 years</HL>, forcing me to underearn, lose
            arguments I was right about, and watch less-talented people get promoted ahead of me.
          </p>
        </div>
      </section>

      {/* ═════════ 9. PERSUASION DETECTOR ═════════ */}
      <DocDivider text="// THE MECHANISM //" />

      <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
          The <span className="text-[#D4A017]">Persuasion Detector</span>{' '}Is The Most Underrated Concept In The Entire Field Of Influence. And It&apos;s The Reason Every Other Book Has Been Failing You.
        </h2>
        <p className="text-base md:text-lg text-center text-[#3B2E1A] mb-10">Just think about it:</p>

        <div className="space-y-4 max-w-3xl mx-auto">
          {[
            'Have you ever watched a salesperson try to "anchor" you with a high price? And immediately thought "they\'re trying to anchor me right now"?',
            'Have you ever had someone "mirror" your body language a little too obviously? And it instantly creeped you out?',
            'Have you ever been in a negotiation where the other person used Chris Voss\'s "labeling" technique on you? And you literally thought "this guy read Never Split The Difference last weekend"?',
            'Have you ever had a partner try to validate your feelings using an obvious therapy script? And it made the fight worse?',
            'Have you ever had someone open with a Carnegie-style "remember their name and use it three times" move? And you instantly knew you were being worked?',
          ].map((q, i) => (
            <div key={i} className="flex gap-4 items-start bg-white border border-[#5C3A1E]/30 p-4 md:p-5">
              <span className="text-2xl">🤔</span>
              <p className="text-base md:text-lg text-[#1A1A1A] leading-relaxed">{q}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-black text-[#F4ECD8] p-8 md:p-10 border-4 border-[#D4A017]">
          <p className="text-2xl md:text-3xl font-black uppercase tracking-wider text-[#D4A017] mb-4">
            That&apos;s the persuasion detector.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-4">
            Every human brain has one. It evolved over hundreds of thousands of years to spot{' '}
            <strong>influence attempts</strong>. In a tribal environment, being persuaded by the wrong person was a
            survival risk, so the brain learned to resist first and evaluate later.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-4">
            When the detector fires, three things happen instantly. <HL>Trust drops.</HL>{' '}The listener becomes{' '}
            <HL>resistant.</HL>{' '}They start <HL>mentally pushing back</HL>{' '}on whatever you say next, even things they would
            have agreed with five minutes earlier.
          </p>
          <p className="text-lg md:text-xl font-bold text-[#D4A017]">
            The entire &ldquo;visible persuasion&rdquo; industry is built on tactics that fire the detector.
          </p>
          <p className="text-base md:text-lg mt-4">
            That&apos;s why nothing in those books works. That&apos;s why the people who beat you in conversations
            aren&apos;t using techniques you can name.
          </p>
        </div>
      </section>

      {/* ═════════ 10. MID PAGE CTA ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-center mb-8">
          Ready To Stop Losing Conversations You Should Be Winning?
        </h2>
        <OrderBox />
      </section>

      {/* ═════════ 11. THE 4-PART SYSTEM (BIG) ═════════ */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// THE SYSTEM //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Here&apos;s The Exact <span className="text-[#D4A017]">4-Part System</span>{' '}Revealed In The Book
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A] mt-4 max-w-2xl mx-auto">
            For winning almost any high-stakes conversation without the other person ever knowing you tried.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              n: '01',
              title: 'Disable The Detector',
              body: 'The first 30 seconds determine whether they treat your words as collaborative or as sales. Ten tactics for getting the detector quiet before you say anything that matters.',
            },
            {
              n: '02',
              title: 'Plant The Conclusion',
              body: 'Structure the conversation so they arrive at your desired outcome on their own. People defend conclusions they reached themselves. Fourteen tactics for the middle of any high-stakes conversation.',
            },
            {
              n: '03',
              title: 'Shift The Frame',
              body: 'Sometimes you cannot win the conversation being had. You have to quietly change what it\'s about. Twelve tactics for reframing the entire discussion without the other person noticing it happened.',
            },
            {
              n: '04',
              title: 'Lock In Without Closing',
              body: 'Exit in a way that prevents reversal without using any of the obvious "closing" moves. Eleven tactics for the last thirty seconds of any important exchange.',
            },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_0_#D4A017] flex flex-col"
            >
              <span className="font-mono text-6xl md:text-7xl font-black text-[#D4A017] leading-none mb-4">
                {s.n}
              </span>
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">
                {s.title}
              </h3>
              <p className="text-base text-[#3B2E1A] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ 12. STAKE MY REPUTATION ═════════ */}
      <section className="px-6 py-16 md:py-20 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-[#D4A017] mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
            I&apos;ll Stake My Entire Reputation On This One Promise
          </h2>
          <p className="text-xl md:text-2xl text-[#D4A017] font-bold leading-relaxed mb-8">
            You can win virtually any high-stakes conversation without the other person ever realizing you tried to.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-4">
            Set your calendar right now. Set it to <HL>30 days from today.</HL>
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85">
            Because if you implement the tactics in this book, that&apos;s when you&apos;ll start noticing your first
            real wins. Agreements that used to take days, conversations you would have lost, raises you wouldn&apos;t
            have asked for, fights that would have dragged on for weeks now ending in 12 minutes.
          </p>
        </div>
      </section>

      {/* ═════════ 13. THE 25 BULLETS — "WHAT YOU'LL DISCOVER" ═════════ */}
      <DocDivider text="// FIELD MANUAL CONTENTS //" />

      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Here&apos;s What Else You&apos;ll Discover Inside <em>Shadow Persuasion</em>
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A] mt-4">
            47 tactics. 4 Parts. No filler.
          </p>
        </div>

        <div className="bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.10)]">
          {[
            'How To Disable Anyone\'s Persuasion Detector In The First 30 Seconds Of A Conversation (so they treat everything you say next as collaborative, not sales)',
            'The Counterintuitive "Cold Open" That Gets You An Audience With Anyone, Including People Who Normally Screen You Out',
            'Why "Building Rapport" Is The Most Damaging Thing You Can Do In The First Five Minutes (and the invisible alternative that builds real trust)',
            'The Exact Opening That Disarms A Hostile Boss, Client, Partner, Or Family Member Before They Can Attack',
            'How Trying To Sound Confident Quietly Destroys Your Credibility (and the "low-status opening" elite negotiators use instead)',
            'The Step-By-Step Path To Make Anyone Reach YOUR Conclusion On Their Own (so they defend it later as if it were their idea)',
            'The "Strategic Pause" That Makes A Contractor Drop A $13,500 Overcharge To $2,500 In 11 Seconds Of Silence',
            'How To Use Someone\'s Own Words Against Their Resistance Without Them Ever Noticing',
            'The Counterintuitive Way To Handle Manipulators Without Confrontation (so they back off without ever realizing you saw what they were doing)',
            'How To End A Two-Year Recurring Fight In One 12-Minute Conversation (tested on spouses, parents, adult siblings, and ex-partners)',
            'Why "Mirroring" Backfires On Anyone Smarter Than A Toddler (and the subtle alternative that works on everyone)',
            'The Single Word That Makes People Believe You Are "On Their Side" Without You Having To Actually Agree With Anything',
            'How To Spot When Someone Is Running A Visible Tactic On You (and the elegant counter that makes them feel exposed without you having to say a word)',
            'Why Deploying Cialdini\'s Principles Now Marks You As An Amateur (and the modern versions sophisticated listeners still fall for)',
            'The Quietest Way To Take Control Of A Meeting Without Speaking First Or Loudest',
            'How To Make A "Yes" Stick: The Post-Agreement Pattern That Prevents The Other Person From Changing Their Mind 24 Hours Later',
            'The "Reverse Qualifier" That Makes Prospects, Dates, And Bosses Chase You Instead Of The Reverse',
            'How To Win A Price Negotiation Without Naming The First Number',
            'The "Timeline Compression" Move That Ends A Three-Week Stalemate In A Single Email',
            'How To Get An Apology From Someone Who Will Never Admit They Were Wrong',
            'The One-Line Email Move That Cuts Post-Deal Reversal Rates From 31% Down To 4%',
            'The "Volcano" Technique: How To Let A Manipulator\'s Primary Tactic Stop Working Against You Without Any Confrontation',
            'The Last-Word Exit: How To End Every Important Conversation In A Position Of Strength Without Sounding Aggressive',
            'The Hidden Cost Move That Collapses Someone\'s Bad Decision Before You Ever Have To Argue Against It',
            'The 7-Minute Daily Practice That Makes All 47 Tactics Second Nature Within 30 Days',
          ].map((text, i) => (
            <DiscoveryBullet key={i}>
              {text}
            </DiscoveryBullet>
          ))}
        </div>

        <p className="text-center mt-8 text-base md:text-lg text-[#1A1A1A]">
          We&apos;ll also show you how to <HL>walk into any room with people you&apos;ve never met and become the most quietly influential person in it within 20 minutes.</HL>
        </p>
      </section>

      {/* ═════════ 14. BONUSES ═════════ */}
      <section className="px-6 py-16 md:py-24 bg-[#EBE0C7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// FREE BONUSES //</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              Plus You&apos;re Also Getting <span className="text-[#D4A017]">4 Free Bonuses</span>{' '}Worth $218
            </h2>
            <p className="text-base md:text-lg text-[#3B2E1A] mt-4">
              All included free with your $7 download. No upsells. No catch.
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <BonusCard
              num="1"
              title="The Manipulation Tactics Decoder"
              description="50 common manipulation tactics across five categories (emotional, language, social, informational, and power plays) with the exact red flag for each one and the counter-move that shuts it down. Laid out so you can screenshot any page to your phone and pull it up mid-conversation."
              value="$47"
              icon={Eye}
            />
            <BonusCard
              num="2"
              title="The Power Dynamics Cheatsheet"
              description="The one-page reference you pull up on your phone before any high-stakes conversation. Five chronological sections: Before You Walk In, First 30 Seconds, During, If You're Losing Ground, and How To End. Plain English, no jargon."
              value="$27"
              icon={Zap}
            />
            <BonusCard
              num="3"
              title="48 Salary Negotiation Scripts"
              description="Word-for-word scripts for every phase of a compensation conversation. Every objection (all fifteen of them), every counter, every framing. Opening moves. Stating your number. Negotiating the offer. Follow-up emails. Special situations like counter-offers and 'what would make you stay?' Six parts, forty-eight scripts."
              value="$97"
              icon={Briefcase}
            />
            <BonusCard
              num="4"
              title="The Reactance Detector Cheatsheet"
              description="24 phrase swaps across four categories. The exact phrases that fire the listener's Persuasion Detector, and the quiet version of each one that does the same work invisibly. Plus ten signals that someone is running a tactic on YOU right now, and what to do about it."
              value="$47"
              icon={Shield}
            />
          </div>
        </div>
      </section>

      {/* ═════════ 15. NO CATCH PRICING NARRATIVE ═════════ */}
      <section className="px-6 py-16 md:py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
          And Before You Download… I Want You To Know That <HL>There&apos;s No Catch</HL>
        </h2>
        <div className="space-y-5 text-base md:text-lg leading-[1.85] text-[#1A1A1A]">
          <p>
            I realize this is very inexpensive and that I&apos;m practically giving it away…
          </p>
          <p>
            And you&apos;re probably wondering: <em>&ldquo;If you&apos;re doing so well with this, why would you give it
            away for next to nothing?&rdquo;</em>
          </p>
          <p>
            So there has to be a &ldquo;catch&rdquo;…
          </p>
          <p>
            And I know there are some websites out there that offer you a great deal on something but then they stick
            you in some program that charges your card every month.
          </p>
          <p>
            <strong>This isn&apos;t one of them.</strong>
          </p>
          <p>
            There&apos;s NO hidden &ldquo;continuity program&rdquo; you have to try or anything even remotely like that.
          </p>
          <p>
            I&apos;m literally giving you this entire book, for <strong>$7</strong>, as a means of &ldquo;putting my best
            foot forward&rdquo; and demonstrating real value. My hope is that you&apos;ll love it, and this will be the
            start of a good business relationship for years to come.
          </p>
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide pt-4 text-center text-[#8B0000]">
            But With All That Said: This Won&apos;t Last Long
          </h3>
          <p>
            I was planning on selling this book for <strong>$47</strong>… then I lowered it to <strong>$27</strong>…
            and now to <strong>$7</strong>{' '}because at this price I can reach more people who actually need it.
          </p>
          <p>
            <strong>It actually costs me around $22 in advertising to sell one copy.</strong>{' '}Meaning at $7 I take a small
            loss on every book. I&apos;m doing it because I&apos;m betting you&apos;ll love it enough to want more from
            me later. That&apos;s the entire deal. No tricks.
          </p>
        </div>
      </section>

      {/* ═════════ 16. MONEY BACK GUARANTEE ═════════ */}
      <section className="px-6 py-16 md:py-20 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-[#D4A017] mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              The <span className="text-[#D4A017]">Best Money-Back Guarantee</span>{' '}In The World
            </h2>
          </div>

          <div className="border-4 border-[#D4A017] bg-black p-6 md:p-10 space-y-5 text-base md:text-lg leading-relaxed">
            <p>
              Download the eBook. Read it. More importantly, apply what you learn.
            </p>
            <p>
              And if you&apos;re not blown away by what you learn, just shoot me an email and request a refund within{' '}
              <HL>30 days.</HL>
            </p>
            <p className="text-xl md:text-2xl font-bold text-[#D4A017]">
              We&apos;ll refund your $7 and let you keep the Shadow Persuasion book free of charge. Along with all
              the bonuses.
            </p>
            <p>How&apos;s that for the world&apos;s best money-back guarantee? I&apos;d say pretty good.</p>
            <p className="text-sm text-[#F4ECD8]/70 italic">
              The only thing that costs you to try this is an afternoon of reading and thirty minutes of your time.
              What you stand to gain is the ability to walk into every important conversation in your life knowing
              you&apos;ll come out the other side with what you came for.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 17. ORDER BOX ═════════ */}
      <section id="order" className="px-6 py-16 md:py-24 bg-[#F4ECD8]">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// CLAIM YOUR COPY //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight max-w-3xl mx-auto">
            Get The Field Manual + 4 Bonuses For <span className="text-[#D4A017]">Just $7</span>
          </h2>
        </div>

        <OrderBox bgVariant="dark" />

        <div className="max-w-2xl mx-auto mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Instant Access', body: 'Full PDF + all 4 bonuses delivered to your inbox in 60 seconds' },
            { title: '30-Day Guarantee', body: 'Refund + keep the book if you\'re not blown away' },
            { title: 'No Subscription', body: 'One-time $7. No hidden continuity. No surprise charges.' },
          ].map((b) => (
            <div key={b.title} className="text-center p-4 border border-[#5C3A1E]/30 bg-white">
              <p className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold mb-1">
                ✓ {b.title}
              </p>
              <p className="text-xs text-[#3B2E1A]">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ 18. FAQ ═════════ */}
      <DocDivider text="// QUESTIONS //" />

      <section className="px-6 py-12 md:py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div>
          <FAQItem
            q="Who is this book for?"
            a={
              <p>
                Anyone who finds themselves losing important conversations they should be winning. Sales professionals.
                Founders raising rounds. People overdue for a raise. Parents whose teenagers have stopped listening.
                Partners stuck in a fight that keeps happening. Anyone navigating a difficult family member, a manipulative
                coworker, a custody mediation, a contractor dispute, or a reconnection with someone they haven&apos;t
                spoken to in years. If you&apos;ve read Cialdini, Voss, or Greene and still feel like you&apos;re losing
                the rooms that matter, this book is for you.
              </p>
            }
          />
          <FAQItem
            q="How is this different from other persuasion books?"
            a={
              <p>
                Every other book teaches you <strong>visible</strong>{' '}techniques. Anchoring. Mirroring. Frame control.
                The other person sees you running them and trust drops. This book teaches the 47 tactics that operate{' '}
                <em>below</em>{' '}the threshold where the other person can detect them. That&apos;s why they actually work
                in real conversations with sophisticated people, and why the techniques you learned from other books
                quietly stop working the moment your listener is paying attention.
              </p>
            }
          />
          <FAQItem
            q="Is there a hidden subscription?"
            a={
              <p>
                No. $7 one-time. No continuity. No auto-bill. No surprise charges. We do offer additional products on the
                next page after checkout, but every one of them is optional and you can skip them with one click.
              </p>
            }
          />
          <FAQItem
            q="What format is the book in?"
            a={
              <p>
                Digital PDF. You can read it on your phone, laptop, or print it. The four bonuses come as separate PDFs
                so you can keep the cheatsheets on your phone for reference. Instant download access the moment you order.
              </p>
            }
          />
          <FAQItem
            q="What if it doesn't work for me?"
            a={
              <p>
                Email us within 30 days and we&apos;ll refund your $7. You keep the book and all the bonuses. The only
                thing you risk is 30 minutes of your time.
              </p>
            }
          />
          <FAQItem
            q="Why is it so cheap?"
            a={
              <p>
                Because at $7 I can reach 10× more people than at $47. I&apos;d rather get the book into the hands of
                10,000 people who&apos;ll love it (and tell their friends) than 1,000 who paid full price. I lose money
                on each individual sale and make it back over time as a small percentage of readers want to go deeper.
              </p>
            }
          />
        </div>
      </section>

      {/* ═════════ 19. FINAL CTA ═════════ */}
      <section className="px-6 py-16 md:py-20 bg-black text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
            Stop Losing The Conversations <span className="text-[#D4A017]">That Actually Matter</span>
          </h2>
          <p className="text-base md:text-lg text-[#F4ECD8]/80 mb-10">
            47 tactics. 4 Parts. 4 free bonuses. $7. 30-day money-back guarantee. What are you waiting for?
          </p>

          <div className="mb-10">
            <OrderBox bgVariant="dark" />
          </div>
        </div>
      </section>

      {/* ═════════ 20. SIGNATURE + PS ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-3xl mx-auto text-base md:text-lg leading-[1.85] text-[#1A1A1A] space-y-5">
        <p>I&apos;ll talk to you in our private community as soon as you download.</p>
        <p>Until then, to your success,</p>
        <p className="text-3xl md:text-4xl italic text-[#1A1A1A]" style={{ fontFamily: 'Brush Script MT, cursive' }}>
          Nate Harlan
        </p>

        <hr className="border-[#5C3A1E]/30 my-8" />

        <div className="bg-[#EBE0C7] border-l-4 border-[#D4A017] p-6">
          <p className="font-bold text-[#1A1A1A] mb-3">
            <strong>P.S.</strong>{' '}Remember, the <em>Shadow Persuasion</em>{' '}book comes with the BEST money-back
            guarantee in the world.
          </p>
          <p>
            Download it. Read it. Implement it. Win the conversations you used to lose. And if you&apos;re not happy for
            any reason (and I mean ANY reason), just let me know and we&apos;ll refund your $7 and let you keep the
            book and all bonuses.
          </p>
          <p className="mt-4">
            <a href="/checkout/book" className="font-bold uppercase tracking-wider text-[#D4A017] hover:underline">
              [ Download eBook Now → ]
            </a>
          </p>
        </div>
      </section>

      {/* ═════════ FOOTER ═════════ */}
      <footer className="px-6 py-10 bg-[#1A1A1A] text-[#F4ECD8]/60 text-center text-sm">
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="font-mono uppercase tracking-wider text-xs">
            CLASSIFICATION: PUBLIC ACCESS · END OF DOCUMENT
          </p>
          <p>
            © {new Date().getFullYear()} Shadow Persuasion. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <Link href="/terms" className="hover:text-[#D4A017]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#D4A017]">Privacy</Link>
            <a href="mailto:support@shadowpersuasion.com" className="hover:text-[#D4A017]">Support</a>
          </div>
          <p className="text-xs italic max-w-2xl mx-auto pt-4">
            Disclaimer: Results vary based on background, experience, and effort. Testimonials are from real users but
            not typical. Nothing on this page is a guarantee of any specific outcome. This book is for educational
            purposes only.
          </p>
        </div>
      </footer>
    </main>
  );
}
