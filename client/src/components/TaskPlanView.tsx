import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiBriefcase, FiCheckSquare } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import TaskCard from './TaskCard';
import toast from 'react-hot-toast';
import type { Task } from '../services/api';

const TaskPlanView: React.FC = () => {
  const { currentPlan, updateTaskStatus } = useStore();

  if (!currentPlan) {
    return null;
  }

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const completedTasks = currentPlan.tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = (completedTasks / currentPlan.tasks.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Your Task Plan</h2>
            <p className="text-gray-300 text-lg">{currentPlan.goalText}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Progress</div>
            <div className="text-2xl font-bold text-white">
              {completedTasks}/{currentPlan.tasks.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
          />
        </div>

        {/* Analysis */}
        {currentPlan.analysis && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">AI Analysis</h3>
            <p className="text-gray-300 text-sm">{currentPlan.analysis}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FiBriefcase className="text-blue-400 text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Tasks</div>
              <div className="text-xl font-bold text-white">{currentPlan.tasks.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FiCheckSquare className="text-green-400 text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Completed</div>
              <div className="text-xl font-bold text-white">{completedTasks}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FiClock className="text-purple-400 text-xl" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Est. Time</div>
              <div className="text-xl font-bold text-white">{currentPlan.totalEstimatedTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentPlan.tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            allTasks={currentPlan.tasks}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TaskPlanView;
