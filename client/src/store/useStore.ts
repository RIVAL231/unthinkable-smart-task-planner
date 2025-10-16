import { create } from 'zustand';
import type { TaskPlan, Task, Goal } from '../services/api';
import { plannerAPI } from '../services/api';

interface AppState {
  currentPlan: TaskPlan | null;
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  generatePlan: (goalText: string) => Promise<void>;
  refinePlan: (goalId: string, feedback: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  loadGoals: () => Promise<void>;
  loadGoalWithTasks: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  clearCurrentPlan: () => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentPlan: null,
  goals: [],
  isLoading: false,
  error: null,

  generatePlan: async (goalText: string) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await plannerAPI.generatePlan(goalText);
      set({ currentPlan: plan, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  refinePlan: async (goalId: string, feedback: string) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await plannerAPI.refinePlan(goalId, feedback);
      set({ currentPlan: plan, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string, status: Task['status']) => {
    try {
      await plannerAPI.updateTaskStatus(taskId, status);
      
      // Update local state
      const currentPlan = get().currentPlan;
      if (currentPlan) {
        const updatedTasks = currentPlan.tasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        );
        set({ currentPlan: { ...currentPlan, tasks: updatedTasks } });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await plannerAPI.getAllGoals();
      set({ goals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadGoalWithTasks: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await plannerAPI.getGoalWithTasks(goalId);
      const plan: TaskPlan = {
        goalId: data.id,
        goalText: data.goal_text,
        analysis: '',
        totalEstimatedTime: '',
        tasks: data.tasks,
        createdAt: data.created_at,
      };
      set({ currentPlan: plan, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await plannerAPI.deleteGoal(goalId);
      const goals = get().goals.filter(g => g.id !== goalId);
      set({ goals });
      
      // Clear current plan if it's the one being deleted
      if (get().currentPlan?.goalId === goalId) {
        set({ currentPlan: null });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  clearCurrentPlan: () => {
    set({ currentPlan: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
