'use client'

import React, { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import ScoreFormModal from "../Forms/ScoreFormModal";
import ScoreDetailModal from "./ScoreDetailModal";
import { Participant } from "@/types";
import CommentModal from "../Forms/CommentModal";
import ParticipantCardSkeleton from "./ParticipantCardSkeleton";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://kyeza.pythonanywhere.com'
    : 'http://localhost:8000');

interface Program {
  id: number;
  name: string;
  type?: unknown;
  active?: boolean;
  is_judgable?: boolean;
  category_label?: string | null;
  category_options?: string[];
  registration_fee?: number;
}

interface Registration {
  id: number;
  participant: Participant;
  program: number;
  category_value: string;
  payment_status: string;
  amount_paid: number;
  // Scoring metadata (from backend)
  has_scores?: boolean;
  scored_by?: string[];  // Array of judge usernames
  judge_count?: number;
  comment_count?: number;
}

// Judge Avatar Component with Tooltip
interface JudgeAvatarProps {
  name: string;
  isCurrentJudge?: boolean;
  size?: 'sm' | 'md';
}

const JudgeAvatar: React.FC<JudgeAvatarProps> = ({ name, isCurrentJudge = false, size = 'sm' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';
  
  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`${sizeClasses} flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-110 ${
          isCurrentJudge 
            ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
            : 'bg-gray-600 text-white'
        }`}
      >
        {initials}
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 shadow-lg">
          {name}
          {isCurrentJudge && <span className="text-blue-300 ml-1">(You)</span>}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// Judge Avatars Group
interface JudgeAvatarsGroupProps {
  judges: string[];
  currentJudgeName: string;
  maxDisplay?: number;
}

const JudgeAvatarsGroup: React.FC<JudgeAvatarsGroupProps> = ({ judges, currentJudgeName, maxDisplay = 4 }) => {
  const [showAll, setShowAll] = useState(false);
  const displayJudges = showAll ? judges : judges.slice(0, maxDisplay);
  const remaining = judges.length - maxDisplay;
  
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayJudges.map((judge, index) => (
          <JudgeAvatar 
            key={index} 
            name={judge} 
            isCurrentJudge={judge.toLowerCase() === currentJudgeName.toLowerCase()}
          />
        ))}
        {remaining > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-400 transition-colors"
          >
            +{remaining}
          </button>
        )}
      </div>
    </div>
  );
};



