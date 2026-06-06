# Deployment Guide

This project consists of a FastAPI backend and a Next.js frontend. Follow these instructions to deploy them.

## 1. Deploying the Backend (Render)

Render is an excellent platform for deploying FastAPI applications.

1. Create an account on [Render.com](https://render.com).
2. Click **New** > **Web Service**.
3. Connect your GitHub repository containing the backend code.
4. Set the following configuration:
   - **Root Directory**: `backend` (if your repository has both frontend and backend directories)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT` (this is also handled by the included `Procfile`)
5. Add the following **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `JWT_SECRET`: A secure random string for JWT token signing.
6. Click **Create Web Service**. Render will build and deploy your backend.
7. Note the URL of your deployed backend (e.g., `https://medimind-ai-backend.onrender.com`).

## 2. Deploying the Frontend (Vercel)

Vercel is the best platform for Next.js applications.

1. Create an account on [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. Open the **Environment Variables** section and add:
   - `NEXT_PUBLIC_API_URL`: Set this to your deployed backend URL from Render (e.g., `https://medimind-ai-backend.onrender.com`).
6. Click **Deploy**. Vercel will automatically build and deploy your Next.js application.

## 3. Verify Deployment

- Visit your Vercel frontend URL.
- Test the chatbot, symptom prediction, and knowledge base. Ensure that API requests are successfully hitting your Render backend.
