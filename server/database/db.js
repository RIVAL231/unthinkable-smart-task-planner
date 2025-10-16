import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'tasks.json');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database file if it doesn't exist
if (!existsSync(dbPath)) {
  writeFileSync(dbPath, JSON.stringify({ goals: [], tasks: [], dependencies: [] }, null, 2));
}

const readDB = () => {
  try {
    const data = readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { goals: [], tasks: [], dependencies: [] };
  }
};

const writeDB = (data) => {
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const initializeDatabase = () => {
  if (!existsSync(dbPath)) {
    writeDB({ goals: [], tasks: [], dependencies: [] });
  }
  console.log('✅ Database initialized successfully');
};

// Goal operations
export const saveGoal = (id, goalText) => {
  const db = readDB();
  db.goals.push({
    id,
    goal_text: goalText,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  writeDB(db);
};

export const getGoal = (id) => {
  const db = readDB();
  return db.goals.find(g => g.id === id);
};

export const getAllGoals = () => {
  const db = readDB();
  return db.goals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const deleteGoal = (id) => {
  const db = readDB();
  const initialLength = db.goals.length;
  db.goals = db.goals.filter(g => g.id !== id);
  db.tasks = db.tasks.filter(t => t.goal_id !== id);
  db.dependencies = db.dependencies.filter(d => {
    const task = db.tasks.find(t => t.id === d.task_id);
    return task && task.goal_id !== id;
  });
  writeDB(db);
  return { changes: initialLength - db.goals.length };
};

// Task operations
export const saveTasks = (goalId, tasks) => {
  const db = readDB();
  
  tasks.forEach((task, index) => {
    const taskData = {
      id: task.id,
      goal_id: goalId,
      title: task.title,
      description: task.description || null,
      estimated_duration: task.estimatedDuration || null,
      deadline: task.deadline || null,
      priority: task.priority || 'medium',
      status: 'pending',
      order_index: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.tasks.push(taskData);

    // Add dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depId => {
        db.dependencies.push({
          id: db.dependencies.length + 1,
          task_id: task.id,
          depends_on_task_id: depId,
          created_at: new Date().toISOString()
        });
      });
    }
  });

  writeDB(db);
};

export const getTasks = (goalId) => {
  const db = readDB();
  const tasks = db.tasks
    .filter(t => t.goal_id === goalId)
    .sort((a, b) => a.order_index - b.order_index);

  return tasks.map(task => ({
    ...task,
    dependencies: db.dependencies
      .filter(d => d.task_id === task.id)
      .map(d => d.depends_on_task_id)
  }));
};

export const updateTaskStatus = (taskId, status) => {
  const db = readDB();
  const task = db.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    task.updated_at = new Date().toISOString();
    writeDB(db);
  }
  return { changes: task ? 1 : 0 };
};

export const getGoalWithTasks = (goalId) => {
  const goal = getGoal(goalId);
  if (!goal) return null;

  const tasks = getTasks(goalId);
  return { ...goal, tasks };
};

export default { initializeDatabase };
