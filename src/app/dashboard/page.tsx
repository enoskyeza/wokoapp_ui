'use client';

import {useState} from 'react';
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
    // Settings,
    Eye,
    Edit,
    Trash2,
    // ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import {ParticipantProvider} from "@/context/ParticipantContext";
import DashboardLayout from "@/components/Layouts/Dashboard";

interface Program {
    id: string;
    title: string;
    category: string;
    status: 'active' | 'draft' | 'archived';
    enrollments: number;
    createdAt: string;
}

interface FormTemplate {
    id: string;
    name: string;
    programId: string;
    programTitle: string;
    fields: number;
    submissions: number;
    createdAt: string;
}

const mockPrograms: Program[] = [
    {
        id: '1',
        title: 'Creative Toy Making Workshop',
        category: 'Manufacturing',
        status: 'active',
        enrollments: 245,
        createdAt: '2025-01-15'
    },
    {
        id: '2',
        title: 'Leadership Mentorship Program',
        category: 'Leadership',
        status: 'active',
        enrollments: 189,
        createdAt: '2025-01-10'
    },
    {
        id: '3',
        title: 'Digital Skills Bootcamp',
        category: 'Technology',
        status: 'draft',
        enrollments: 0,
        createdAt: '2025-01-20'
    }
];

const mockForms: FormTemplate[] = [
    {
        id: 'form-1',
        name: 'Toy Making Registration',
        programId: '1',
        programTitle: 'Creative Toy Making Workshop',
        fields: 12,
        submissions: 245,
        createdAt: '2025-01-15'
    },
    {
        id: 'form-2',
        name: 'Leadership Program Application',
        programId: '2',
        programTitle: 'Leadership Mentorship Program',
        fields: 15,
        submissions: 189,
        createdAt: '2025-01-10'
    }
];

export default function AdminDashboard() {
    const [programs, setPrograms] = useState<Program[]>(mockPrograms);
    const [forms, setForms] = useState<FormTemplate[]>(mockForms);

    const era=false
    if(era){
        setPrograms(mockPrograms)
        setForms(mockForms)
    }

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

    const totalEnrollments = programs.reduce((sum, program) => sum + program.enrollments, 0);
    const activePrograms = programs.filter(p => p.status === 'active').length;
    const totalSubmissions = forms.reduce((sum, form) => sum + form.submissions, 0);

    return (

        <ParticipantProvider>
            <DashboardLayout>
                    <div className="">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Programs</p>
                                            <p className="text-3xl font-bold text-blue-600">{programs.length}</p>
                                        </div>
                                        <BookOpen className="w-8 h-8 text-blue-600"/>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Active Programs</p>
                                            <p className="text-3xl font-bold text-green-600">{activePrograms}</p>
                                        </div>
                                        <BarChart3 className="w-8 h-8 text-green-600"/>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Enrollments</p>
                                            <p className="text-3xl font-bold text-purple-600">{totalEnrollments}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-purple-600"/>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Form Submissions</p>
                                            <p className="text-3xl font-bold text-orange-600">{totalSubmissions}</p>
                                        </div>
                                        <FileText className="w-8 h-8 text-orange-600"/>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <Tabs defaultValue="programs" className="w-full">
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
                                        <div className="space-y-4">
                                            {programs.map((program) => (
                                                <div key={program.id}
                                                     className="sm:flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900">{program.title}</h3>
                                                            <Badge className={getStatusColor(program.status)}>
                                                                {program.status}
                                                            </Badge>
                                                            <Badge variant="outline"
                                                                   className="border-blue-200 text-blue-700">
                                                                {program.category}
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
                                            ))}
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
                                            {forms.map((form) => (
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
                                            ))}
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