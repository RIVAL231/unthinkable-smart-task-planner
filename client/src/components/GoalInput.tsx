import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiSend, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface GoalInputProps {
  onPlanGenerated?: () => void;
}

const GoalInput: React.FC<GoalInputProps> = ({ onPlanGenerated }) => {
  const [goalText, setGoalText] = useState('');
  const { generatePlan, isLoading } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (goalText.trim().length < 10) {
      toast.error('Please enter a goal with at least 10 characters');
      return;
    }

    try {
      await generatePlan(goalText.trim());
      toast.success('Task plan generated successfully!');
      setGoalText('');
      onPlanGenerated?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate plan');
    }
  };

  const exampleGoals = [
    'Launch a mobile app in 3 months',
    'Prepare for a marathon in 12 weeks',
    'Learn Python and build a portfolio website in 2 months',
    'Plan and execute a product launch event in 4 weeks',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
            <FiTarget className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">What's Your Goal?</h2>
            <p className="text-gray-400 text-sm">
              Describe your goal and let AI break it down into actionable tasks
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., Launch a product in 2 weeks, Learn a new skill in 30 days..."
              className="input-field min-h-32 resize-none"
              disabled={isLoading}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {goalText.length}/1000 characters
              </span>
              {goalText.trim().length > 0 && goalText.trim().length < 10 && (
                <span className="text-sm text-red-400">
                  Minimum 10 characters required
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || goalText.trim().length < 10}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <FiSend />
                Generate Task Plan
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleGoals.map((example, index) => (
              <button
                key={index}
                onClick={() => setGoalText(example)}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all duration-300 disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GoalInput;
