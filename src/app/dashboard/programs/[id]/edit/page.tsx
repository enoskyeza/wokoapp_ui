'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle,
  Plus,
  Calendar,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import DashboardLayout from '@/components/Layouts/Dashboard';
import FormPreview from '@/components/Forms/FormPreview';
import { programService } from '@/services/programService';
import { programFormService } from '@/services/programFormService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Program {
  id: number;
  name: string;
  description: string;
  long_description: string;
  year: number;
  level: string;
  thumbnail_url: string;
  video_url: string;
  registration_fee: number;
  capacity: number;
  instructor: string;
  start_date: string;
  end_date: string;
  featured: boolean;
  age_min: number;
  age_max: number;
  requires_ticket: boolean;
  active: boolean;
  modules: string[];
  learning_outcomes: string[];
  requirements: string[];
  type: {
    id: number;
    name: string;
    description: string;
    form_key: string;
  } | null;
  enrollments?: number; // From dashboard stats
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

interface ProgramForm {
  id: string;
  name: string;
  description?: string;
  fields: number;
  submissions: number;
  isActive: boolean;
  createdAt: string;
  steps?: FormStep[]; // For preview functionality
}

export default function ProgramEditPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [forms, setForms] = useState<ProgramForm[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [programTypes, setProgramTypes] = useState<{id: number; name: string; description: string}[]>([]);
  
  // Form preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewForm, setPreviewForm] = useState<ProgramForm | null>(null);

  // Form state - aligned with backend Program model
  const [formData, setFormData] = useState({
    // Basic fields
    name: '',
    description: '',
    long_description: '',
    level: 'beginner',
    year: new Date().getFullYear(),
    type_id: null as number | null,
    
    // Media fields
    thumbnail_url: '',
    video_url: '',
    
    // Schedule & pricing
    start_date: '',
    end_date: '',
    registration_fee: 0,
    capacity: null as number | null,
    instructor: '',
    
    // Flags
    featured: false,
    requires_ticket: false,
    active: true,
    age_min: null as number | null,
    age_max: null as number | null,
    
    // Curriculum arrays
    modules: [] as string[],
    learning_outcomes: [] as string[],
    requirements: [] as string[]
  });

  const loadProgramData = useCallback(async () => {
    setLoading(true);
    try {
      // Load program details and program types in parallel
      const [programData, programTypesResponse, formsData] = await Promise.all([
        programService.getProgramById(programId),
        fetch(`${process.env.NODE_ENV === 'production' ? 'https://kyeza.pythonanywhere.com' : 'http://127.0.0.1:8000'}/register/program-types/`),
        programFormService.getProgramForms(programId)
      ]);

      if (!programData) {
        toast.error('Program not found');
        return;
      }

      // Parse program types
      let types = [];
      if (programTypesResponse.ok) {
        const typesData = await programTypesResponse.json();
        types = typesData.results || typesData;
      }
      
      setProgram(programData);
      setForms(formsData);
      setProgramTypes(types);
      setFormData({
        // Basic fields
        name: programData.name,
        description: programData.description,
        long_description: programData.long_description,
        level: programData.level,
        year: programData.year,
        type_id: programData.type?.id || null,
        
        // Media fields
        thumbnail_url: programData.thumbnail_url,
        video_url: programData.video_url,
        
        // Schedule & pricing
        start_date: programData.start_date,
        end_date: programData.end_date,
        registration_fee: parseFloat(programData.registration_fee.toString()),
        capacity: programData.capacity,
        instructor: programData.instructor,
        
        // Flags
        featured: programData.featured,
        requires_ticket: programData.requires_ticket,
        active: programData.active,
        age_min: programData.age_min,
        age_max: programData.age_max,
        
        // Curriculum arrays
        modules: programData.modules || [],
        learning_outcomes: programData.learning_outcomes || [],
        requirements: programData.requirements || []
      });
      
    } catch (error) {
      console.error('Error loading program data:', error);
      toast.error('Failed to load program data');
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    if (programId) {
      loadProgramData();
    }
  }, [programId, loadProgramData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert formData to match backend expectations
      const payload = {
        ...formData,
        type_id: formData.type_id || undefined // Convert null to undefined for backend
      };
      
      const updatedProgram = await programService.updateProgram(programId, payload);
      if (updatedProgram) {
        setProgram(updatedProgram);
        toast.success('Program updated successfully');
      } else {
        toast.error('Failed to update program');
      }
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'active' || field === 'featured' || field === 'requires_ticket' 
        ? value === 'true' || value === true
        : field === 'year' || field === 'registration_fee' || field === 'capacity' || field === 'age_min' || field === 'age_max'
        ? value === '' ? null : Number(value)
        : value
    }));
  };

  const handlePreviewForm = (form: ProgramForm) => {
    setPreviewForm(form);
    setShowPreview(true);
  };

  const handleSetActiveForm = async (formId: string) => {
    try {
      const success = await programFormService.setActiveForm(programId, formId);
      if (success) {
        setForms(prev => prev.map(form => ({
          ...form,
          isActive: form.id === formId
        })));
        toast.success('Form set as active');
      } else {
        toast.error('Failed to set form as active');
      }
    } catch (error) {
      console.error('Error setting active form:', error);
      toast.error('Failed to set form as active');
    }
  };

  const handleInactivateForm = async (formId: string) => {
    try {
      const success = await programFormService.inactivateForm(programId, formId);
      if (success) {
        setForms(prev => prev.map(form => (
          form.id === formId ? { ...form, isActive: false } : form
        )));
        toast.success('Form inactivated');
      } else {
        toast.error('Failed to inactivate form');
      }
    } catch (error) {
      console.error('Error inactivating form:', error);
      toast.error('Failed to inactivate form');
    }
  };

  const handleEditForm = (formId: string) => {
    // Navigate to form edit page
    router.push(`/dashboard/forms/${formId}/edit`);
  };

  const handleDeleteForm = async (formId: string, formName: string) => {
    try {
      const success = await programFormService.deleteForm(formId);
      if (success) {
        setForms(prev => prev.filter(form => form.id !== formId));
        toast.success('Form deleted', {
          description: `"${formName}" has been removed`
        });
      } else {
        toast.error('Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading program...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!program) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Program not found</p>
          <Link href="/dashboard">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Mobile-responsive Header */}
        <div className="space-y-4 md:space-y-0">
          {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Back button - full width on mobile, inline on desktop */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
              <Link href="/dashboard" className="w-full md:w-auto">
                <Button variant="outline" size="sm" className="w-full md:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              
              {/* Title section - center on mobile */}
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">Edit Program</h1>
                <p className="text-gray-600">Manage program details and forms</p>
              </div>
            </div>
            
            {/* Action buttons - full width on mobile, inline on desktop */}
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <Badge className={program.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {program.active ? 'Active' : 'Inactive'}
              </Badge>
              <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              <Settings className="w-4 h-4 mr-2" />
              Program Details
            </TabsTrigger>
            <TabsTrigger value="forms">
              <FileText className="w-4 h-4 mr-2" />
              Forms Management
            </TabsTrigger>
          </TabsList>

          {/* Program Details Tab */}
          <TabsContent value="details" className="mt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Core program details and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Program Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter program name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="level">Level *</Label>
                      <select
                        id="level"
                        value={formData.level}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        placeholder="2025"
                        min="2020"
                        max="2030"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      <Input
                        id="instructor"
                        value={formData.instructor}
                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                        placeholder="Enter instructor name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type_id">Program Category *</Label>
                      <select
                        id="type_id"
                        value={formData.type_id || ''}
                        onChange={(e) => handleInputChange('type_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a category...</option>
                        {programTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {programTypes.length === 0 && (
                        <p className="text-sm text-gray-500">Loading categories...</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief program description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long_description">Detailed Description</Label>
                    <Textarea
                      id="long_description"
                      value={formData.long_description}
                      onChange={(e) => handleInputChange('long_description', e.target.value)}
                      placeholder="Comprehensive program description"
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Media & Assets */}
              <Card>
                <CardHeader>
                  <CardTitle>Media & Assets</CardTitle>
                  <CardDescription>
                    Program images and videos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail_url">Thumbnail Image URL</Label>
                    <Input
                      id="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    <p className="text-sm text-gray-500">
                      Upload to Google Drive, make public, and copy the shareable link
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video_url">Program Video URL</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => handleInputChange('video_url', e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    <p className="text-sm text-gray-500">
                      Upload to Google Drive, make public, and copy the shareable link
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Pricing</CardTitle>
                  <CardDescription>
                    Program dates, pricing, and capacity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_fee">Registration Fee (UGX) *</Label>
                      <Input
                        id="registration_fee"
                        type="number"
                        value={formData.registration_fee}
                        onChange={(e) => handleInputChange('registration_fee', e.target.value)}
                        placeholder="20000"
                        min="0"
                        step="1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Maximum Participants</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) => handleInputChange('capacity', e.target.value)}
                        placeholder="50"
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age_min">Minimum Age</Label>
                      <Input
                        id="age_min"
                        type="number"
                        value={formData.age_min || ''}
                        onChange={(e) => handleInputChange('age_min', e.target.value)}
                        placeholder="5"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age_max">Maximum Age</Label>
                      <Input
                        id="age_max"
                        type="number"
                        value={formData.age_max || ''}
                        onChange={(e) => handleInputChange('age_max', e.target.value)}
                        placeholder="18"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Program Settings</CardTitle>
                  <CardDescription>
                    Program status and requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => handleInputChange('active', e.target.checked.toString())}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="active">Program is Active</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked.toString())}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="featured">Featured Program</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requires_ticket"
                        checked={formData.requires_ticket}
                        onChange={(e) => handleInputChange('requires_ticket', e.target.checked.toString())}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="requires_ticket">Requires Ticket</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Program Statistics</CardTitle>
                  <CardDescription>
                    Current program metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-600">Enrollments</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{program.enrollments || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600">Forms</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{forms.length}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-purple-600">Category</span>
                      </div>
                      <p className="text-sm font-medium text-purple-900">{program.type?.name || 'General'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forms Management Tab */}
          <TabsContent value="forms" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Program Forms</CardTitle>
                    <CardDescription>
                      Manage registration forms for this program
                    </CardDescription>
                  </div>
                  <Link href={`/dashboard/forms/create?programId=${programId}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Form
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {forms.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
                    <p className="text-gray-600 mb-4">Create your first registration form for this program</p>
                    <Link href={`/dashboard/forms/create?programId=${programId}`}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Form
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {forms.map((form) => (
                      <div key={form.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">{form.name}</h3>
                              </div>
                              {form.isActive && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active Form
                                </Badge>
                              )}
                            </div>
                            {form.description && (
                              <p className="text-sm text-gray-600 mb-3">{form.description}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">{typeof form.fields === 'number' ? form.fields : 0} fields</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-600">{typeof form.submissions === 'number' ? form.submissions : 0} submissions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-gray-600">Created {formatDate(form.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span className="text-gray-600">{form.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePreviewForm(form)}
                                className="flex-1 sm:flex-none"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditForm(form.id)}
                                className="flex-1 sm:flex-none"
                              >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!form.isActive ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-green-600 hover:text-green-700 flex-1 sm:flex-none"
                                  onClick={() => handleSetActiveForm(form.id)}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Set Active
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-orange-600 hover:text-orange-700 flex-1 sm:flex-none"
                                  onClick={() => handleInactivateForm(form.id)}
                                >
                                  Inactivate
                                </Button>
                              )}
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Form</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{form.name}&quot;? 
                                      This will also remove all associated form responses. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteForm(form.id, form.name)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Preview Modal */}
      {previewForm && (
        <FormPreview
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewForm(null);
          }}
          formName={previewForm.name}
          formDescription={previewForm.description}
          steps={previewForm.steps || []}
        />
      )}
    </DashboardLayout>
  );
}
