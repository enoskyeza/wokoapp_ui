'use client';

import React, {useEffect, useMemo, useState} from "react";
import {useRegistrationData} from "@/components/Contexts/regDataProvider";
import Image from "next/image";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Play, Users, Clock, ArrowRight, Phone, MessageCircle, Calendar, DollarSign, User, X} from 'lucide-react';
import Link from 'next/link';
import { programService, type Program as ApiProgram } from '@/services/programService';
import { toast } from 'sonner';
import ProgramCardSkeleton from '@/components/ProgramCardSkeleton';
import { Dialog, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { RegistrationModal } from '@/components/Registration/RegistrationModal';

interface Program {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  thumbnail: string;
  video: string;
  category: string;
  duration: string;
  age: string;
  participants: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  featured: boolean;
  hasActiveForm: boolean;
  instructor?: string;
  registration_fee?: number;
  start_date?: string;
  end_date?: string;
  capacity?: number | null;
  active?: boolean;
}

// Helper: format duration from start/end dates
function formatDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return '';
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    const weeks = Math.round(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  } catch {
    return '';
  }
}

// Map API program to display program shape
function mapApiToProgram(
  p: ApiProgram,
  enrollmentsById?: Map<string, number>,
  enrollmentsByTitle?: Map<string, number>
): Program {
  const level = (p.level || '').charAt(0).toUpperCase() + (p.level || '').slice(1);
  const ageMin = p.age_min ?? undefined;
  const ageMax = p.age_max ?? undefined;
  const age = ageMin != null && ageMax != null ? `${ageMin}-${ageMax} Years` : '';
  const FALLBACK_THUMBNAIL = 'https://images.pexels.com/photos/298825/pexels-photo-298825.jpeg?auto=compress&cs=tinysrgb&w=500';

  const normalizeImageUrl = (url?: string | null): string => {
    if (!url) return FALLBACK_THUMBNAIL;
    try {
      const u = new URL(url);
      if (u.hostname === 'drive.google.com') {
        // Handle various Drive formats to a viewable image endpoint
        // 1) /file/d/<id>/view
        const match = url.match(/\/file\/d\/([^/]+)/);
        if (match && match[1]) {
          // Use lh3.googleusercontent.com for better image loading
          return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
        // 2) ?id=<id>
        const idParam = u.searchParams.get('id');
        if (idParam) {
          return `https://lh3.googleusercontent.com/d/${idParam}`;
        }
      }
      // lh3.googleusercontent already serves images
      return url;
    } catch {
      return url || FALLBACK_THUMBNAIL;
    }
  };

  const normalizeVideoUrl = (url?: string | null): string => {
    if (!url) return '';
    try {
      const u = new URL(url);
      // YouTube handling
      if (u.hostname.includes('youtube.com')) {
        // watch?v=VIDEO_ID => embed/VIDEO_ID
        const vid = u.searchParams.get('v');
        if (vid) return `https://www.youtube.com/embed/${vid}`;
        // Already embed or other path
        return url;
      }
      if (u.hostname === 'youtu.be') {
        // short youtu.be/VIDEO_ID
        const vid = u.pathname.split('/').filter(Boolean)[0];
        if (vid) return `https://www.youtube.com/embed/${vid}`;
        return url;
      }
      // Google Drive video -> preview is embeddable
      if (u.hostname === 'drive.google.com') {
        const match = url.match(/\/file\/d\/([^/]+)/);
        if (match && match[1]) {
          return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
        const idParam = u.searchParams.get('id');
        if (idParam) return `https://drive.google.com/file/d/${idParam}/preview`;
      }
      return url;
    } catch {
      return url || '';
    }
  };
  const titleKey = (p.name || '').toLowerCase().trim();
  const idKey = String(p.id);
  return {
    id: String(p.id),
    title: p.name,
    description: p.description || '',
    long_description: p.long_description || '',
    thumbnail: normalizeImageUrl(p.thumbnail_url),
    video: normalizeVideoUrl(p.video_url),
    category: p.type?.name || 'Uncategorized',
    duration: formatDuration(p.start_date, p.end_date),
    age,
    participants: (enrollmentsById?.get(idKey) ?? enrollmentsByTitle?.get(titleKey) ?? 0),
    level: (level as Program['level']) || 'Beginner',
    featured: !!p.featured,
    hasActiveForm: false, // Will be updated after fetching form data
    instructor: p.instructor || '',
    registration_fee: parseFloat(p.registration_fee?.toString() || '0'),
    start_date: p.start_date,
    end_date: p.end_date,
    capacity: p.capacity ?? null,
    active: (p as unknown as { active?: boolean }).active ?? true,
  };
}

function RegisterPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [programDetailsOpen, setProgramDetailsOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const {isLoading, error, setActiveFilter} = useRegistrationData();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(programs.map(p => p.category)))],
    [programs]
  );

  const isFetching = isLoading || loading;


  // Helper function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to check if programs have active forms
  const checkActiveFormsForPrograms = async (programs: Program[]): Promise<Program[]> => {
    try {
      const updatedPrograms = await Promise.all(
        programs.map(async (program) => {
          try {
            // Check if program has active forms
            const baseUrl = process.env.NODE_ENV === 'production' ? 'https://kyeza.pythonanywhere.com' : 'http://127.0.0.1:8000';
            const response = await fetch(`${baseUrl}/register/programs/${program.id}/forms/`, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const forms = await response.json();
              console.log(`Program ${program.id} forms:`, forms); // Debug log
              
              if (Array.isArray(forms)) {
                const hasActiveForm = forms.some(form => 
                  form.is_active === true || form.isActive === true
                );
                console.log(`Program ${program.id} hasActiveForm:`, hasActiveForm); // Debug log
                return { ...program, hasActiveForm };
              }
              return { ...program, hasActiveForm: false };
            } else {
              console.warn(`Failed to fetch forms for program ${program.id}:`, response.status, response.statusText);
              return { ...program, hasActiveForm: false };
            }
          } catch (error) {
            console.error(`Error checking forms for program ${program.id}:`, error);
            return { ...program, hasActiveForm: false };
          }
        })
      );
      return updatedPrograms;
    } catch (error) {
      console.error('Error checking active forms:', error);
      return programs.map(p => ({ ...p, hasActiveForm: false }));
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [apiPrograms, stats] = await Promise.all([
          programService.getAllPrograms(),
          programService.getDashboardStats(),
        ]);
        const enrollmentsById = new Map<string, number>();
        const enrollmentsByTitle = new Map<string, number>();
        if (stats?.programs) {
          for (const pr of stats.programs) {
            const titleKey = (pr.title || '').toLowerCase().trim();
            if (titleKey) enrollmentsByTitle.set(titleKey, pr.enrollments ?? 0);
            if (pr.id) enrollmentsById.set(String(pr.id), pr.enrollments ?? 0);
          }
        }
        const mapped = apiPrograms.map(p => mapApiToProgram(p, enrollmentsById, enrollmentsByTitle));
        
        // Check for active forms
        const programsWithActiveForms = await checkActiveFormsForPrograms(mapped);
        
        // Temporary fallback: Set known active programs based on backend data
        const programsWithFallback = programsWithActiveForms.map(program => {
          // Program 4 (Mentorship Program 2025) has active form
          if (program.id === '4') {
            return { ...program, hasActiveForm: true };
          }
          return program;
        });
        
        if (mounted) {
          setPrograms(programsWithFallback);
          setFilteredPrograms(programsWithFallback);
        }
      } catch (e) {
        console.error('Failed to load programs', e);
        setLoadError('Failed to load programs. Please try again later.');
        toast.error('Failed to load programs');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let list = programs;
    // Hide archived/inactive
    list = list.filter(p => p.active !== false);
    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(program => program.category === selectedCategory);
    }
    // Sort: featured first, then newest (approximate by numeric id desc)
    list = [...list].sort((a, b) => {
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (af !== bf) return bf - af;
      const at = Number(a.id) || 0;
      const bt = Number(b.id) || 0;
      return bt - at;
    });
    setFilteredPrograms(list);
  }, [selectedCategory, programs]);

  useEffect(() => {
    setActiveFilter(true);
  }, [setActiveFilter]);

  return (
    <div className="w-full px-8 sm:py-8 text-center text-white space-y-6">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-3">
          Explore our
          <span className="text-orange-400"> Impactful Programs</span>
        </h2>
        <p className="text-lg text-gray-100">
          Join Wokober in transforming education through creativity, hands‑on learning, and community engagement.
        </p>
      </div>

      {/* Programs Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-center items-center mb-12">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="default"
                  className={
                    selectedCategory === category
                      ? "bg-orange-500 hover:bg-orange-600 text-white border-none"
                      : "bg-gray-200 hover:bg-gray-300 text-black border border-gray-200"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Error message (inline) */}
          {(error || loadError) && (
            <div className="text-red-300 bg-red-900/20 border border-red-700 rounded p-3 mb-4">
              {loadError || 'Failed to load programs.'}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isFetching
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProgramCardSkeleton key={`skeleton-${i}`} />
                ))
              : filteredPrograms.map((program) => (
                  <Card key={program.id}
                        className="group hover:shadow-xl transition-all duration-300 border-blue-100 hover:border-blue-200 bg-white flex flex-col h-full">
                    <div className="relative">
                      <div className="relative w-full h-48">
                        <Image
                          src={program.thumbnail || '/program-placeholder.jpg'}
                          alt={program.title}
                          fill
                          priority
                          className="object-cover rounded-t-lg"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                      {program.video && (
                        <button
                          type="button"
                          onClick={() => { setVideoSrc(program.video); setVideoOpen(true); }}
                          className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center focus:opacity-100 focus:outline-none"
                          aria-label={`Play video for ${program.title}`}
                        >
                          <Play className="w-12 h-12 text-white"/>
                        </button>
                      )}
                      {program.featured && (
                        <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                          Featured
                        </Badge>
                      )}
                      <Badge className={`absolute top-3 right-3 ${getLevelColor(program.level)}`}>
                        {program.age}
                      </Badge>
                    </div>

                    <div className="flex flex-col flex-1">
                      <CardHeader className="pb-3 text-black flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {program.category}
                          </Badge>
                        </div>
                        <CardTitle 
                          className="text-lg text-start group-hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedProgram(program);
                            setProgramDetailsOpen(true);
                          }}
                        >
                          {program.title}
                        </CardTitle>
                        <CardDescription 
                          className="text-sm leading-relaxed text-left"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {program.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0 mt-auto">
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4"/>
                            <span>
                              {program.start_date 
                                ? formatDate(program.start_date)
                                : 'TBD'
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4"/>
                              <span>{program.duration || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4"/>
                              {(() => {
                                const capacity = typeof program.capacity === 'number' ? program.capacity : null;
                                if (!capacity || capacity <= 0) {
                                  return <span>Spots: —</span>;
                                }
                                const enrolled = Math.max(0, program.participants || 0);
                                const left = Math.max(0, capacity - enrolled);
                                const ratioLeft = capacity > 0 ? left / capacity : 0;
                                const critical = ratioLeft <= 0.15;
                                return (
                                  <span className={`${critical ? 'text-orange-600 animate-pulse font-semibold' : 'text-gray-700'}`}>
                                    {left} spot{left === 1 ? '' : 's'} left
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {program.hasActiveForm ? (
                            <Button
                              onClick={() => {
                                setSelectedProgramId(parseInt(program.id));
                                setRegistrationModalOpen(true);
                              }}
                              className="w-full bg-green-600 hover:bg-green-700 group"
                            >
                              Register Now
                              <ArrowRight
                                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedProgram(program);
                                setProgramDetailsOpen(true);
                              }}
                              className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600"
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={videoOpen} onClose={() => { setVideoOpen(false); setVideoSrc(''); }} size="3xl">
        <DialogTitle>Program Video</DialogTitle>
        <DialogBody>
          {videoSrc ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={videoSrc}
                title="Program video"
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-zinc-600">No video available.</p>
          )}
        </DialogBody>
      </Dialog>

      {/* Registration Modal */}
      {selectedProgramId && (
        <RegistrationModal
          programId={selectedProgramId}
          isOpen={registrationModalOpen}
          onClose={() => {
            setRegistrationModalOpen(false);
            setSelectedProgramId(null);
          }}
        />
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <Dialog 
          open={programDetailsOpen} 
          onClose={() => {
            setProgramDetailsOpen(false);
            setSelectedProgram(null);
          }} 
          size="4xl"
        >
          <div className="relative">
            <button
              onClick={() => {
                setProgramDetailsOpen(false);
                setSelectedProgram(null);
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <DialogBody className="p-0">
              <div className="relative">
                {/* Hero Image */}
                <div className="relative w-full h-64 md:h-80">
                  <Image
                    src={selectedProgram.thumbnail || '/program-placeholder.jpg'}
                    alt={selectedProgram.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{selectedProgram.title}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {selectedProgram.category}
                      </Badge>
                      <Badge className={`${getLevelColor(selectedProgram.level)} border-0`}>
                        {selectedProgram.age}
                      </Badge>
                      {selectedProgram.featured && (
                        <Badge className="bg-orange-500 text-white border-0">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Description */}
                      <div>
                        <h2 className="text-xl font-semibold mb-3 text-gray-900">About This Program</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {selectedProgram.description}
                        </p>
                        {selectedProgram.long_description && (
                          <p className="text-gray-700 leading-relaxed">
                            {selectedProgram.long_description}
                          </p>
                        )}
                      </div>

                      {/* Program Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{selectedProgram.duration || '—'}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Spots left</p>
                          {(() => {
                            const capacity = typeof selectedProgram.capacity === 'number' ? selectedProgram.capacity : null;
                            if (!capacity || capacity <= 0) {
                              return <p className="font-semibold text-gray-900">—</p>;
                            }
                            const enrolled = Math.max(0, selectedProgram.participants || 0);
                            const left = Math.max(0, capacity - enrolled);
                            const ratioLeft = capacity > 0 ? left / capacity : 0;
                            const critical = ratioLeft <= 0.15;
                            return (
                              <p className={`font-semibold ${critical ? 'text-orange-600 animate-pulse' : 'text-gray-900'}`}>
                                {left} spot{left === 1 ? '' : 's'} left
                              </p>
                            );
                          })()}
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <DollarSign className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Fee</p>
                          <p className="font-semibold text-gray-900">
                            {selectedProgram.registration_fee ? formatPrice(selectedProgram.registration_fee) : 'Free'}
                          </p>
                        </div>
                        {selectedProgram.instructor && (
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Instructor</p>
                            <p className="font-semibold text-gray-900">{selectedProgram.instructor}</p>
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      {selectedProgram.start_date && selectedProgram.end_date && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-900">Program Schedule</h3>
                          </div>
                          <p className="text-blue-800">
                            <span className="font-medium">Starts:</span> {formatDate(selectedProgram.start_date)}
                          </p>
                          <p className="text-blue-800">
                            <span className="font-medium">Ends:</span> {formatDate(selectedProgram.end_date)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Registration CTA */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Ready to Join?</h3>
                        {selectedProgram.hasActiveForm ? (
                          <Button
                            onClick={() => {
                              setSelectedProgramId(parseInt(selectedProgram.id));
                              setRegistrationModalOpen(true);
                              setProgramDetailsOpen(false);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                            size="lg"
                          >
                            Register Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <div className="mb-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                              <p className="text-sm text-orange-800">
                                Registration is currently not available for this program.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Video Button */}
                        {selectedProgram.video && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setVideoSrc(selectedProgram.video);
                              setVideoOpen(true);
                            }}
                            className="w-full mb-4"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Video
                          </Button>
                        )}

                        {/* Contact Support */}
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 font-medium">Need more information?</p>
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              window.open('https://wa.me/256700000000?text=Hello, I need more information about the ' + selectedProgram.title + ' program.', '_blank');
                            }}
                            className="w-full text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp Us
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              window.open('tel:+256700000000', '_self');
                            }}
                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call Us
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogBody>
          </div>
        </Dialog>
      )}

      <div className="flex items-center justify-center space-x-4">
        <div>
          <Link
            href={'/dashboard'}
            className="w-full text-white font-semibold px-6 rounded-lg hover:text-green-400 underline"
          >login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
