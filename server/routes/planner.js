import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { generateTaskPlan, refineTaskPlan } from '../services/llm.js';
import { 
  saveGoal, 
  saveTasks, 
  getGoalWithTasks, 
  getAllGoals,
  updateTaskStatus,
  deleteGoal 
} from '../database/db.js';

const router = express.Router();

// Validation schemas
const goalSchema = z.object({
  goalText: z.string().min(10, 'Goal must be at least 10 characters').max(1000, 'Goal too long')
});

const refineSchema = z.object({
  goalId: z.string().uuid(),
  feedback: z.string().min(5, 'Feedback must be at least 5 characters')
});

const taskStatusSchema = z.object({
  taskId: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked'])
});

// POST /api/planner/generate - Generate task plan from goal
router.post('/generate', async (req, res, next) => {
  try {
    // Validate input
    const { goalText } = goalSchema.parse(req.body);

    console.log(`📝 Generating plan for: "${goalText}"`);

    // Generate task plan using LLM
    const taskPlan = await generateTaskPlan(goalText);

    // Save to database
    const goalId = uuidv4();
    saveGoal(goalId, goalText);
    saveTasks(goalId, taskPlan.tasks);

    console.log(`✅ Plan generated with ${taskPlan.tasks.length} tasks`);

    res.json({
      success: true,
      data: {
        goalId,
        goalText,
        analysis: taskPlan.analysis,
        totalEstimatedTime: taskPlan.totalEstimatedTime,
        tasks: taskPlan.tasks,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.errors
        }
      });
    }
    next(error);
  }
});

// POST /api/planner/refine - Refine existing plan based on feedback
router.post('/refine', async (req, res, next) => {
  try {
    const { goalId, feedback } = refineSchema.parse(req.body);

    console.log(`🔄 Refining plan ${goalId} with feedback`);

    // Get current plan
    const currentGoal = getGoalWithTasks(goalId);
    if (!currentGoal) {
      return res.status(404).json({
        success: false,
        error: { message: 'Goal not found' }
      });
    }

    // Refine plan using LLM
    const refinedPlan = await refineTaskPlan(
      currentGoal.goal_text,
      currentGoal.tasks,
      feedback
    );

    // Update database - delete old tasks and save new ones
    deleteGoal(goalId);
    saveGoal(goalId, currentGoal.goal_text);
    saveTasks(goalId, refinedPlan.tasks);

    console.log(`✅ Plan refined with ${refinedPlan.tasks.length} tasks`);

    res.json({
      success: true,
      data: {
        goalId,
        goalText: currentGoal.goal_text,
        analysis: refinedPlan.analysis,
        totalEstimatedTime: refinedPlan.totalEstimatedTime,
        tasks: refinedPlan.tasks,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.errors
        }
      });
    }
    next(error);
  }
});

// GET /api/planner/goals - Get all goals
router.get('/goals', async (req, res, next) => {
  try {
    const goals = getAllGoals();
    
    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/planner/goal/:id - Get specific goal with tasks
router.get('/goal/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const goalWithTasks = getGoalWithTasks(id);
    
    if (!goalWithTasks) {
      return res.status(404).json({
        success: false,
        error: { message: 'Goal not found' }
      });
    }

    res.json({
      success: true,
      data: goalWithTasks
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/planner/task/status - Update task status
router.patch('/task/status', async (req, res, next) => {
  try {
    const { taskId, status } = taskStatusSchema.parse(req.body);
    
    updateTaskStatus(taskId, status);
    
    console.log(`✅ Task ${taskId} status updated to ${status}`);

    res.json({
      success: true,
      message: 'Task status updated'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.errors
        }
      });
    }
    next(error);
  }
});

// DELETE /api/planner/goal/:id - Delete goal and its tasks
router.delete('/goal/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = deleteGoal(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Goal not found' }
      });
    }

    console.log(`🗑️ Goal ${id} deleted`);

    res.json({
      success: true,
      message: 'Goal and associated tasks deleted'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
