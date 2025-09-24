'use client'
import React, {useEffect, useMemo, useState} from "react";
// import dynamic from 'next/dynamic'
import {useRegistrationData} from "@/components/Contexts/regDataProvider";
import Image from "next/image";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Play, Users, Clock, ArrowRight} from 'lucide-react';
import Link from 'next/link';
import { programService, type Program as ApiProgram } from '@/services/programService';
import { toast } from 'sonner';
import ProgramCardSkeleton from '@/components/ProgramCardSkeleton';
import { Dialog, DialogBody, DialogTitle } from '@/components/ui/dialog';

interface Program {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  video: string;
  category: string;
  duration: string;
  age: string;
  participants: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  featured: boolean;
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
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        // 2) ?id=<id>
        const idParam = u.searchParams.get('id');
        if (idParam) {
          return `https://drive.google.com/uc?export=view&id=${idParam}`;
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
    thumbnail: normalizeImageUrl(p.thumbnail_url),
    video: normalizeVideoUrl(p.video_url),
    category: p.type?.name || 'Uncategorized',
    duration: formatDuration(p.start_date, p.end_date),
    age,
    participants: (enrollmentsById?.get(idKey) ?? enrollmentsByTitle?.get(titleKey) ?? 0),
    level: (level as Program['level']) || 'Beginner',
    featured: !!p.featured,
  };
}

export default function RegisterPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<string>('');

  const {isLoading, error, setActiveFilter
  } = useRegistrationData()


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


  // const {
  //     programs, isLoading, error,
  //     selectedProgram, setSelectedProgram,
  //     started, setStarted, setActiveFilter
  // } = useRegistrationData()


  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);

  // Derive category list from loaded programs
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(programs.map(p => p.category)))],
    [programs]
  );

  const isFetching = isLoading || loading;

  // Fetch programs + dashboard stats on mount
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
        if (mounted) {
          setPrograms(mapped);
          setFilteredPrograms(mapped);
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
    if (selectedCategory === 'All') {
      setFilteredPrograms(programs);
    } else {
      setFilteredPrograms(programs.filter(program => program.category === selectedCategory));
    }
  }, [selectedCategory, programs]);


  useEffect(() => {
    setActiveFilter(true)
  }, [setActiveFilter])

  // Inline handling below to allow layout skeletons

  return (
    <div className="w-full px-8 sm:py-8 text-center text-white space-y-6">
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="WokoApp Logo"
          width={100}
          height={60}
          priority
        />
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-3">
            Explore our
            <span className="text-orange-400"> Impactful Programs</span>
          </h2>
          <p className="text-lg text-gray-100 ">
            Join Wokober in transforming education through creativity, hands‑on learning, and community engagement.
          </p>
          {/*<div className="flex flex-wrap justify-center gap-4 mb-12">*/}
          {/*    <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">*/}
          {/*        <div className="text-2xl font-bold text-blue-600">500+</div>*/}
          {/*        <div className="text-sm text-gray-600">Programs Available</div>*/}
          {/*    </div>*/}
          {/*    <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">*/}
          {/*        <div className="text-2xl font-bold text-blue-600">10k+</div>*/}
          {/*        <div className="text-sm text-gray-600">Students Enrolled</div>*/}
          {/*    </div>*/}
          {/*    <div className="bg-white rounded-lg p-4 shadow-md border border-blue-100">*/}
          {/*        <div className="text-2xl font-bold text-blue-600">95%</div>*/}
          {/*        <div className="text-sm text-gray-600">Success Rate</div>*/}
          {/*    </div>*/}
          {/*</div>*/}
        </div>

      {/* Programs Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto ">
          <div className="flex flex-col  sm:flex-row justify-center items-center mb-12">

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
                        className="group hover:shadow-xl transition-all duration-300 border-blue-100 hover:border-blue-200 bg-white">
                    <div className="relative">
                      <div className="relative w-full h-48">
                        <Image
                          src={program.thumbnail || '/program-placeholder.jpg'}
                          alt={program.title}
                          fill
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

                    <CardHeader className="pb-3 text-black">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                          {program.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {program.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {program.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4"/>
                          <span>{program.duration || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4"/>
                          <span>{program.participants} enrolled</span>
                        </div>
                      </div>

                      <Link href={`/programs/${program.id}`}>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 group">
                          Register
                          <ArrowRight
                            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                        </Button>
                      </Link>
                    </CardContent>
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

      <div className="flex items-center justify-center space-x-4">
        <div>
          <Link
            href={'/dashboard'}
            className="w-full text-white font-semibold px-6  rounded-lg hover:text-green-400 underline"
          >login</Link>
        </div>

      </div>
    </div>
  )
}
