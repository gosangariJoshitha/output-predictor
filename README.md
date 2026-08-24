# Output Predictor Quiz Platform

This repository contains the frontend and backend for a competitive programming quiz application. The backend uses Node.js and Firebase Admin (Firestore) while the frontend is a vanilla HTML/CSS/JS app.

## Live Demo

The application is deployed and accessible via the following live URLs:

- **Frontend (Vercel):** [https://output-predictor.vercel.app/](https://output-predictor.vercel.app/)
- **Backend API (Render):** `https://output-predictor.onrender.com`

*Note: The frontend is configured to automatically communicate with the live Render backend or localhost depending on the environment.*

## Local Development

To run this project locally:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *(Make sure you have your `serviceAccountKey.json` placed inside the `backend` folder)*

2. **Frontend**:
   Open a new terminal, and use any static file server like `serve`:
   ```bash
   cd frontend
   npx serve .
   ```

## Deployment (Vercel & Render)

The project is split into two main components:
1. **Frontend**: Hosted on Vercel
2. **Backend**: Hosted on Render

### 1. Deploying the Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. In the Render setup:
   - **Root Directory**: `backend`
   - **Environment**: `Node` or `Docker`
   - **Build Command**: `npm install` (if using Node environment)
   - **Start Command**: `npm start` (if using Node environment)
4. **Environment Variables**:
   - `SERVICE_ACCOUNT_KEY_BASE64`: Add your base64 encoded Firebase service account key here.
   - `PORT`: (Render sets this automatically, but ensure it's left default in code).
5. Deploy the service.
6. Once deployed, copy your Render app URL (e.g., `https://your-app-name.onrender.com`).

### 2. Deploying the Frontend (Vercel)

1. The `frontend/config.js` is already configured to use the live Render API URL in production:
   ```javascript
   export const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:5000'
     : 'https://output-predictor.onrender.com';
   ```
2. Create a new **Project** on [Vercel](https://vercel.com).
3. Connect your GitHub repository.
4. In the Vercel setup:
   - **Framework Preset**: `Other`
   - **Root Directory**: `frontend`
5. Click **Deploy**.

## Git hygiene
Sensitive files (e.g., `serviceAccountKey.json`, `.env`) are ignored. If secrets are ever committed, use BFG or `git filter-repo` to remove them and force-push the cleaned history.
