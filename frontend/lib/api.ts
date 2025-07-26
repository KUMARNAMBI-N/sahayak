import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = async () => {
  if (typeof window !== 'undefined' && auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
  return null;
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// Generate Story APIs
export const generateStoryAPI = {
  create: (data: { title: string; content: string; userId: string }) =>
    apiCall('/generate-story', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAll: () => apiCall('/generate-story'),
  
  getById: (id: string) => apiCall(`/generate-story/${id}`),
  
  update: (id: string, data: { title: string; content: string }) =>
    apiCall(`/generate-story/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/generate-story/${id}`, {
      method: 'DELETE',
    }),
};

// Multigrade Worksheet APIs
export const multigradeWorksheetAPI = {
  create: (data: { title: string; worksheetData: any; userId?: string }) =>
    apiCall('/multigrade-worksheet', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAll: () => apiCall('/multigrade-worksheet'),
  
  getById: (id: string) => apiCall(`/multigrade-worksheet/${id}`),
  
  update: (id: string, data: { title: string; worksheetData: any }) =>
    apiCall(`/multigrade-worksheet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/multigrade-worksheet/${id}`, {
      method: 'DELETE',
    }),
};

// Lesson Planner APIs
export const lessonPlannerAPI = {
  create: (data: { title: string; plan: any; userId?: string }) =>
    apiCall('/lesson-planner', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAll: () => apiCall('/lesson-planner'),
  
  getById: (id: string) => apiCall(`/lesson-planner/${id}`),
  
  update: (id: string, data: { title: string; plan: any }) =>
    apiCall(`/lesson-planner/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/lesson-planner/${id}`, {
      method: 'DELETE',
    }),
};

// Visual Aid APIs
export const visualAidAPI = {
  create: (data: { title: string; aidData: any; userId?: string }) =>
    apiCall('/visual-aid', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAll: () => apiCall('/visual-aid'),
  
  getById: (id: string) => apiCall(`/visual-aid/${id}`),
  
  update: (id: string, data: { title: string; aidData: any }) =>
    apiCall(`/visual-aid/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/visual-aid/${id}`, {
      method: 'DELETE',
    }),
};

// Reading Assessment APIs
export const readingAssessmentAPI = {
  create: (data: { title: string; assessmentData: any; userId?: string }) =>
    apiCall('/reading-assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAll: () => apiCall('/reading-assessment'),
  
  getById: (id: string) => apiCall(`/reading-assessment/${id}`),
  
  update: (id: string, data: { title: string; assessmentData: any }) =>
    apiCall(`/reading-assessment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/reading-assessment/${id}`, {
      method: 'DELETE',
    }),
};

// Combined history API to get all items
export const historyAPI = {
  getAllItems: async () => {
    try {
      // Fetch unified history from backend - user ID comes from auth token
      const items = await apiCall('/library/history');
      return items;
    } catch (error) {
      console.error('Error fetching all items:', error);
      return [];
    }
  },
}; 