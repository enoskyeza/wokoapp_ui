'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Progress} from '@/components/ui/progress';
import {Badge} from '@/components/ui/badge';
import DashboardLayout from "@/components/Layouts/Dashboard";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    ArrowRight,
    Save,
    // Eye,
    Plus,
    Trash2,
    BookOpen,
    Settings,
    // Users,
    // Calendar,
    // DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface ProgramData {
    basic: {
        title: string;
        description: string;
        longDescription: string;
        category: string;
        level: string;
        thumbnail: string;
        video: string;
    };
    details: {
        duration: string;
        price: number;
        maxParticipants: number;
        instructor: string;
        startDate: string;
        endDate: string;
        featured: boolean;
    };
    curriculum: {
        modules: string[];
        learningOutcomes: string[];
        requirements: string[];
    };
}

type ElementOf<
    A
> = A extends Array<infer U> ? U : never;


type ArrayKeys<K extends keyof ProgramData> = {
    [P in keyof ProgramData[K]]: ProgramData[K][P] extends Array<unknown> ? P : never
}[keyof ProgramData[K]];


const initialData: ProgramData = {
    basic: {
        title: '',
        description: '',
        longDescription: '',
        category: '',
        level: '',
        thumbnail: '',
        video: ''
    },
    details: {
        duration: '',
        price: 0,
        maxParticipants: 0,
        instructor: '',
        startDate: '',
        endDate: '',
        featured: false
    },
    curriculum: {
        modules: [''],
        learningOutcomes: [''],
        requirements: ['']
    }
};

