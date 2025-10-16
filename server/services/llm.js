import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyDHilTZLkNbJKcKR-n4kjgDx_JSOW2yFw0");
console.log(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SYSTEM_PROMPT = `You are an expert project management AI assistant specialized in breaking down goals into actionable tasks with realistic timelines and dependencies.

Your role is to:
1. Analyze the user's goal comprehensively
2. Break it down into logical, sequential tasks
3. Estimate realistic time durations for each task
4. Identify task dependencies (which tasks must be completed before others)
5. Assign appropriate priority levels
6. Set reasonable deadlines based on the goal's timeline

Guidelines:
- Be specific and actionable in task descriptions
- Consider real-world constraints and typical workflows
- Include preparation, execution, and review phases where appropriate
- Account for potential blockers and dependencies
- Provide detailed descriptions that help users understand what each task entails
- Use priority levels: high, medium, low
- Estimated durations should be realistic (e.g., "2 hours", "3 days", "1 week")

Always respond with a valid JSON object in this exact format:
{
  "analysis": "Brief analysis of the goal and approach",
  "totalEstimatedTime": "Overall time estimate",
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "estimatedDuration": "Time estimate",
      "priority": "high|medium|low",
      "dependencies": ["id of tasks this depends on"],
      "deadline": "ISO date string or relative (e.g., 'Day 1', 'Week 1')"
    }
  ]
}`;

export const generateTaskPlan = async (goalText) => {
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nPlease break down this goal into a comprehensive task plan:\n\n"${goalText}"\n\nProvide a detailed breakdown with tasks, dependencies, timelines, and priorities.\n\nRespond ONLY with valid JSON in this exact format (no markdown, no code blocks):\n{\n  "analysis": "Brief analysis of the goal and approach",\n  "totalEstimatedTime": "Overall time estimate",\n  "tasks": [\n    {\n      "title": "Task title",\n      "description": "Detailed description",\n      "estimatedDuration": "Time estimate",\n      "priority": "high|medium|low",\n      "dependencies": [],\n      "deadline": "ISO date string or relative"\n    }\n  ]\n}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const parsedResponse = JSON.parse(cleanedResponse);

    // Validate and process the response
    if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
      throw new Error('Invalid response format: missing tasks array');
    }

    // Assign IDs and ensure proper structure
    const tasksWithIds = parsedResponse.tasks.map((task, index) => ({
      id: `task-${index + 1}`,
      title: task.title || `Task ${index + 1}`,
      description: task.description || '',
      estimatedDuration: task.estimatedDuration || 'Not specified',
      priority: task.priority || 'medium',
      dependencies: Array.isArray(task.dependencies) 
        ? task.dependencies.map(dep => {
            // Handle both numeric indices and task IDs
            if (typeof dep === 'number') {
              return `task-${dep + 1}`;
            }
            return dep;
          })
        : [],
      deadline: task.deadline || null,
      status: 'pending'
    }));

    return {
      analysis: parsedResponse.analysis || 'Goal analyzed and broken down into tasks',
      totalEstimatedTime: parsedResponse.totalEstimatedTime || 'See individual tasks',
      tasks: tasksWithIds
    };
  } catch (error) {
    console.error('LLM Error:', error);
    
    // Provide a fallback response structure
    if (error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to .env file. Get your key at https://makersuite.google.com/app/apikey');
    }
    
    throw new Error(`Failed to generate task plan: ${error.message}`);
  }
};

export const refineTaskPlan = async (goalText, currentPlan, userFeedback) => {
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nOriginal goal: "${goalText}"\n\nCurrent plan:\n${JSON.stringify(currentPlan, null, 2)}\n\nUser feedback: "${userFeedback}"\n\nPlease refine the task plan based on this feedback.\n\nRespond ONLY with valid JSON in this exact format (no markdown, no code blocks):\n{\n  "analysis": "Brief analysis",\n  "totalEstimatedTime": "Overall time estimate",\n  "tasks": [...]\n}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const parsedResponse = JSON.parse(cleanedResponse);

    const tasksWithIds = parsedResponse.tasks.map((task, index) => ({
      id: `task-${index + 1}`,
      title: task.title || `Task ${index + 1}`,
      description: task.description || '',
      estimatedDuration: task.estimatedDuration || 'Not specified',
      priority: task.priority || 'medium',
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      deadline: task.deadline || null,
      status: 'pending'
    }));

    return {
      analysis: parsedResponse.analysis || 'Task plan refined based on feedback',
      totalEstimatedTime: parsedResponse.totalEstimatedTime || 'See individual tasks',
      tasks: tasksWithIds
    };
  } catch (error) {
    console.error('LLM Refinement Error:', error);
    throw new Error(`Failed to refine task plan: ${error.message}`);
  }
};
