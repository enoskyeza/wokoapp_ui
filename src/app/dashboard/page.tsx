'use client';

import React, {useState, useMemo, useEffect} from 'react';
import {useDashboardData} from '@/hooks/useDashboardData';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
    Plus,
    Users,
    BookOpen,
    FileText,
    BarChart3,
    Eye,
    Edit,
    Trash2,
    Search,
    Filter,
    SortAsc,
    SortDesc,
} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {ParticipantProvider} from "@/context/ParticipantContext";
import DashboardLayout from "@/components/Layouts/Dashboard";
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData();
    
    // Use real data from API or fallback to empty arrays (memoized to prevent dependency issues)
    const programs = useMemo(() => dashboardData?.programs || [], [dashboardData?.programs]);
    const forms = useMemo(() => dashboardData?.forms || [], [dashboardData?.forms]);
    const stats = dashboardData?.stats;

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Get unique categories for filter dropdown
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(programs.map(p => p.category))];
        return uniqueCategories;
    }, [programs]);

    // Filter and sort programs
    const filteredAndSortedPrograms = useMemo(() => {
        let filtered = programs;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(program => 
                program.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(program => program.category === categoryFilter);
        }

        // Apply sorting
        filtered = [...filtered].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [programs, searchQuery, categoryFilter, sortOrder]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Use stats from API or calculate from data
    const totalEnrollments = stats?.total_enrollments || programs.reduce((sum, program) => sum + program.enrollments, 0);
    const activePrograms = stats?.active_programs || programs.filter(p => p.status === 'active').length;
    const totalSubmissions = stats?.total_form_submissions || forms.reduce((sum, form) => sum + form.submissions, 0);
    const totalPrograms = stats?.total_programs || programs.length;

    // Tabs state synced with URL (?tab=programs|forms) with localStorage fallback
    const getInitialTab = (): 'programs' | 'forms' => {
        const urlTab = searchParams.get('tab');
        if (urlTab === 'forms' || urlTab === 'programs') return urlTab;
        
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dashboard_active_tab');
            if (saved === 'forms' || saved === 'programs') return saved;
        }
        return 'programs';
    };
    
    const [activeTab, setActiveTab] = useState<'programs' | 'forms'>(getInitialTab());
    
    useEffect(() => {
        const q = searchParams.get('tab');
        const fromUrl = (q === 'forms' || q === 'programs') ? q : null;
        
        if (fromUrl) {
            if (fromUrl !== activeTab) setActiveTab(fromUrl as 'programs' | 'forms');
        } else {
            // No URL param, use localStorage or default
            const saved = localStorage.getItem('dashboard_active_tab');
            const fallback = (saved === 'forms' || saved === 'programs') ? saved : 'programs';
            if (fallback !== activeTab) setActiveTab(fallback as 'programs' | 'forms');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    const onTabChange = (val: string) => {
        const v = (val === 'forms') ? 'forms' : 'programs';
        setActiveTab(v);
        
        // Save to localStorage
        localStorage.setItem('dashboard_active_tab', v);
        
        // Update URL
        const sp = new URLSearchParams(Array.from(searchParams.entries()));
        sp.set('tab', v);
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    };

    return (
        <ParticipantProvider>
            <DashboardLayout>
                <div className="">
                    {/* Error handling */}
                    {dashboardError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">Error loading dashboard data: {dashboardError}</p>
                        </div>
                    )}
                    
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[0,1,2,3].map((i) => (
                          <Card key={i}>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">{['Total Programs','Active Programs','Total Enrollments','Form Submissions'][i]}</p>
                                  {dashboardLoading ? (
                                    <Skeleton className="h-8 w-24 mt-1" />
                                  ) : (
                                    <p className={`text-3xl font-bold ${['text-blue-600','text-green-600','text-purple-600','text-orange-600'][i]}`}>
                                      {[totalPrograms, activePrograms, totalEnrollments, totalSubmissions][i] as number}
                                    </p>
                                  )}
                                </div>
                                {i === 0 && <BookOpen className="w-8 h-8 text-blue-600"/>}
                                {i === 1 && <BarChart3 className="w-8 h-8 text-green-600"/>}
                                {i === 2 && <Users className="w-8 h-8 text-purple-600"/>}
                                {i === 3 && <FileText className="w-8 h-8 text-orange-600"/>}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {/* Main Content */}
                    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-200">
                            <TabsTrigger value="programs">Programs Management</TabsTrigger>
                            <TabsTrigger value="forms">Forms Management</TabsTrigger>
                        </TabsList>

                        <TabsContent value="programs" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Programs</CardTitle>
                                            <CardDescription>Manage your skilling programs</CardDescription>
                                        </div>
                                        <Link href="/dashboard/programs/create">
                                            <Button color={"blue"} className=" hover:bg-blue-700">
                                                <Plus className="w-4 h-4 mr-2"/>
                                                Create Program
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Filter Controls */}
                                    <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                                        {/* Search Input */}
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                placeholder="Search programs by name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        
                                        {/* Category Filter */}
                                        <div className="sm:w-48">
                                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                                <SelectTrigger>
                                                    <Filter className="w-4 h-4 mr-2" />
                                                    <SelectValue placeholder="Filter by category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* Sort Order */}
                                        <div className="sm:w-40">
                                            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                                                <SelectTrigger>
                                                    {sortOrder === 'newest' ? 
                                                        <SortDesc className="w-4 h-4 mr-2" /> : 
                                                        <SortAsc className="w-4 h-4 mr-2" />
                                                    }
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="newest">Newest First</SelectItem>
                                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    {/* Results Counter */}
                                    {!dashboardLoading && (
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm text-gray-600">
                                                Showing {filteredAndSortedPrograms.length} of {programs.length} programs
                                                {(searchQuery || categoryFilter !== 'all') && (
                                                    <span className="ml-2">
                                                        • Filtered by: {searchQuery && `"${searchQuery}"`} 
                                                        {searchQuery && categoryFilter !== 'all' && ', '}
                                                        {categoryFilter !== 'all' && `${categoryFilter}`}
                                                    </span>
                                                )}
                                            </p>
                                            {(searchQuery || categoryFilter !== 'all') && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setCategoryFilter('all');
                                                    }}
                                                >
                                                    Clear Filters
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="space-y-4">
                                        {dashboardLoading ? (
                                            <div className="space-y-3">
                                                {[0,1,2].map((i) => (
                                                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex-1">
                                                        <Skeleton className="h-5 w-52 mb-2" />
                                                        <div className="flex items-center gap-4">
                                                          <Skeleton className="h-4 w-28" />
                                                          <Skeleton className="h-4 w-36" />
                                                        </div>
                                                      </div>
                                                      <div className="hidden sm:flex items-center gap-2">
                                                        <Skeleton className="h-9 w-24" />
                                                        <Skeleton className="h-9 w-20" />
                                                        <Skeleton className="h-9 w-24" />
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                            </div>
                                        ) : filteredAndSortedPrograms.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">
                                                    {searchQuery || categoryFilter !== 'all' ? 'No programs match your filters' : 'No programs found'}
                                                </p>
                                            </div>
                                        ) : (
                                            filteredAndSortedPrograms.map((program) => (
                                                <div key={program.id}
                                                     className="sm:flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900">{program.title}</h3>
                                                            <Badge className={getStatusColor(program.status)}>
                                                                {program.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                              <span className="flex items-center gap-1">
                                                                <Users className="w-4 h-4"/>
                                                                  {program.enrollments} enrolled
                                                              </span>
                                                            <span>Created: {new Date(program.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 sm:mt-0 flex items-center gap-2">
                                                        <Link href={`/programs/${program.id}`}>
                                                            <Button variant="outline">
                                                                <Eye className="w-4 h-4 mr-1"/>
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Button variant="outline">
                                                            <Edit className="w-4 h-4 mr-1"/>
                                                            Edit
                                                        </Button>
                                                        <Button variant="outline"
                                                                className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4 mr-1"/>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="forms" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Registration Forms</CardTitle>
                                            <CardDescription>Manage custom registration forms for your
                                                programs</CardDescription>
                                        </div>
                                        <Link href="/dashboard/forms/create">
                                            <Button color={'blue'} className=" hover:bg-blue-700">
                                                <Plus className="w-4 h-4 mr-2"/>
                                                Create Form
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {dashboardLoading ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">Loading forms...</p>
                                            </div>
                                        ) : forms.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">No forms found</p>
                                            </div>
                                        ) : (
                                            forms.map((form) => (
                                                <div key={form.id}
                                                     className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900">{form.name}</h3>
                                                            <Badge variant="outline"
                                                                   className="border-blue-200 text-blue-700">
                                                                {form.programTitle}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                              <span className="flex items-center gap-1">
                                                                <FileText className="w-4 h-4"/>
                                                                  {form.fields} fields
                                                              </span>
                                                              <span className="flex items-center gap-1">
                                                                  <Users className="w-4 h-4"/>
                                                                  {form.submissions} submissions
                                                              </span>
                                                            <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline">
                                                            <Eye className="w-4 h-4 mr-1"/>
                                                            Preview
                                                        </Button>
                                                        <Button variant="outline">
                                                            <Edit className="w-4 h-4 mr-1"/>
                                                            Edit
                                                        </Button>
                                                        <Button variant="outline">
                                                            <BarChart3 className="w-4 h-4 mr-1"/>
                                                            Analytics
                                                        </Button>
                                                        <Button variant="outline"
                                                                className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4 mr-1"/>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DashboardLayout>
        </ParticipantProvider>
    );
}