const categories = ['Manufacturing', 'Leadership', 'Technology', 'Business', 'Creative Arts', 'Health & Wellness'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateProgram() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [programData, setProgramData] = useState<ProgramData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = [
        {id: 'basic', title: 'Basic Information', description: 'Program title, description, and media'},
        {id: 'details', title: 'Program Details', description: 'Duration, pricing, and scheduling'},
        {id: 'curriculum', title: 'Curriculum & Outcomes', description: 'Modules, outcomes, and requirements'}
    ];

    function updateData<
        K extends keyof ProgramData,
        F extends keyof ProgramData[K]
    >(
        section: K,
        field: F,
        value: ProgramData[K][F]
    ) {
        setProgramData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    }

    /** Append a blank string onto any array field */
    function addArrayItem<
        K extends keyof ProgramData,
        F extends ArrayKeys<K>
    >(
        section: K,
        field: F
    ) {
        setProgramData((prev) => {
            // tell TS “this is definitely an array of the right element type”
            type E = ElementOf<ProgramData[K][F]>;
            const arr = prev[section][field] as unknown as E[];
            const newArr = [...arr, '' as E];
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: newArr as ProgramData[K][F],
                },
            };
        });
    }

    /** Update a single element in any array field */
    function updateArrayItem<
        K extends keyof ProgramData,
        F extends ArrayKeys<K>
    >(
        section: K,
        field: F,
        index: number,
        value: ElementOf<ProgramData[K][F]>
    ) {
        setProgramData((prev) => {
            type E = ElementOf<ProgramData[K][F]>;
            const arr = prev[section][field] as unknown as E[];
            const newArr = arr.map((item: E, i: number) =>
                i === index ? value : item
            );
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: newArr as ProgramData[K][F],
                },
            };
        });
    }

    /** Remove an element by index from any array field */
    function removeArrayItem<
        K extends keyof ProgramData,
        F extends ArrayKeys<K>
    >(
        section: K,
        field: F,
        index: number
    ) {
        setProgramData((prev) => {
            type E = ElementOf<ProgramData[K][F]>;
            const arr = prev[section][field] as unknown as E[];
            const newArr = arr.filter((_item: E, i: number) => i !== index);
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: newArr as ProgramData[K][F],
                },
            };
        });
    }

    // const updateData = (section: keyof ProgramData, field: string, value: any) => {
    //   setProgramData(prev => ({
    //     ...prev,
    //     [section]: {
    //       ...prev[section],
    //       [field]: value
    //     }
    //   }));
    // };
    //
    // const addArrayItem = (section: keyof ProgramData, field: string) => {
    //   setProgramData(prev => ({
    //     ...prev,
    //     [section]: {
    //       ...prev[section],
    //       [field]: [...(prev[section] as any)[field], '']
    //     }
    //   }));
    // };
    //
    // const updateArrayItem = (section: keyof ProgramData, field: string, index: number, value: string) => {
    //   setProgramData(prev => ({
    //     ...prev,
    //     [section]: {
    //       ...prev[section],
    //       [field]: (prev[section] as any)[field].map((item: string, i: number) => i === index ? value : item)
    //     }
    //   }));
    // };
    //
    // const removeArrayItem = (section: keyof ProgramData, field: string, index: number) => {
    //   setProgramData(prev => ({
    //     ...prev,
    //     [section]: {
    //       ...prev[section],
    //       [field]: (prev[section] as any)[field].filter((_: any, i: number) => i !== index)
    //     }
    //   }));
    // };

    const validateStep = (stepIndex: number) => {
        switch (stepIndex) {
            case 0:
                return programData.basic.title && programData.basic.description && programData.basic.category && programData.basic.level;
            case 1:
                return programData.details.duration && programData.details.price >= 0 && programData.details.instructor;
            case 2:
                return programData.curriculum.modules.filter(m => m.trim()).length > 0 &&
                    programData.curriculum.learningOutcomes.filter(o => o.trim()).length > 0;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1 && validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Program created:', programData);

        setIsSubmitting(false);
        router.push('/admin');
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <DashboardLayout>
            <div className="">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-blue-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" className="text-blue-700 hover:bg-blue-50">
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Back to Admin
                                </Button>
                            </Link>
                            <div className="text-right">
                                <h1 className="text-xl font-bold text-blue-900">Create New Program</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Progress */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">New Program Setup</h2>
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                Step {currentStep + 1} of {steps.length}
                            </Badge>
                        </div>
                        <Progress value={progress} className="h-2 mb-4"/>

                        {/* Step Navigation */}
                        <div className="flex items-center space-x-4">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                            index < currentStep
                                                ? 'bg-green-600 text-white'
                                                : index === currentStep
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="ml-2">
                                        <p className={`text-sm font-medium ${
                                            index === currentStep ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-gray-400">{step.description}</p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <ArrowRight className="w-4 h-4 text-gray-300 ml-4"/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="space-y-6">
                        {currentStep === 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-blue-600"/>
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Provide the essential details about your program
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Program Title *</Label>
                                            <Input
                                                id="title"
                                                value={programData.basic.title}
                                                onChange={(e) => updateData('basic', 'title', e.target.value)}
                                                placeholder="e.g., Creative Toy Making Workshop"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select value={programData.basic.category}
                                                    onValueChange={(value) => updateData('basic', 'category', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Short Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={programData.basic.description}
                                            onChange={(e) => updateData('basic', 'description', e.target.value)}
                                            placeholder="Brief description for program cards"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="longDescription">Detailed Description</Label>
                                        <Textarea
                                            id="longDescription"
                                            value={programData.basic.longDescription}
                                            onChange={(e) => updateData('basic', 'longDescription', e.target.value)}
                                            placeholder="Comprehensive description for the program page"
                                            rows={5}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="level">Skill Level *</Label>
                                            <Select value={programData.basic.level}
                                                    onValueChange={(value) => updateData('basic', 'level', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {levels.map((level) => (
                                                        <SelectItem key={level} value={level}>
                                                            {level}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                                            <Input
                                                id="thumbnail"
                                                value={programData.basic.thumbnail}
                                                onChange={(e) => updateData('basic', 'thumbnail', e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="video">Preview Video URL</Label>
                                        <Input
                                            id="video"
                                            value={programData.basic.video}
                                            onChange={(e) => updateData('basic', 'video', e.target.value)}
                                            placeholder="https://example.com/video.mp4"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-blue-600"/>
                                        Program Details
                                    </CardTitle>
                                    <CardDescription>
                                        Configure pricing, duration, and scheduling
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration *</Label>
                                            <Input
                                                id="duration"
                                                value={programData.details.duration}
                                                onChange={(e) => updateData('details', 'duration', e.target.value)}
                                                placeholder="e.g., 8 weeks"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price ($) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={programData.details.price}
                                                onChange={(e) => updateData('details', 'price', parseFloat(e.target.value) || 0)}
                                                placeholder="299"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maxParticipants">Max Participants</Label>
                                            <Input
                                                id="maxParticipants"
                                                type="number"
                                                value={programData.details.maxParticipants}
                                                onChange={(e) => updateData('details', 'maxParticipants', parseInt(e.target.value) || 0)}
                                                placeholder="50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instructor">Instructor Name *</Label>
                                        <Input
                                            id="instructor"
                                            value={programData.details.instructor}
                                            onChange={(e) => updateData('details', 'instructor', e.target.value)}
                                            placeholder="e.g., Sarah Johnson"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={programData.details.startDate}
                                                onChange={(e) => updateData('details', 'startDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="endDate">End Date</Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={programData.details.endDate}
                                                onChange={(e) => updateData('details', 'endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="featured"
                                            checked={programData.details.featured}
                                            // onCheckedChange={(checked) => updateData('details', 'featured', checked)}
                                            onCheckedChange={(checked) =>
                                                updateData('details', 'featured', checked === true)
                                            }

                                        />
                                        <Label htmlFor="featured">Featured Program</Label>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Curriculum Modules</CardTitle>
                                        <CardDescription>
                                            Define the modules and topics covered in your program
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {programData.curriculum.modules.map((module, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <Input
                                                            value={module}
                                                            onChange={(e) => updateArrayItem('curriculum', 'modules', index, e.target.value)}
                                                            placeholder={`Module ${index + 1}`}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeArrayItem('curriculum', 'modules', index)}
                                                        disabled={programData.curriculum.modules.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                onClick={() => addArrayItem('curriculum', 'modules')}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2"/>
                                                Add Module
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Learning Outcomes</CardTitle>
                                        <CardDescription>
                                            What will students be able to do after completing this program?
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {programData.curriculum.learningOutcomes.map((outcome, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <Input
                                                            value={outcome}
                                                            onChange={(e) => updateArrayItem('curriculum', 'learningOutcomes', index, e.target.value)}
                                                            placeholder={`Learning outcome ${index + 1}`}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeArrayItem('curriculum', 'learningOutcomes', index)}
                                                        disabled={programData.curriculum.learningOutcomes.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                onClick={() => addArrayItem('curriculum', 'learningOutcomes')}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2"/>
                                                Add Learning Outcome
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Requirements</CardTitle>
                                        <CardDescription>
                                            Prerequisites and requirements for this program
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {programData.curriculum.requirements.map((requirement, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <Input
                                                            value={requirement}
                                                            onChange={(e) => updateArrayItem('curriculum', 'requirements', index, e.target.value)}
                                                            placeholder={`Requirement ${index + 1}`}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeArrayItem('curriculum', 'requirements', index)}
                                                        disabled={programData.curriculum.requirements.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                onClick={() => addArrayItem('curriculum', 'requirements')}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2"/>
                                                Add Requirement
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2"/>
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Save className="w-4 h-4 mr-2"/>
                                Save Draft
                            </Button>

                            {currentStep < steps.length - 1 ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!validateStep(currentStep)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!validateStep(currentStep) || isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Program'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>

    );
}