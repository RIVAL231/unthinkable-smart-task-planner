import axios from 'axios';

const API_BASE_URL = "https://smart-task-planner-kappa.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes for LLM processing
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  deadline: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
  order_index?: number;
}

export interface TaskPlan {
  goalId: string;
  goalText: string;
  analysis: string;
  totalEstimatedTime: string;
  tasks: Task[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  goal_text: string;
  created_at: string;
  updated_at: string;
}

export const plannerAPI = {
  // Generate a new task plan from a goal
  generatePlan: async (goalText: string): Promise<TaskPlan> => {
    const response = await api.post('/planner/generate', { goalText });
    return response.data.data;
  },

  // Refine an existing plan with feedback
  refinePlan: async (goalId: string, feedback: string): Promise<TaskPlan> => {
    const response = await api.post('/planner/refine', { goalId, feedback });
    return response.data.data;
  },

  // Get all goals
  getAllGoals: async (): Promise<Goal[]> => {
    const response = await api.get('/planner/goals');
    return response.data.data;
  },

  // Get a specific goal with its tasks
  getGoalWithTasks: async (goalId: string): Promise<any> => {
    const response = await api.get(`/planner/goal/${goalId}`);
    return response.data.data;
  },

  // Update task status
  updateTaskStatus: async (taskId: string, status: Task['status']): Promise<void> => {
    await api.patch('/planner/task/status', { taskId, status });
  },

  // Delete a goal
  deleteGoal: async (goalId: string): Promise<void> => {
    await api.delete(`/planner/goal/${goalId}`);
  },
};

export default api;
