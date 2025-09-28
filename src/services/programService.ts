enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

export interface CreateProgramRequest {
  // Basic fields
  name: string;
  description: string;
  long_description: string;
  year: number;
  level: string;
  thumbnail_url: string;
  video_url: string;
  // Registration category metadata
  category_label?: string;
  category_options?: string[];
  
  // Details fields
  registration_fee: number;
  capacity: number | null;
  instructor: string;
  start_date: string;
  end_date: string;
  featured: boolean;
  age_min: number | null;
  age_max: number | null;
  requires_ticket: boolean;
  active: boolean;
  
  // Curriculum fields (JSON)
  modules: string[];
  learning_outcomes: string[];
  requirements: string[];
  
  // Foreign key - we'll need to find the ProgramType ID by name
  type_id?: number;
}

export interface Program {
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
  category_label?: string;
  category_options?: string[];
  type: {
    id: number;
    name: string;
    description: string;
    form_key: string;
  } | null;
}

export const programService = {
  async createProgram(programData: CreateProgramRequest): Promise<Program | null> {
    try {
      const response = await fetch(`${API_BASE}/programs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to create program: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Program creation failed:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If we can't parse JSON, it might be an HTML error page
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error (${response.status}). Please check the server logs.`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating program:', error);
      return null;
    }
  },

  async getAllPrograms(): Promise<Program[]> {
    try {
      const response = await fetch(`${API_BASE}/programs/`);
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
  }
  ,
  async getDashboardStats(): Promise<{
    programs: { id?: string; title: string; status?: string; enrollments: number }[];
  } | null> {
    try {
      const response = await fetch(`${API_BASE}/programs/dashboard-stats/`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  },

  async getProgramById(id: string): Promise<Program | null> {
    try {
      const response = await fetch(`${API_BASE}/programs/${id}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch program: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching program:', error);
      return null;
    }
  },

  async updateProgram(id: string, programData: Partial<CreateProgramRequest>): Promise<Program | null> {
    try {
      const response = await fetch(`${API_BASE}/programs/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to update program: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Program update failed:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error (${response.status}). Please check the server logs.`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating program:', error);
      return null;
    }
  },

  async deleteProgram(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/programs/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete program: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting program:', error);
      return false;
    }
  }
};
