'use client';

/* ════════════════════════════════════════════════════════════
   /admin/book-mockup — 3D book/pamphlet renderer for landing
   page mockups.

   Admin uploads a cover image, adjusts rotation + thickness +
   shadow + background, and exports a PNG. Built with CSS 3D
   transforms so the preview updates in real time; html-to-image
   snapshots the DOM node to a high-res PNG.

   Why CSS 3D instead of Three.js: ~90% of the visual quality
   at ~1% of the dependency weight, and the preset poses below
   cover most landing-page needs (front-angled, spine-visible,
   hero flat). For an actual 3D render with orbit controls we'd
   swap the book component for a <Canvas> later.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  Upload,
  Download,
  RotateCcw,
  ImageIcon,
  Camera,
} from 'lucide-react';

type Preset = 'pamphlet' | 'book' | 'hardcover';

type Settings = {
  cover: string | null;      // data URL of the uploaded image
  preset: Preset;
  rotateY: number;           // -45 to 45 — turn the book
  rotateX: number;           // -30 to 30 — tilt up/down
  thickness: number;         // book depth in px (controls how thick the spine looks)
  shadow: number;            // 0-100
  bg: 'transparent' | 'white' | 'custom';
  bgCustom: string;          // hex when bg = custom
  scale: 1 | 2 | 3;          // export multiplier
};

const PRESETS: Record<Preset, Partial<Settings>> = {
  pamphlet:  { thickness: 8,  rotateY: -22, rotateX: 8,  shadow: 30 },
  book:      { thickness: 24, rotateY: -22, rotateX: 8,  shadow: 40 },
  hardcover: { thickness: 48, rotateY: -22, rotateX: 8,  shadow: 55 },
};

const DEFAULT_SETTINGS: Settings = {
  cover: null,
  preset: 'book',
  rotateY: -22,
  rotateX: 8,
  thickness: 24,
  shadow: 40,
  bg: 'transparent',
  bgCustom: '#F4ECD8',
  scale: 2,
};

export default function BookMockupPage() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyPreset(preset: Preset) {
    setS((prev) => ({
      ...prev,
      preset,
      ...PRESETS[preset],
    }));
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Pick an image file (PNG or JPG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setS((prev) => ({ ...prev, cover: dataUrl }));
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleExport() {
    if (!stageRef.current) return;
    setExporting(true);
    setError(null);
    try {
      const bg =
        s.bg === 'transparent' ? undefined
        : s.bg === 'white' ? '#ffffff'
        : s.bgCustom;

      const dataUrl = await toPng(stageRef.current, {
        pixelRatio: s.scale,
        backgroundColor: bg,
        // Skip fonts we don't need to inline (speeds up the snapshot)
        skipFonts: true,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `book-mockup-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  }

  // When the preset changes, snap thickness/shadow to its defaults
  // (the user can still fine-tune afterwards).
  useEffect(() => {
    // no-op — applyPreset already writes the preset values into state
  }, [s.preset]);

  const bgStyle: React.CSSProperties =
    s.bg === 'transparent'
      ? {
          // Show a checkerboard so the admin knows it's transparent
          backgroundImage:
            'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, 10px 0px',
          backgroundColor: '#fff',
        }
      : s.bg === 'white'
      ? { backgroundColor: '#ffffff' }
      : { backgroundColor: s.bgCustom };

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <Link
        href="/app/admin"
        className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono"
      >
        <ArrowLeft className="h-4 w-4" /> Back to admin
      </Link>

      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
          // BOOK MOCKUP //
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
          3D Book Mockup
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
          Upload a cover, adjust the pose, export a PNG for landing pages.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-3 mb-5 font-mono text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* LEFT — controls */}
        <div className="space-y-5">
          {/* Upload */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
              Cover image
            </p>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-[#D4A017]/30 p-4 text-center cursor-pointer hover:border-[#D4A017] transition-colors"
            >
              {s.cover ? (
                <>
                  <img
                    src={s.cover}
                    alt="Cover preview"
                    className="max-h-32 mx-auto mb-2"
                  />
                  <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50 uppercase tracking-wider">
                    Click or drop to replace
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 dark:text-[#F4ECD8]/40 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 mb-1">
                    Drop cover image here
                  </p>
                  <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50 uppercase tracking-wider">
                    or click to pick a file
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>

          {/* Preset */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
              Style preset
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['pamphlet', 'book', 'hardcover'] as Preset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`px-2 py-2 text-[10px] font-mono uppercase tracking-wider border ${
                    s.preset === p
                      ? 'bg-[#D4A017] text-[#0A0A0A] border-[#D4A017] font-bold'
                      : 'bg-white dark:bg-[#111] border-gray-300 dark:border-[#D4A017]/40 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50 mt-2">
              Snaps thickness + shadow to sensible defaults. Fine-tune below.
            </p>
          </div>

          {/* Sliders */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 space-y-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
              Pose & depth
            </p>
            <Slider
              label="Rotate Y (turn)"
              value={s.rotateY}
              min={-45}
              max={45}
              suffix="°"
              onChange={(v) => setS({ ...s, rotateY: v })}
            />
            <Slider
              label="Rotate X (tilt)"
              value={s.rotateX}
              min={-30}
              max={30}
              suffix="°"
              onChange={(v) => setS({ ...s, rotateX: v })}
            />
            <Slider
              label="Thickness"
              value={s.thickness}
              min={2}
              max={80}
              suffix="px"
              onChange={(v) => setS({ ...s, thickness: v })}
            />
            <Slider
              label="Shadow"
              value={s.shadow}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) => setS({ ...s, shadow: v })}
            />
            <button
              onClick={() => setS({ ...DEFAULT_SETTINGS, cover: s.cover })}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] font-mono text-[10px] uppercase tracking-wider"
            >
              <RotateCcw className="h-3 w-3" />
              Reset pose
            </button>
          </div>

          {/* Background */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
              Background
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['transparent', 'white', 'custom'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setS({ ...s, bg: b })}
                  className={`px-2 py-2 text-[10px] font-mono uppercase tracking-wider border ${
                    s.bg === b
                      ? 'bg-[#D4A017] text-[#0A0A0A] border-[#D4A017] font-bold'
                      : 'bg-white dark:bg-[#111] border-gray-300 dark:border-[#D4A017]/40 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {s.bg === 'custom' && (
              <input
                type="color"
                value={s.bgCustom}
                onChange={(e) => setS({ ...s, bgCustom: e.target.value })}
                className="w-full h-10 cursor-pointer"
              />
            )}
          </div>

          {/* Export */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
              Export
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setS({ ...s, scale: r })}
                  className={`px-2 py-2 text-[10px] font-mono uppercase tracking-wider border ${
                    s.scale === r
                      ? 'bg-[#D4A017] text-[#0A0A0A] border-[#D4A017] font-bold'
                      : 'bg-white dark:bg-[#111] border-gray-300 dark:border-[#D4A017]/40 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017]'
                  }`}
                >
                  {r}× res
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={!s.cover || exporting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] font-mono text-xs uppercase tracking-wider font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Camera className="h-3 w-3 animate-pulse" />
                  Rendering…
                </>
              ) : (
                <>
                  <Download className="h-3 w-3" />
                  Download PNG
                </>
              )}
            </button>
            <p className="text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/50">
              Higher resolutions export slower but look sharper on Retina landing pages. 2× is usually
              enough.
            </p>
          </div>
        </div>

        {/* RIGHT — 3D stage */}
        <div
          ref={stageRef}
          style={{
            ...bgStyle,
            minHeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 64,
          }}
        >
          {s.cover ? (
            <Book settings={s} />
          ) : (
            <div className="text-center text-gray-500 dark:text-[#F4ECD8]/50">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-mono uppercase tracking-wider">
                Upload a cover image to start
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   The book itself.

   CSS 3D setup: the parent div is `transform-style: preserve-3d`
   and holds 6 faces of the book (front cover, back, spine, right
   page edge, top page edge, bottom page edge) plus a floor shadow.
   Each face is a div positioned on one edge of the cover and
   rotated so it extends BACKWARD (into -Z) to form the book's
   volume. The +Z direction is toward the viewer, so every side
   face folds into -Z.

   Geometry recipe (each side face hinges on its FRONT edge and
   rotates backward by 90°):
     SPINE:  at left:0,  hinge=left center,   rotateY( 90deg)
     RIGHT:  at right:0, hinge=right center,  rotateY(-90deg)
     TOP:    at top:0,   hinge=top center,    rotateX(-90deg)
     BOTTOM: at bottom:0, hinge=bottom center, rotateX( 90deg)

   If any of those signs flip, the face tips FORWARD instead and
   you get a detached-sliver look at the top/bottom of the book.
   ────────────────────────────────────────────────────────── */

function Book({ settings }: { settings: Settings }) {
  const {
    cover,
    rotateY,
    rotateX,
    thickness,
    shadow,
  } = settings;

  // Book dimensions — maintain rough 2:3 aspect ratio, ~300px wide
  const width = 300;
  const height = 450;

  const shadowOpacity = shadow / 100;

  // Page texture recipe — the old one had too much contrast between
  // the two cream bands, so the edge read as corrugated cardboard
  // instead of stacked paper. Two fixes layered here:
  //   (a) much lower contrast between bands (~4 RGB units instead
  //       of ~16) so individual lines don't pop
  //   (b) a soft top/bottom shadow overlay suggesting paper
  //       compressing into the cover at the spine/binding, which is
  //       what gives a real book edge its sense of depth
  const PAPER_LIGHT = '#F4ECD8';
  const PAPER_DARK = '#EFE5CB';
  const pageDepthShadow = `linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.22) 0%,
    rgba(0, 0, 0, 0) 8%,
    rgba(0, 0, 0, 0) 92%,
    rgba(0, 0, 0, 0.22) 100%
  )`;
  // Stripes direction depends on how the face will look after its
  // 90° fold. Side faces (spine + right edge) show pages stacked
  // vertically, so the stripes run horizontally (to bottom). The
  // top and bottom faces show pages running across the book's
  // width, so their stripes also repeat along the element's height
  // — which after rotation aligns with the book's depth.
  const stripePattern = `repeating-linear-gradient(
    to bottom,
    ${PAPER_LIGHT} 0px,
    ${PAPER_LIGHT} 1px,
    ${PAPER_DARK} 1px,
    ${PAPER_DARK} 2px
  )`;
  // Vertical side faces (spine + right edge) layer the depth shadow
  // on top of the stripes.
  const sidePageEdgeBg = `${pageDepthShadow}, ${stripePattern}`;
  // Horizontal top/bottom faces just use the stripes — depth shadow
  // there doesn't track reality (those faces sit flush with the
  // cover, no binding compression).
  const topBottomPageEdgeBg = stripePattern;

  return (
    <div
      style={{
        perspective: 1600,
        perspectiveOrigin: 'center',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          position: 'relative',
          width,
          height,
        }}
      >
        {/* Shadow (sits "on the floor" behind the book) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -thickness * 0.5 - 20,
            width: width * 0.9,
            height: 40,
            transform: 'translateX(-50%) translateZ(-1px) rotateX(90deg)',
            background: `radial-gradient(ellipse at center, rgba(0,0,0,${shadowOpacity}) 0%, rgba(0,0,0,0) 70%)`,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />

        {/* BACK cover — dark slab at the back plane of the book */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateZ(${-thickness}px)`,
            background: 'linear-gradient(135deg, #3B2E1A 0%, #1A1A1A 100%)',
            borderRadius: 2,
          }}
        />

        {/* SPINE — hinges on the FRONT-LEFT edge, folds backward.
            Gets a left/right shading gradient on top of the page
            stripes to fake the spine's curvature toward the binding. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: thickness,
            height,
            transformOrigin: 'left center',
            transform: 'rotateY(90deg)',
            background: `
              linear-gradient(
                to right,
                rgba(0,0,0,0.4) 0%,
                rgba(0,0,0,0) 20%,
                rgba(255,255,255,0.05) 50%,
                rgba(0,0,0,0) 80%,
                rgba(0,0,0,0.3) 100%
              ),
              ${sidePageEdgeBg}
            `,
            borderTop: '1px solid #8B7355',
            borderBottom: '1px solid #8B7355',
          }}
        />

        {/* TOP page edge — hinges on the FRONT-TOP edge, folds backward */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height: thickness,
            transformOrigin: 'top center',
            transform: 'rotateX(-90deg)',
            background: topBottomPageEdgeBg,
          }}
        />

        {/* BOTTOM page edge — hinges on the FRONT-BOTTOM edge, folds backward */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width,
            height: thickness,
            transformOrigin: 'bottom center',
            transform: 'rotateX(90deg)',
            background: topBottomPageEdgeBg,
          }}
        />

        {/* RIGHT page edge — hinges on the FRONT-RIGHT edge, folds backward */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: thickness,
            height,
            transformOrigin: 'right center',
            transform: 'rotateY(-90deg)',
            background: sidePageEdgeBg,
          }}
        />

        {/* FRONT cover — the uploaded image */}
        {cover && (
          <img
            src={cover}
            alt="Cover"
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'translateZ(0px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25), inset 0 0 30px rgba(0,0,0,0.08)',
              borderRadius: 2,
              // A subtle gloss/lighting gradient on top of the cover
              // to sell the 3D effect under the tilt.
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%)',
            }}
          />
        )}

        {/* Gloss overlay on the cover (sits on top, pointer-events off) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translateZ(1px)',
            background:
              'linear-gradient(105deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.12) 100%)',
            pointerEvents: 'none',
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────── Helpers ─────────── */

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-700 dark:text-[#F4ECD8]/80">
          {label}
        </label>
        <span className="text-[10px] font-mono text-[#D4A017]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-[#D4A017]"
      />
    </div>
  );
}
