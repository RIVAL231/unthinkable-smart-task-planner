# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm package manager
- Google Gemini API key

## Setup Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_PATH=./data/tasks.json
```

**Important**: Replace `your_gemini_api_key_here` with your actual Google Gemini API key from https://makersuite.google.com/app/apikey

### 3. Run the Application

```bash
# Run both backend and frontend (recommended)
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## Testing the Application

### Test Goal Examples:

1. **Simple Goal**: "Launch a product in 2 weeks"
2. **Learning Goal**: "Learn Python and build a portfolio website in 2 months"
3. **Fitness Goal**: "Prepare for a marathon in 12 weeks"
4. **Business Goal**: "Increase website traffic by 50% in 6 months"

### Expected Behavior:

1. Enter a goal (minimum 10 characters)
2. Click "Generate Task Plan"
3. Wait 5-15 seconds for AI processing
4. View generated tasks with:
   - Task titles and descriptions
   - Estimated durations
   - Deadlines
   - Dependencies
   - Priority levels
5. Update task statuses
6. See progress bar update in real-time

## Troubleshooting

### Gemini API Error
- Ensure your API key is correct in `.env`
- Get your key at https://makersuite.google.com/app/apikey
- Verify internet connection

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000

### Frontend Not Loading
- Check if Vite dev server is running on port 5173
- Clear browser cache
- Try incognito mode

### Module Not Found Errors
- Run `npm install` in root directory
- Run `npm install` in client directory
- Delete node_modules and reinstall

## API Endpoints

### POST /api/planner/generate
Generate task plan from goal

### POST /api/planner/refine  
Refine existing plan with feedback

### GET /api/planner/goals
Get all goals

### GET /api/planner/goal/:id
Get specific goal with tasks

### PATCH /api/planner/task/status
Update task status

### DELETE /api/planner/goal/:id
Delete goal and tasks

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Backend server port | 3000 |
| NODE_ENV | Environment mode | development |
| GEMINI_API_KEY | Google Gemini API key | Required |
| DATABASE_PATH | Data storage path | ./data/tasks.json |

## Production Deployment

### Backend (Railway, Render, Heroku)
1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy

### Frontend (Vercel, Netlify)
1. Build: `cd client && npm install && npm run build`
2. Output: `client/dist`
3. Set `VITE_API_URL` to backend URL

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review DEMO_SCRIPT.md for usage examples
- Open an issue on GitHub
