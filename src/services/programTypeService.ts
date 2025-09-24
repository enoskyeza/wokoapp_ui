enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

export interface ProgramType {
  id: number;
  name: string;
  description: string;
  form_key: string;
}

export const programTypeService = {
  async getAllProgramTypes(): Promise<ProgramType[]> {
    try {
      const response = await fetch(`${API_BASE}/program-types/`);
      if (!response.ok) {
        console.error(`Failed to fetch program types: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch program types: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.results || []); // Handle both paginated and non-paginated responses
    } catch (error) {
      console.error('Error fetching program types:', error);
      // Return empty array on error so the form still works
      return [];
    }
  },

  async createProgramType(name: string, description: string = ''): Promise<ProgramType | null> {
    try {
      const response = await fetch(`${API_BASE}/program-types/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          form_key: name.toLowerCase().replace(/\s+/g, '_')
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Failed to create program type: ${response.status} ${response.statusText}`, errorData);
        throw new Error(`Failed to create program type: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating program type:', error);
      throw error; // Re-throw to let the calling code handle it
    }
  }
};
