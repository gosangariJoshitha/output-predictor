# Deployment Guide

The project is now split into two main components:
1. **Frontend**: Hosted on Vercel
2. **Backend**: Hosted on Render

## 1. Deploying the Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. In the Render setup:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - `SERVICE_ACCOUNT_KEY_BASE64`: Add your base64 encoded Firebase service account key here.
   - `PORT`: (Render sets this automatically, but ensure it's left default in code).
5. Deploy the service.
6. Once deployed, copy your Render app URL (e.g., `https://your-app-name.onrender.com`).

## 2. Deploying the Frontend (Vercel)

1. Update `frontend/config.js` with your Render API URL.
   ```javascript
   export const API_BASE_URL = 'https://your-app-name.onrender.com';
   ```
2. Commit and push this change to your repository.
3. Create a new **Project** on [Vercel](https://vercel.com).
4. Connect your GitHub repository.
5. In the Vercel setup:
   - **Framework Preset**: `Other`
   - **Root Directory**: `frontend`
6. Click **Deploy**.

## Local Development
To run this project locally:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   (Make sure you have your `serviceAccountKey.json` placed inside the `backend` folder)

2. **Frontend**:
   Open a new terminal, and use any static file server like `serve`:
   ```bash
   cd frontend
   npx serve .
   ```
