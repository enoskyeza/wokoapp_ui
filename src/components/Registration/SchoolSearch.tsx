'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Building2, X } from 'lucide-react';
import { toast } from 'sonner';
import { registrationService, type School } from '@/services/registrationService';

interface SchoolSearchProps {
  value: {
    id?: number;
    name?: string;
    address?: string;
    phone_number?: string;
  };
  onChange: (school: {
    id?: number;
    name?: string;
    address?: string;
    phone_number?: string;
  }) => void;
}

export function SchoolSearch({ value, onChange }: SchoolSearchProps) {
  const [query, setQuery] = useState(value.name || '');
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: '',
  });
  const [addingSchool, setAddingSchool] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchSchools(query);
      }, 300);
    } else {
      setSchools([]);
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowAddForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSchools = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await registrationService.searchSchools(searchQuery);
      setSchools(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching schools:', error);
      toast.error('Failed to search schools');
    } finally {
      setLoading(false);
    }
  };

  const selectSchool = (school: School) => {
    setQuery(school.name);
    onChange({
      id: school.id,
      name: school.name,
      address: school.address,
      phone_number: school.phone_number,
    });
    setShowResults(false);
  };

  const handleAddNewSchool = () => {
    setNewSchool({ ...newSchool, name: query });
    setShowAddForm(true);
    setShowResults(false);
  };

  const submitNewSchool = async () => {
    if (!newSchool.name.trim()) {
      toast.error('School name is required');
      return;
    }

    setAddingSchool(true);
    try {
      const createdSchool = await registrationService.createSchool(newSchool);
      
      // Select the newly created school
      selectSchool(createdSchool);
      
      // Reset form
      setNewSchool({ name: '', address: '', phone_number: '', email: '' });
      setShowAddForm(false);
      
      toast.success('School added successfully!');
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to add school');
    } finally {
      setAddingSchool(false);
    }
  };

  const clearSelection = () => {
    setQuery('');
    onChange({ 
      name: '',
      address: '',
      phone_number: '',
    });
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a school..."
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={clearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {schools.length > 0 ? (
            <>
              {schools.map((school) => (
                <div
                  key={school.id}
                  onClick={() => selectSchool(school)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-left"
                >
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-left">{school.name}</p>
                      {school.address && (
                        <p className="text-sm text-gray-500 truncate text-left">{school.address}</p>
                      )}
                      {school.phone_number && (
                        <p className="text-sm text-gray-500 text-left">{school.phone_number}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-3">
              <p className="text-gray-500 text-center mb-3">No schools found</p>
              <button
                onClick={handleAddNewSchool}
                className="w-full p-2 text-center hover:bg-gray-50 flex items-center justify-center gap-2 text-blue-600 rounded"
              >
                <Plus className="w-4 h-4" />
                Add &ldquo;{query}&rdquo; as new school
              </button>
            </div>
          )}
        </div>
      )}

      {!value.id && !showAddForm && query.trim().length >= 2 && (
        <div className="mt-2 text-sm text-gray-600">
          Can&apos;t find your school?
          <button
            type="button"
            onClick={handleAddNewSchool}
            className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            Click here to add it.
          </button>
        </div>
      )}

      {/* Add New School Form */}
      {showAddForm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Add New School</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">
                  School Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  placeholder="Enter school name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">Address</Label>
                <Input
                  value={newSchool.address}
                  onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  placeholder="Enter school address"
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">Phone Number</Label>
                <Input
                  value={newSchool.phone_number}
                  onChange={(e) => setNewSchool({ ...newSchool, phone_number: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">Email</Label>
                <Input
                  type="email"
                  value={newSchool.email}
                  onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={submitNewSchool}
                  disabled={addingSchool}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {addingSchool ? 'Adding...' : 'Add School'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
