# 🚀 Quick Start Guide

## Get Your Gemini API Key (FREE)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key" or "Create API Key"
3. Copy your API key

## Setup (2 minutes)

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Create .env file
# Copy .env.example to .env
cp .env.example .env

# 3. Add your Gemini API key to .env
# Edit the .env file and replace 'your_gemini_api_key_here' with your actual key
```

## Run the App

```bash
# Start both backend and frontend
npm run dev
```

That's it! 🎉

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Try It Out

1. Enter a goal like: "Launch a mobile app in 3 months"
2. Click "Generate Task Plan"
3. Watch AI break it down into actionable tasks!

## Example Goals

- "Launch a product in 2 weeks"
- "Learn Python in 30 days"
- "Prepare for a marathon in 12 weeks"
- "Plan a wedding in 6 months"

## Troubleshooting

**Can't find GEMINI_API_KEY?**
- Make sure you created a `.env` file in the root directory
- Check that your API key is correctly pasted

**Port already in use?**
- Change PORT in `.env` to another port (e.g., 3001)

**Need help?**
- Check `SETUP.md` for detailed instructions
- Check `README.md` for full documentation