const JudgeDashboard: React.FC = () => {
  const [judgeName, setJudgeName] = useState("Judge");
  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // State for programs and registrations
  const [programs, setPrograms] = useState<Program[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug state changes
  useEffect(() => {
    console.log('📊 STATE UPDATE - Programs:', programs.length, programs);
  }, [programs]);

  useEffect(() => {
    console.log('📊 STATE UPDATE - Selected Program:', selectedProgram?.name || 'none', selectedProgram);
  }, [selectedProgram]);

  useEffect(() => {
    console.log('📊 STATE UPDATE - Registrations:', registrations.length);
  }, [registrations]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showOnlyUnscored, setShowOnlyUnscored] = useState(false);

  // Load user data from cookies
  useEffect(() => {
    console.log('🍪 Loading cookies...');
    const userData = Cookies.get('userData');
    const accessToken = Cookies.get('authToken'); // Changed from 'access_token' to 'authToken'
    
    console.log('📋 userData cookie exists:', !!userData);
    console.log('🔑 authToken cookie exists:', !!accessToken);
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log('✅ Parsed user data:', parsedData);
        setJudgeId(parsedData.id);
        setJudgeName(parsedData.username);
      } catch (error) {
        console.error('❌ Error parsing userData cookie: ', error);
      }
    } else {
      console.warn('⚠️ No userData cookie found!');
    }
    
    if (accessToken) {
      console.log('✅ Token set:', accessToken.substring(0, 20) + '...');
      setToken(accessToken);
    } else {
      console.warn('⚠️ No authToken cookie found! You may need to login again.');
    }
  }, []);

  // Fetch judgable programs
  useEffect(() => {
    const fetchPrograms = async () => {
      console.log('🔵 Starting fetchPrograms, token exists:', !!token);
      
      try {
        // Try new endpoint first
        let response;
        try {
          console.log('📡 Trying judgable endpoint...');
          response = await axios.get(`${API_BASE_URL}/register/programs/judgable/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          console.log('✅ Judgable endpoint succeeded');
        } catch (error) {
          // Fallback to regular programs endpoint if judgable endpoint doesn't exist
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn('⚠️ Judgable endpoint not found (404), falling back to /programs/');
            response = await axios.get(`${API_BASE_URL}/register/programs/`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            console.log('✅ Fallback endpoint succeeded');
          } else {
            console.error('❌ Non-404 error:', error);
            throw error;
          }
        }
        
        let programsData = response.data.results || response.data;
        console.log('📦 Raw programs data:', programsData.length, 'items');
        
        // Filter for active AND judgable programs if using fallback endpoint
        if (!response.config.url?.includes('judgable')) {
          const beforeFilter = programsData.length;
          programsData = programsData.filter((p: Program) => 
            p.active === true && p.is_judgable === true
          );
          console.log(`🔍 Filtered ${beforeFilter} -> ${programsData.length} active + judgable programs`);
        }
        
        console.log('✅ Setting programs state:', programsData.length);
        setPrograms(programsData);
        
        if (programsData.length > 0) {
          console.log('✅ Auto-selecting first program:', programsData[0].name);
          setSelectedProgram(programsData[0]);
        } else {
          console.warn('⚠️ No programs available!');
        }
      } catch (error) {
        console.error('❌ Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      console.log('🚀 Token available, calling fetchPrograms()');
      fetchPrograms();
    } else {
      console.warn('⚠️ No token available, skipping program fetch');
      setLoading(false);
    }
  }, [token]);

  // Fetch eligible registrations when program changes
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!selectedProgram) {
        return;
      }
      
      try {
        let response;
        
        // Try new endpoint first
        try {
          response = await axios.get(
            `${API_BASE_URL}/register/programs/${selectedProgram.id}/eligible-registrations/`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
        } catch (error) {
          // Fallback to regular registrations endpoint with filtering
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn('⚠️ Eligible endpoint not found, using /registrations/ with filters');
            
            const params: Record<string, string | number> = { program: selectedProgram.id };
            
            // Filter by payment status if program has fee
            if (selectedProgram.registration_fee && selectedProgram.registration_fee > 0) {
              params.payment_status = 'paid';
            }
            
            response = await axios.get(`${API_BASE_URL}/register/registrations/`, {
              params,
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
          } else {
            throw error;
          }
        }
        
        const registrationsData = response.data.results || response.data;
        console.log('✅ Registrations fetched:', registrationsData.length);
        setRegistrations(registrationsData);
      } catch (error) {
        console.error('❌ Error fetching registrations:', error);
      }
    };

    fetchRegistrations();
  }, [selectedProgram, token]);

  // Get unique categories for selected program
  const programCategories = useMemo(() => {
    if (!selectedProgram || !registrations.length) return [];
    
    const categories = new Set<string>();
    registrations.forEach(reg => {
      if (reg.category_value) {
        categories.add(reg.category_value);
      }
    });
    
    return Array.from(categories).sort();
  }, [selectedProgram, registrations]);

  // Filter registrations based on search, category, and scored status
  const filteredRegistrations = useMemo(() => {
    if (!selectedProgram) return [];
    
    return registrations.filter((registration) => {
      const participant = registration.participant;
      
      // Search filter
      const matchesSearch = !searchTerm || 
        participant.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.identifier?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
        registration.category_value === selectedCategory;
      
      // Unscored filter - show only those NOT scored by current judge
      const matchesUnscoredFilter = !showOnlyUnscored || 
        !registration.scored_by?.includes(judgeName);
      
      return matchesSearch && matchesCategory && matchesUnscoredFilter;
    });
  }, [registrations, selectedProgram, searchTerm, selectedCategory, showOnlyUnscored, judgeName]);

  // Count stats for display
  const scoringStats = useMemo(() => {
    if (!registrations.length) return { total: 0, scoredByMe: 0, unscoredByMe: 0 };
    
    const scoredByMe = registrations.filter(r => r.scored_by?.includes(judgeName)).length;
    return {
      total: registrations.length,
      scoredByMe,
      unscoredByMe: registrations.length - scoredByMe,
    };
  }, [registrations, judgeName]);

  // Registration-based scoring helpers
  const hasCurrentJudgeScored = (registration: Registration): boolean => {
    if (!judgeId || !registration.scored_by) return false;
    return registration.scored_by.includes(judgeName);
  };




  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isScoreDetailOpen, setIsScoreDetailOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);

  const handleAddScore = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const handleViewScores = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsScoreDetailOpen(true);
  };

  const handleAddComment = (registration: Registration) => {
    setSelectedParticipant(registration.participant.id);
    setSelectedRegistration(registration);
    setIsCommentModalOpen(true);
  };

  // Refresh registrations after scoring
  const handleScoreSubmitted = async () => {
    if (!selectedProgram || !token) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/register/programs/${selectedProgram.id}/eligible-registrations/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data.results || response.data;
      setRegistrations(data);
    } catch (error) {
      console.error('Error refreshing registrations:', error);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Welcome, <span className="text-blue-600">{judgeName}</span>
        </h1>
        
        {/* Scoring Progress Stats */}
        {registrations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm border">
              <span className="text-gray-500 text-sm">Total:</span>
              <span className="ml-1 font-semibold text-gray-800">{scoringStats.total}</span>
            </div>
            <div className="px-3 py-1.5 bg-green-50 rounded-lg shadow-sm border border-green-200">
              <span className="text-green-600 text-sm">Scored:</span>
              <span className="ml-1 font-semibold text-green-700">{scoringStats.scoredByMe}</span>
            </div>
            <div className="px-3 py-1.5 bg-orange-50 rounded-lg shadow-sm border border-orange-200">
              <span className="text-orange-600 text-sm">Remaining:</span>
              <span className="ml-1 font-semibold text-orange-700">{scoringStats.unscoredByMe}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4 bg-white rounded-xl p-4 shadow-sm">
        {/* Program Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program
          </label>
          <select
            className="p-3 border border-gray-300 rounded-lg w-full bg-white text-base"
            value={selectedProgram?.id || ""}
            onChange={(e) => {
              const program = programs.find(p => p.id === Number(e.target.value));
              setSelectedProgram(program || null);
              setSelectedCategory('all');
              setShowOnlyUnscored(false);
            }}
            disabled={loading || programs.length === 0}
          >
            {programs.length === 0 ? (
              <option value="">No active programs available</option>
            ) : (
              programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Search and Category Row */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full text-base"
            />
          </div>
          
          {/* Category Filter */}
          {programCategories.length > 0 && (
            <div className="md:w-48">
              <select
                className="p-3 border border-gray-300 rounded-lg w-full bg-white text-base"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {programCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Unscored Toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">Show only participants I haven&apos;t scored</span>
          <button
            onClick={() => setShowOnlyUnscored(!showOnlyUnscored)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              showOnlyUnscored ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                showOnlyUnscored ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Participant List */}
      <div className="space-y-3">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <ParticipantCardSkeleton key={i} />
            ))}
          </>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="text-gray-400 text-5xl mb-3">📋</div>
            <p className="text-lg font-semibold text-gray-700">No participants found</p>
            {showOnlyUnscored && scoringStats.unscoredByMe === 0 ? (
              <p className="text-sm text-green-600 mt-2">Great job! You&apos;ve scored all participants.</p>
            ) : searchTerm ? (
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
            ) : !selectedProgram ? (
              <p className="text-sm text-gray-500 mt-2">Please select a program first</p>
            ) : null}
          </div>
        ) : (
          filteredRegistrations.map((registration) => {
            const participant = registration.participant;
            const hasScored = hasCurrentJudgeScored(registration);
            const judgeCount = registration.scored_by?.length || 0;
            
            return (
              <div 
                key={registration.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md ${
                  hasScored ? 'border-l-green-500' : 'border-l-orange-400'
                }`}
              >
                <div className="p-4">
                  {/* Top Row: Name + Category */}
                  <div className="flex items-start justify-between mb-3">
                    <button 
                      onClick={() => handleViewScores(registration)}
                      className="text-left group"
                    >
                      <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {participant.first_name} {participant.last_name}
                      </h3>
                      {participant.identifier && (
                        <p className="text-xs text-gray-400">{participant.identifier}</p>
                      )}
                    </button>
                    
                    {registration.category_value && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        {registration.category_value}
                      </span>
                    )}
                  </div>
                  
                  {/* Middle Row: Judge Avatars */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {judgeCount > 0 ? (
                        <>
                          <JudgeAvatarsGroup 
                            judges={registration.scored_by || []} 
                            currentJudgeName={judgeName}
                          />
                          <span className="text-xs text-gray-500">
                            {judgeCount} judge{judgeCount !== 1 ? 's' : ''} scored
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No scores yet</span>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    {hasScored ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        ✓ Scored
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  
                  {/* Bottom Row: Action Buttons */}
                  <div className="flex gap-2">
                    {/* Score Button - Primary Action */}
                    <button
                      onClick={() => handleAddScore(registration)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all active:scale-98 ${
                        hasScored
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {hasScored ? '✏️ Update Scores' : '➕ Add Score'}
                    </button>
                    
                    {/* Comment Button */}
                    <button
                      onClick={() => handleAddComment(registration)}
                      className="relative py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all active:scale-98"
                    >
                      💬
                      {registration.comment_count && registration.comment_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full">
                          {registration.comment_count}
                        </span>
                      )}
                    </button>
                    
                    {/* View Scores Button */}
                    {judgeCount > 0 && (
                      <button
                        onClick={() => handleViewScores(registration)}
                        className="py-3 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold text-sm transition-all active:scale-98"
                      >
                        📊
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Score Modal Component */}
      {isModalOpen && selectedRegistration && (
        <ScoreFormModal 
          isOpen={isModalOpen} 
          setIsOpen={setIsModalOpen} 
          registrationId={selectedRegistration.id}
          participantName={`${selectedRegistration.participant.first_name} ${selectedRegistration.participant.last_name}`}
          categoryValue={selectedRegistration.category_value}
          onScoreSubmitted={handleScoreSubmitted}
        />
      )}

      {/* Score Detail Modal */}
      {isScoreDetailOpen && selectedRegistration && (
        <ScoreDetailModal
          isOpen={isScoreDetailOpen}
          setIsOpen={setIsScoreDetailOpen}
          registrationId={selectedRegistration.id}
          participantName={`${selectedRegistration.participant.first_name} ${selectedRegistration.participant.last_name}`}
          categoryValue={selectedRegistration.category_value}
          currentJudgeName={judgeName}
        />
      )}

      {/* Comment Modal Component */}
      {isCommentModalOpen && selectedParticipant && selectedRegistration && (
        <CommentModal 
          isOpen={isCommentModalOpen} 
          setIsOpen={setIsCommentModalOpen} 
          participantId={selectedParticipant}
          participantName={`${selectedRegistration.participant.first_name} ${selectedRegistration.participant.last_name}`}
          onCommentAdded={handleScoreSubmitted}
        />
      )}
    </div>
  );
};

export default JudgeDashboard;
