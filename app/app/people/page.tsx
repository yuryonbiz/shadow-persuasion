'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, UserSearch, Brain, Calendar, MessageSquare, X, AlertTriangle, Target } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const RELATIONSHIP_TYPES = ['Boss', 'Client', 'Partner', 'Ex', 'Friend', 'Rival', 'Family', 'Other'] as const;
type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export interface Profile {
  id: string;
  name: string;
  relationshipType: RelationshipType;
  traits: {
    communication?: {
      directness?: number;
      logicVsEmotion?: number;
      assertiveness?: number;
      openness?: number;
      summary?: string;
      // Merged from Relationship Memory
      sensoryPreference?: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Mixed';
      emotionalPattern?: string;
      receptivity?: number;
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
  interactions: {
    id: string;
    date: string;
    summary: string;
    techniques: string[];
    outcome: number;
    notes: string;
    aiAnalysis?: string;
  }[];
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
  // Merged from Relationship Memory
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  nextRecommendedAction?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfilerData {
  profiles: Profile[];
}

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
    Other: 'bg-gray-500/20 text-gray-500 dark:text-gray-400 border-gray-500/30',
  };
  return colors[type] || colors.Other;
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-gray-500 dark:text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

export default function PeoplePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getHeaders = useCallback(async () => {
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch('/api/profiler/people', { headers });
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        }
      } catch (e) {
        console.error('Failed to load profiler data:', e);
      }
      setIsLoading(false);
    };
    loadProfiles();
  }, [getHeaders]);

  const handleAddProfile = async (name: string, relationshipType: RelationshipType) => {
    try {
      const headers = await getHeaders();
      const res = await fetch('/api/profiler/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ name, relationshipType }),
      });
      if (res.ok) {
        const data = await res.json();
        const newProfile = data.profile;
        setProfiles((prev) => [newProfile, ...prev]);
        setIsAddModalOpen(false);
        router.push(`/app/people/${newProfile.id}`);
      }
    } catch (e) {
      console.error('Failed to create profile:', e);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.keyTraitTags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = !filterType || p.relationshipType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalInteractions = profiles.reduce((sum, p) => sum + p.interactions.length, 0);
  const avgConfidence = profiles.length > 0
    ? Math.round(profiles.reduce((sum, p) => sum + (p.confidenceScore || 0), 0) / profiles.length)
    : 0;
  const playbookCount = profiles.filter((p) => p.playbook?.generatedAt).length;
  const highRiskCount = profiles.filter((p) => p.riskLevel === 'HIGH').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">People</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Build psychological dossiers, log interactions, track risk levels, and generate personalized strategies
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profiles.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Profiles</p>
            </div>
            <UserSearch className="h-7 w-7 text-[#D4A017]" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-400">{totalInteractions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Interactions</p>
            </div>
            <MessageSquare className="h-7 w-7 text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-400">{avgConfidence}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Avg Confidence</p>
            </div>
            <Brain className="h-7 w-7 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-400">{highRiskCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">High Risk</p>
            </div>
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search profiles, traits, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
        >
          <option value="">All Types</option>
          {RELATIONSHIP_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Profile Grid */}
      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const lastInteraction =
              profile.interactions.length > 0
                ? profile.interactions[profile.interactions.length - 1]
                : null;
            return (
              <button
                key={profile.id}
                onClick={() => router.push(`/app/people/${profile.id}`)}
                className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-6 text-left hover:border-[#D4A017]/50 transition-colors space-y-4"
              >
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#D4A017] font-bold font-mono text-lg">
                      {getInitials(profile.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{profile.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-mono border rounded ${getRelationshipColor(
                          profile.relationshipType
                        )}`}
                      >
                        {profile.relationshipType}
                      </span>
                      {profile.riskLevel && profile.riskLevel !== 'LOW' && (
                        <span className={`inline-block px-2 py-0.5 text-xs font-mono border rounded ${getRiskColor(profile.riskLevel)}`}>
                          {profile.riskLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  {(profile.confidenceScore ?? 0) > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-[#D4A017]">{profile.confidenceScore}%</p>
                      <p className="text-[10px] text-gray-500 font-mono uppercase">Confidence</p>
                    </div>
                  )}
                </div>

                {/* Next Recommended Action (merged from Relationship Memory) */}
                {profile.nextRecommendedAction && (
                  <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-2 rounded border-l-2 border-[#D4A017]">
                    <div className="flex items-start gap-2">
                      <Target className="h-3 w-3 text-[#D4A017] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{profile.nextRecommendedAction}</p>
                    </div>
                  </div>
                )}

                {/* Trait Tags + Custom Tags */}
                {((profile.keyTraitTags || []).length > 0 || (profile.tags || []).length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {(profile.keyTraitTags || []).slice(0, 3).map((tag, i) => (
                      <span key={`trait-${i}`} className="text-xs bg-gray-200 dark:bg-[#333333] text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {(profile.tags || []).slice(0, 3).map((tag, i) => (
                      <span key={`tag-${i}`} className="text-xs bg-[#D4A017]/10 text-[#D4A017] px-2 py-0.5 rounded border border-[#D4A017]/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-[#333333]">
                  <span className="font-mono">
                    {profile.interactions.length} interaction{profile.interactions.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    {lastInteraction
                      ? `Last: ${new Date(lastInteraction.date).toLocaleDateString()}`
                      : 'No interactions yet'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          {searchTerm || filterType ? (
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No profiles match your filters</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              <UserSearch className="h-16 w-16 text-[#D4A017]/40 mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-[#D4A017] mb-2">Start Building Psychological Profiles</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Create profiles for people in your life. Log interactions and let AI build deep psychological
                  assessments and personalized strategies.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#D4A017] text-[#0A0A0A] px-6 py-3 rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
              >
                Create Your First Profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Profile Modal */}
      {isAddModalOpen && (
        <AddProfileModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProfile} />
      )}
    </div>
  );
}

function AddProfileModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, type: RelationshipType) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<RelationshipType>('Other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), type);
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#333333]">
          <h2 className="text-xl font-mono uppercase text-[#D4A017]">New Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-md p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
              placeholder="Full name"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">Relationship Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RelationshipType)}
              className="w-full bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-md p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
            >
              {RELATIONSHIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-[#333333] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#444444] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
