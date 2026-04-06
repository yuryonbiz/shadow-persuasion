'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Brain,
  MessageSquare,
  Target,
  Plus,
  Star,
  RefreshCw,
  Loader2,
  ChevronRight,
  Trash2,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

const RELATIONSHIP_TYPES = ['Boss', 'Client', 'Partner', 'Ex', 'Friend', 'Rival', 'Family', 'Other'] as const;

const TECHNIQUE_LIBRARY = [
  'Mirroring',
  'Active Listening',
  'Reframing',
  'Strategic Silence',
  'Anchoring',
  'Reciprocity',
  'Social Proof',
  'Scarcity',
  'Authority',
  'Liking/Rapport',
  'Commitment/Consistency',
  'Emotional Labeling',
  'Pacing & Leading',
  'Door in the Face',
  'Foot in the Door',
  'Framing',
  'Storytelling',
  'Contrast Principle',
  'Future Pacing',
  'Pattern Interrupt',
];

interface Interaction {
  id: string;
  date: string;
  summary: string;
  techniques: string[];
  outcome: number;
  notes: string;
  aiAnalysis?: string;
}

interface Profile {
  id: string;
  name: string;
  relationshipType: string;
  traits: {
    communication?: {
      directness?: number;
      logicVsEmotion?: number;
      assertiveness?: number;
      openness?: number;
      summary?: string;
    };
    personality?: {
      openness?: number;
      conscientiousness?: number;
      extraversion?: number;
      agreeableness?: number;
      neuroticism?: number;
    };
    triggers?: {
      defensive?: string[];
      openUp?: string[];
    };
    motivations?: string[];
    fears?: string[];
    attachmentStyle?: {
      style?: string;
      confidence?: number;
    };
  };
  interactions: Interaction[];
  playbook?: {
    bestApproach?: string;
    timingPatterns?: string;
    effectiveTactics?: { tactic: string; description: string; effectiveness: number }[];
    leveragePoints?: string[];
    nextMove?: string;
    generatedAt?: string;
  };
  confidenceScore?: number;
  keyTraitTags?: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'shadow-profiler-data';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRelationshipColor(type: string): string {
  const colors: Record<string, string> = {
    Boss: 'bg-red-500/20 text-red-400 border-red-500/30',
    Client: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Partner: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    Ex: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Friend: 'bg-green-500/20 text-green-400 border-green-500/30',
    Rival: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Family: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return colors[type] || colors.Other;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'interactions' | 'playbook'>('profile');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const found = (data.profiles || []).find((p: Profile) => p.id === profileId);
        if (found) {
          setProfile(found);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    }
    setIsLoading(false);
  }, [profileId]);

