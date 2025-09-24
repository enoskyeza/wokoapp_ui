'use client';

import {useState, useEffect} from 'react';
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
import { toast } from 'sonner';
import {programTypeService, ProgramType} from '@/services/programTypeService';
import {programService, CreateProgramRequest} from '@/services/programService';

interface ProgramData {
    basic: {
        title: string;
        description: string;
        longDescription: string;
        category: string; // selected type name
        categoryLabel: string; // registration category label used on registration form
        categoryOptions: string[]; // options for registration category
        level: string;
        thumbnail: string;
        video: string;
        year: number;
    };
    details: {
        price: number;
        maxParticipants: number;
        instructor: string;
        startDate: string;
        endDate: string;
        featured: boolean;
        ageMin: number;
        ageMax: number;
        requiresTicket: boolean;
        active: boolean;
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
        categoryLabel: '',
        categoryOptions: [''],
        level: '',
        thumbnail: '',
        video: '',
        year: new Date().getFullYear()
    },
    details: {
        price: 0,
        maxParticipants: 0,
        instructor: '',
        startDate: '',
        endDate: '',
        featured: false,
        ageMin: 0,
        ageMax: 0,
        requiresTicket: false,
        active: true
    },
    curriculum: {
        modules: [''],
        learningOutcomes: [''],
        requirements: ['']
    }
};

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateProgram() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [programData, setProgramData] = useState<ProgramData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [customCategories] = useState<string[]>([]);
    const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch program types on component mount
    useEffect(() => {
        const fetchProgramTypes = async () => {
            setLoadingCategories(true);
            const types = await programTypeService.getAllProgramTypes();
            setProgramTypes(types);
            setLoadingCategories(false);
        };
        
        fetchProgramTypes();
    }, []);

    const steps = [
        {id: 'basic', title: 'Basic Information', description: 'Program title, type, registration category, and media'},
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
                return programData.details.price >= 0 && programData.details.instructor;
            case 2:
                return programData.curriculum.requirements.filter(r => r.trim()).length > 0;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            if (validateStep(currentStep)) {
                setCurrentStep(currentStep + 1);
            } else {
                toast.error('Please complete all required fields', {
                    description: 'Fill in all required information before proceeding to the next step.'
                });
            }
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

        try {
            // Find the program type ID by name
                const selectedProgramType = programTypes.find(type => type.name === programData.basic.category);
            
            // Transform form data to match backend API
                const createRequest: CreateProgramRequest = {
                    name: programData.basic.title,
                    description: programData.basic.description,
                    long_description: programData.basic.longDescription,
                    year: programData.basic.year,
                    level: programData.basic.level.toLowerCase(),
                    thumbnail_url: programData.basic.thumbnail,
                    video_url: programData.basic.video,
                    category_label: programData.basic.categoryLabel || undefined,
                    category_options: programData.basic.categoryOptions.filter(o => o.trim()),
                    registration_fee: programData.details.price,
                    capacity: programData.details.maxParticipants > 0 ? programData.details.maxParticipants : null,
                    instructor: programData.details.instructor,
                    start_date: programData.details.startDate,
                    end_date: programData.details.endDate,
                    featured: programData.details.featured,
                    age_min: programData.details.ageMin > 0 ? programData.details.ageMin : null,
                    age_max: programData.details.ageMax > 0 ? programData.details.ageMax : null,
                    requires_ticket: programData.details.requiresTicket,
                    active: programData.details.active,
                    modules: programData.curriculum.modules.filter(m => m.trim()),
                    learning_outcomes: programData.curriculum.learningOutcomes.filter(o => o.trim()),
                    requirements: programData.curriculum.requirements.filter(r => r.trim()),
                    type_id: selectedProgramType?.id
                };

            const result = await programService.createProgram(createRequest);
            
            if (result) {
                console.log('Program created successfully:', result);
                toast.success('Program created successfully!', {
                    description: `"${result.name}" has been added to your programs.`
                });
                router.push('/dashboard');
            } else {
                throw new Error('Failed to create program');
            }
        } catch (error) {
            console.error('Error creating program:', error);
            toast.error('Failed to create program', {
                description: 'Please check your inputs and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSavingDraft(true);

        // Save to localStorage as draft
        const draftKey = `program_draft_${Date.now()}`;
        localStorage.setItem(draftKey, JSON.stringify({
            ...programData,
            savedAt: new Date().toISOString(),
            currentStep
        }));

        // Simulate API call for saving draft
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Draft saved:', programData);
        
        setIsSavingDraft(false);
        
        toast.success('Draft saved successfully!', {
            description: 'Your progress has been saved and you can continue later.'
        });
    };

    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Category name required', {
                description: 'Please enter a category name.'
            });
            return;
        }
        
        if (allCategories.map(c => c.name).includes(newCategoryName.trim())) {
            toast.error('Category already exists', {
                description: 'This category is already available in the dropdown.'
            });
            return;
        }
        
        if (newCategoryName.trim()) {
            try {
                const newProgramType = await programTypeService.createProgramType(newCategoryName.trim());
                if (newProgramType) {
                    setProgramTypes(prev => [...prev, newProgramType]);
                    updateData('basic', 'category', newProgramType.name);
                    setNewCategoryName('');
                    setShowNewCategoryDialog(false);
                    toast.success('Category added successfully!', {
                        description: `"${newProgramType.name}" is now available in the dropdown.`
                    });
                }
            } catch (error) {
                console.error('Failed to create category:', error);
                toast.error('Failed to create category', {
                    description: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        }
    };

    // Combine backend program types and custom categories
    const allCategories = [...programTypes, ...customCategories.map(name => ({ id: -1, name, description: '', form_key: '' }))];

    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <DashboardLayout>
            <div className="">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-blue-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" className="text-theme-primary text-white hover:bg-blue-50">
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                            <Label htmlFor="category">Type *</Label>
                                            <div className="flex gap-2">
                                                <Select value={programData.basic.category}
                                                        onValueChange={(value) => updateData('basic', 'category', value)}
                                                        disabled={loadingCategories}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingCategories ? "Loading types..." : "Select type"}/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allCategories.map((category) => (
                                                            <SelectItem key={`${category.id}-${category.name}`} value={category.name}>
                                                                <span>
                                                                    {category.name}
                                                                    {category.id === -1 && (
                                                                        <span className="ml-2 text-xs text-blue-600">(Custom)</span>
                                                                    )}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button 
                                                    type="button"
                                                    variant="outline" 
                                                    size="sm"
                                                    className="px-3"
                                                    title="Add New Type"
                                                    onClick={() => setShowNewCategoryDialog(true)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>

                                        </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="year">Program Year</Label>
                                                <Input
                                                    id="year"
                                                    type="number"
                                                    value={programData.basic.year}
                                                    onChange={(e) => updateData('basic', 'year', parseInt(e.target.value) || new Date().getFullYear())}
                                                    placeholder="2024"
                                                />
                                            </div>

                                        <div className="space-y-2 md:col-span-1">
                                            <Label htmlFor="catLabel">Registration Category Label</Label>
                                            <Input
                                              id="catLabel"
                                              value={programData.basic.categoryLabel}
                                              onChange={(e) => updateData('basic', 'categoryLabel', e.target.value)}
                                              placeholder="e.g., Age Category, School level."
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Registration Category Options</Label>
                                            {/* render as dynamic list similar to curriculum arrays */}
                                            <div className="space-y-2">
                                              {programData.basic.categoryOptions.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                  <Input
                                                    value={opt}
                                                    onChange={(e) => updateArrayItem('basic', 'categoryOptions', idx, e.target.value)}
                                                    placeholder={idx === 0 ? 'e.g., 3-5 Years, Secondary, University' : 'Option'}
                                                  />
                                                  <Button type="button" variant="outline" onClick={() => removeArrayItem('basic', 'categoryOptions', idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              ))}
                                              <Button type="button" variant="secondary" onClick={() => addArrayItem('basic', 'categoryOptions')}>
                                                <Plus className="w-4 h-4 mr-1" /> Add Option
                                              </Button>
                                            </div>
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
                                                placeholder="https://drive.google.com/file/d/FILE_ID/view"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="video">Preview Video URL</Label>
                                        <Input
                                            id="video"
                                            value={programData.basic.video}
                                            onChange={(e) => updateData('basic', 'video', e.target.value)}
                                            placeholder="https://drive.google.com/file/d/FILE_ID/view"
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-700">
                                            💡 <strong>Google Drive Integration:</strong> Upload your media files to Google Drive, make them public, and copy the shareable links for both thumbnail and video URLs.
                                        </p>
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
                                        Configure pricing, capacity, and scheduling
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (UGX) *</Label>
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

                                    {/* Age Requirements */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="ageMin">Minimum Age</Label>
                                            <Input
                                                id="ageMin"
                                                type="number"
                                                value={programData.details.ageMin || ''}
                                                onChange={(e) => updateData('details', 'ageMin', parseInt(e.target.value) || 0)}
                                                placeholder="e.g., 16"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="ageMax">Maximum Age</Label>
                                            <Input
                                                id="ageMax"
                                                type="number"
                                                value={programData.details.ageMax || ''}
                                                onChange={(e) => updateData('details', 'ageMax', parseInt(e.target.value) || 0)}
                                                placeholder="e.g., 25"
                                            />
                                        </div>
                                    </div>

                                    {/* Program Options */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="featured"
                                                checked={programData.details.featured}
                                                onCheckedChange={(checked) =>
                                                    updateData('details', 'featured', checked === true)
                                                }
                                            />
                                            <Label htmlFor="featured">Featured Program</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="requiresTicket"
                                                checked={programData.details.requiresTicket}
                                                onCheckedChange={(checked) =>
                                                    updateData('details', 'requiresTicket', checked === true)
                                                }
                                            />
                                            <Label htmlFor="requiresTicket">Requires Ticket</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="active"
                                                checked={programData.details.active}
                                                onCheckedChange={(checked) =>
                                                    updateData('details', 'active', checked === true)
                                                }
                                            />
                                            <Label htmlFor="active">Program Active</Label>
                                        </div>
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
                                        <CardTitle>Requirements *</CardTitle>
                                        <CardDescription>
                                            Prerequisites and requirements for this program (required)
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
                            <Button 
                                variant="outline" 
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={handleSaveDraft}
                                disabled={isSavingDraft}
                            >
                                <Save className="w-4 h-4 mr-2"/>
                                {isSavingDraft ? 'Saving...' : 'Save Draft'}
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

            {/* Add New Category Dialog */}
            {showNewCategoryDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="newCategory">Category Name</Label>
                                <Input
                                    id="newCategory"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g., Digital Marketing"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddNewCategory();
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowNewCategoryDialog(false);
                                        setNewCategoryName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddNewCategory}
                                    disabled={!newCategoryName.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>

    );
}