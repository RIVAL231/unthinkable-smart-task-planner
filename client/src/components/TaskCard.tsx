import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiAlertCircle, FiCheckCircle, FiLink } from 'react-icons/fi';
import type { Task } from '../services/api';

interface TaskCardProps {
  task: Task;
  index: number;
  allTasks: Task[];
  onStatusChange?: (taskId: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, allTasks, onStatusChange }) => {
  const priorityColors = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low',
  };

  const statusColors = {
    pending: 'status-pending',
    'in-progress': 'status-in-progress',
    completed: 'status-completed',
    blocked: 'status-blocked',
  };

//   const statusLabels = {
//     pending: 'Pending',
//     'in-progress': 'In Progress',
//     completed: 'Completed',
//     blocked: 'Blocked',
//   };

  const getDependencyTitles = () => {
    if (!task.dependencies || task.dependencies.length === 0) return null;
    
    return task.dependencies
      .map(depId => {
        const depTask = allTasks.find(t => t.id === depId);
        return depTask?.title || depId;
      })
      .join(', ');
  };

  const dependencyTitles = getDependencyTitles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="task-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${priorityColors[task.priority]}`}>
              {task.priority.toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold  mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-2 text-sm">
          <FiClock className="text-blue-400" />
          <span className="text-gray-300">Duration:</span>
          <span className="text-white font-medium">{task.estimatedDuration}</span>
        </div>

        {task.deadline && (
          <div className="flex items-center gap-2 text-sm">
            <FiAlertCircle className="text-yellow-400" />
            <span className="text-gray-300">Deadline:</span>
            <span className="text-white font-medium">{task.deadline}</span>
          </div>
        )}

        {dependencyTitles && (
          <div className="flex items-start gap-2 text-sm">
            <FiLink className="text-purple-400 mt-1" />
            <div className="flex-1">
              <span className="text-gray-300">Depends on:</span>
              <p className="text-white font-medium mt-1">{dependencyTitles}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          <span className="text-sm text-gray-300">Status:</span>
          <select
            value={task.status}
            onChange={(e) => onStatusChange?.(task.id, e.target.value as Task['status'])}
            className={`px-3 text-black py-1 rounded-lg text-xs font-semibold cursor-pointer border border-white/10  focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${statusColors[task.status]}`}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          {task.status === 'completed' && (
            <FiCheckCircle className="text-green-400 ml-auto" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
