import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import GoalInput from './components/GoalInput';
import TaskPlanView from './components/TaskPlanView';
import { useStore } from './store/useStore';

function App() {
  const { currentPlan, clearCurrentPlan } = useStore();
  const [showInput, setShowInput] = useState(true);

  const handlePlanGenerated = () => {
    setShowInput(false);
  };

  const handleNewGoal = () => {
    clearCurrentPlan();
    setShowInput(true);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-12 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Smart Task Planner
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Transform your goals into actionable tasks with AI-powered planning. Get realistic timelines,
          dependencies, and smart prioritization.
        </p>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {showInput && !currentPlan && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GoalInput onPlanGenerated={handlePlanGenerated} />
            </motion.div>
          )}

          {currentPlan && (
            <motion.div
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={handleNewGoal}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiPlus />
                  New Goal
                </button>
                <button
                  onClick={() => setShowInput(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiRefreshCw />
                  Edit Goal
                </button>
              </div>

              {showInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <GoalInput onPlanGenerated={() => setShowInput(false)} />
                </motion.div>
              )}

              <TaskPlanView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-6xl mx-auto mt-16 text-center text-gray-500 text-sm"
      >
        <p>Powered by AI • Built with React, TypeScript, and Google Gemini</p>
      </motion.footer>
    </div>
  );
}

export default App;