  // Save profile changes
  const saveProfile = useCallback(
    (updated: Profile) => {
      setProfile(updated);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          data.profiles = (data.profiles || []).map((p: Profile) =>
            p.id === profileId ? updated : p
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.error('Failed to save profile:', e);
        }
      }
    },
    [profileId]
  );

  const handleDeleteProfile = () => {
    if (!confirm('Delete this profile? This cannot be undone.')) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        data.profiles = (data.profiles || []).filter((p: Profile) => p.id !== profileId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to delete profile:', e);
      }
    }
    router.push('/app/profiler');
  };

  // Log interaction + AI analysis
  const handleLogInteraction = async (interaction: Omit<Interaction, 'id' | 'aiAnalysis'>) => {
    if (!profile) return;

    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
    };

    // Save interaction immediately (without AI analysis yet)
    const updatedWithInteraction: Profile = {
      ...profile,
      interactions: [...profile.interactions, newInteraction],
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updatedWithInteraction);
    setIsLogModalOpen(false);

    // Then run AI analysis
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-interaction',
          interaction: newInteraction,
          profile: updatedWithInteraction,
        }),
      });

      if (res.ok) {
        const analysis = await res.json();
        const updatedInteraction: Interaction = {
          ...newInteraction,
          aiAnalysis: analysis.interactionAnalysis,
        };

        const fullyUpdated: Profile = {
          ...updatedWithInteraction,
          interactions: updatedWithInteraction.interactions.map((i) =>
            i.id === newInteraction.id ? updatedInteraction : i
          ),
          traits: analysis.updatedTraits || updatedWithInteraction.traits,
          confidenceScore: analysis.confidenceScore ?? updatedWithInteraction.confidenceScore,
          keyTraitTags: analysis.keyTraitTags || updatedWithInteraction.keyTraitTags,
          updatedAt: new Date().toISOString(),
        };
        saveProfile(fullyUpdated);
      }
    } catch (e) {
      console.error('AI analysis failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate playbook
  const handleGeneratePlaybook = async () => {
    if (!profile) return;
    setIsGeneratingPlaybook(true);
    try {
      const res = await fetch('/api/profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-playbook',
          profile,
        }),
      });

      if (res.ok) {
        const playbook = await res.json();
        const updated: Profile = {
          ...profile,
          playbook: {
            ...playbook,
            generatedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
        saveProfile(updated);
      }
    } catch (e) {
      console.error('Playbook generation failed:', e);
    } finally {
      setIsGeneratingPlaybook(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">Profile not found</p>
        <button
          onClick={() => router.push('/app/profiler')}
          className="mt-4 text-[#D4A017] hover:underline"
        >
          Back to profiles
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Psychological Profile', icon: Brain },
    { id: 'interactions' as const, label: 'Interaction Log', icon: MessageSquare },
    { id: 'playbook' as const, label: 'Strategy Playbook', icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <button
        onClick={() => router.push('/app/profiler')}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-mono uppercase">Back to Profiles</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#D4A017]/20 border-2 border-[#D4A017]/40 flex items-center justify-center">
            <span className="text-[#D4A017] font-bold font-mono text-xl">
              {getInitials(profile.name)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-mono border rounded ${getRelationshipColor(
                  profile.relationshipType
                )}`}
              >
                {profile.relationshipType}
              </span>
              {(profile.confidenceScore ?? 0) > 0 && (
                <span className="text-xs text-gray-500 font-mono">
                  {profile.confidenceScore}% confidence
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Log Interaction
          </button>
          <button
            onClick={handleDeleteProfile}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Delete profile"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Analyzing indicator */}
      {isAnalyzing && (
        <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-lg p-3 flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-[#D4A017] animate-spin" />
          <span className="text-sm text-[#D4A017]">AI is analyzing the interaction and updating the profile...</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#333333]">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-mono uppercase border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#D4A017] text-[#D4A017]'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <PsychologicalProfileTab profile={profile} />}
      {activeTab === 'interactions' && (
        <InteractionLogTab
          profile={profile}
          onLogInteraction={() => setIsLogModalOpen(true)}
          onDeleteInteraction={(interactionId) => {
            const updated = {
              ...profile,
              interactions: profile.interactions.filter((i) => i.id !== interactionId),
              updatedAt: new Date().toISOString(),
            };
            saveProfile(updated);
          }}
        />
      )}
      {activeTab === 'playbook' && (
        <PlaybookTab
          profile={profile}
          onGenerate={handleGeneratePlaybook}
          isGenerating={isGeneratingPlaybook}
        />
      )}

      {/* Log Interaction Modal */}
      {isLogModalOpen && (
        <LogInteractionModal
          onClose={() => setIsLogModalOpen(false)}
          onLog={handleLogInteraction}
        />
      )}
    </div>
  );
}

// ─── Tab 1: Psychological Profile ─────────────────────────────────────────────

function PsychologicalProfileTab({ profile }: { profile: Profile }) {
  const { traits } = profile;
  const hasData = traits.communication || traits.personality;

  if (!hasData) {
    return (
      <div className="text-center py-16 space-y-3">
        <Brain className="h-12 w-12 text-gray-600 mx-auto" />
        <p className="text-gray-400">No psychological data yet</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Log interactions to build a psychological profile. The AI will analyze patterns and generate
          assessments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Communication Style */}
      {traits.communication && (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-4">Communication Style</h3>
          {traits.communication.summary && (
            <p className="text-gray-300 text-sm mb-5">{traits.communication.summary}</p>
          )}
          <div className="space-y-4">
            <ScaleBar label="Indirect" labelRight="Direct" value={traits.communication.directness ?? 50} />
            <ScaleBar
              label="Emotional"
              labelRight="Logical"
              value={traits.communication.logicVsEmotion ?? 50}
            />
            <ScaleBar label="Passive" labelRight="Assertive" value={traits.communication.assertiveness ?? 50} />
            <ScaleBar label="Guarded" labelRight="Open" value={traits.communication.openness ?? 50} />
          </div>
        </div>
      )}

      {/* Big Five Personality - Radar Chart */}
      {traits.personality && (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-4">Big Five Personality Traits</h3>
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <RadarChart personality={traits.personality} />
            <div className="flex-1 space-y-3 w-full">
              <TraitBar label="Openness" value={traits.personality.openness ?? 50} color="text-blue-400" />
              <TraitBar
                label="Conscientiousness"
                value={traits.personality.conscientiousness ?? 50}
                color="text-green-400"
              />
              <TraitBar
                label="Extraversion"
                value={traits.personality.extraversion ?? 50}
                color="text-yellow-400"
              />
              <TraitBar
                label="Agreeableness"
                value={traits.personality.agreeableness ?? 50}
                color="text-pink-400"
              />
              <TraitBar
                label="Neuroticism"
                value={traits.personality.neuroticism ?? 50}
                color="text-red-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Triggers */}
      {traits.triggers && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
            <h3 className="text-sm font-mono uppercase text-red-400 mb-4">Defensive Triggers</h3>
            {(traits.triggers.defensive || []).length > 0 ? (
              <ul className="space-y-2">
                {traits.triggers.defensive!.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-400 mt-0.5">*</span>
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Not yet identified</p>
            )}
          </div>
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
            <h3 className="text-sm font-mono uppercase text-green-400 mb-4">Opens Them Up</h3>
            {(traits.triggers.openUp || []).length > 0 ? (
              <ul className="space-y-2">
                {traits.triggers.openUp!.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">*</span>
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Not yet identified</p>
            )}
          </div>
        </div>
      )}

      {/* Motivations & Fears */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(traits.motivations || []).length > 0 && (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
            <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-4">Motivations</h3>
            <ul className="space-y-2">
              {traits.motivations!.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <ChevronRight className="h-4 w-4 text-[#D4A017] mt-0.5 flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(traits.fears || []).length > 0 && (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
            <h3 className="text-sm font-mono uppercase text-orange-400 mb-4">Fears</h3>
            <ul className="space-y-2">
              {traits.fears!.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <ChevronRight className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Attachment Style */}
      {traits.attachmentStyle?.style && (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
          <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-4">Attachment Style</h3>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-white">{traits.attachmentStyle.style}</span>
            {(traits.attachmentStyle.confidence ?? 0) > 0 && (
              <span className="text-sm text-gray-500 font-mono">
                {traits.attachmentStyle.confidence}% confidence
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Interaction Log ───────────────────────────────────────────────────

function InteractionLogTab({
  profile,
  onLogInteraction,
  onDeleteInteraction,
}: {
  profile: Profile;
  onLogInteraction: () => void;
  onDeleteInteraction: (id: string) => void;
}) {
  const sorted = [...profile.interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <MessageSquare className="h-12 w-12 text-gray-600 mx-auto" />
        <p className="text-gray-400">No interactions logged yet</p>
        <button
          onClick={onLogInteraction}
          className="mt-2 bg-[#D4A017] text-[#0A0A0A] px-5 py-2 rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
        >
          Log First Interaction
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((interaction) => (
        <div
          key={interaction.id}
          className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-mono">
                {new Date(interaction.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-white mt-1">{interaction.summary}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= interaction.outcome ? 'text-[#D4A017] fill-[#D4A017]' : 'text-[#333333]'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => onDeleteInteraction(interaction.id)}
                className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                title="Delete interaction"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {interaction.techniques.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {interaction.techniques.map((t, i) => (
                <span key={i} className="text-xs bg-[#D4A017]/10 text-[#D4A017] px-2 py-0.5 rounded border border-[#D4A017]/20">
                  {t}
                </span>
              ))}
            </div>
          )}

          {interaction.notes && <p className="text-sm text-gray-400">{interaction.notes}</p>}

          {interaction.aiAnalysis && (
            <div className="bg-[#0A0A0A] p-3 rounded border-l-4 border-[#D4A017]">
              <p className="text-xs font-mono uppercase text-[#D4A017] mb-1">AI Analysis</p>
              <p className="text-sm text-gray-300">{interaction.aiAnalysis}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab 3: Strategy Playbook ─────────────────────────────────────────────────

function PlaybookTab({
  profile,
  onGenerate,
  isGenerating,
}: {
  profile: Profile;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const { playbook } = profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {playbook?.generatedAt && (
            <p className="text-xs text-gray-500 font-mono">
              Generated {new Date(playbook.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {playbook ? 'Refresh Strategy' : 'Generate Strategy'}
        </button>
      </div>

      {isGenerating && (
        <div className="text-center py-16 space-y-3">
          <Loader2 className="h-10 w-10 text-[#D4A017] animate-spin mx-auto" />
          <p className="text-gray-400">Generating personalized strategy...</p>
        </div>
      )}

      {!isGenerating && !playbook && (
        <div className="text-center py-16 space-y-3">
          <Target className="h-12 w-12 text-gray-600 mx-auto" />
          <p className="text-gray-400">No strategy generated yet</p>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Log some interactions first, then generate a personalized strategy playbook for this person.
          </p>
        </div>
      )}

      {!isGenerating && playbook && (
        <div className="space-y-6">
          {playbook.bestApproach && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
              <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-3">Best Approach</h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">{playbook.bestApproach}</p>
            </div>
          )}

          {playbook.timingPatterns && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
              <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-3">Timing Patterns</h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">{playbook.timingPatterns}</p>
            </div>
          )}

          {(playbook.effectiveTactics || []).length > 0 && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
              <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-4">Effective Tactics</h3>
              <div className="space-y-3">
                {playbook.effectiveTactics!.map((t, i) => (
                  <div key={i} className="bg-[#0A0A0A] p-4 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{t.tactic}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#333333] rounded-full h-2">
                          <div
                            className="bg-[#D4A017] h-2 rounded-full transition-all"
                            style={{ width: `${t.effectiveness}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-mono w-8">{t.effectiveness}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(playbook.leveragePoints || []).length > 0 && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6">
              <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-4">Leverage Points</h3>
              <ul className="space-y-2">
                {playbook.leveragePoints!.map((lp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <ChevronRight className="h-4 w-4 text-[#D4A017] mt-0.5 flex-shrink-0" />
                    {lp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {playbook.nextMove && (
            <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-lg p-6">
              <h3 className="text-sm font-mono uppercase text-[#D4A017] mb-3">Recommended Next Move</h3>
              <p className="text-white text-sm">{playbook.nextMove}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Log Interaction Modal ────────────────────────────────────────────────────

function LogInteractionModal({
  onClose,
  onLog,
}: {
  onClose: () => void;
  onLog: (interaction: Omit<Interaction, 'id' | 'aiAnalysis'>) => void;
}) {
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [outcome, setOutcome] = useState(3);
  const [notes, setNotes] = useState('');
  const [showTechniqueList, setShowTechniqueList] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    onLog({ date, summary: summary.trim(), techniques, outcome, notes: notes.trim() });
  };

  const toggleTechnique = (t: string) => {
    setTechniques((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#333333]">
          <h2 className="text-xl font-mono uppercase text-[#D4A017]">Log Interaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#333333] rounded transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white focus:outline-none focus:border-[#D4A017]"
            />
          </div>

          <div>
            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
              What happened? *
            </label>
            <textarea
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white resize-none focus:outline-none focus:border-[#D4A017]"
              placeholder="Describe the interaction in detail..."
            />
          </div>

          {/* Techniques Multi-Select */}
          <div>
            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
              Techniques Used
            </label>
            {techniques.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {techniques.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTechnique(t)}
                    className="text-xs bg-[#D4A017]/20 text-[#D4A017] px-2 py-1 rounded border border-[#D4A017]/30 flex items-center gap-1 hover:bg-[#D4A017]/30 transition-colors"
                  >
                    {t}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowTechniqueList(!showTechniqueList)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showTechniqueList ? 'Hide techniques' : '+ Select techniques'}
            </button>
            {showTechniqueList && (
              <div className="mt-2 grid grid-cols-2 gap-1 max-h-48 overflow-y-auto bg-[#0A0A0A] rounded-lg p-3">
                {TECHNIQUE_LIBRARY.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTechnique(t)}
                    className={`text-left text-xs px-2 py-1.5 rounded transition-colors ${
                      techniques.includes(t)
                        ? 'bg-[#D4A017]/20 text-[#D4A017]'
                        : 'text-gray-400 hover:bg-[#222222] hover:text-white'
                    }`}
                  >
                    {techniques.includes(t) ? '* ' : ''}
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
              Outcome ({outcome}/5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOutcome(s)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-7 w-7 ${
                      s <= outcome ? 'text-[#D4A017] fill-[#D4A017]' : 'text-[#333333]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white resize-none focus:outline-none focus:border-[#D4A017]"
              placeholder="Additional observations..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
            >
              Log & Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

function ScaleBar({ label, labelRight, value }: { label: string; labelRight: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{labelRight}</span>
      </div>
      <div className="relative h-2 bg-[#333333] rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-[#D4A017] rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-[#D4A017] transition-all"
          style={{ left: `calc(${value}% - 6px)` }}
        />
      </div>
    </div>
  );
}

function TraitBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#333333] rounded-full">
        <div
          className={`h-2 rounded-full transition-all ${color.replace('text-', 'bg-')}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right font-mono">{value}</span>
    </div>
  );
}

function RadarChart({
  personality,
}: {
  personality: {
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
}) {
  const traits = [
    { key: 'openness', label: 'O', value: personality.openness ?? 50 },
    { key: 'conscientiousness', label: 'C', value: personality.conscientiousness ?? 50 },
    { key: 'extraversion', label: 'E', value: personality.extraversion ?? 50 },
    { key: 'agreeableness', label: 'A', value: personality.agreeableness ?? 50 },
    { key: 'neuroticism', label: 'N', value: personality.neuroticism ?? 50 },
  ];

  const cx = 100;
  const cy = 100;
  const maxR = 80;
  const angleStep = (2 * Math.PI) / traits.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, radius: number) => {
    const angle = startAngle + index * angleStep;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  // Data polygon
  const dataPoints = traits.map((t, i) => getPoint(i, (t.value / 100) * maxR));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0">
      {/* Grid rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={traits.map((_, i) => {
            const p = getPoint(i, r * maxR);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none"
          stroke="#333333"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {traits.map((_, i) => {
        const p = getPoint(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#333333" strokeWidth="1" />;
      })}

      {/* Data polygon */}
      <polygon points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(212,160,23,0.2)" stroke="#D4A017" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#D4A017" />
      ))}

      {/* Labels */}
      {traits.map((t, i) => {
        const p = getPoint(i, maxR + 16);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-400 text-xs font-mono"
            fontSize="11"
          >
            {t.label}
          </text>
        );
      })}
    </svg>
  );
}
