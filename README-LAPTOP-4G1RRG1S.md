dvc add Datasets# 🌾 DroughtGuard AI — Smart Drought Resistance Management System

DroughtGuard AI is a modern, production-grade agricultural intelligence platform built using **React**, **FastAPI**, **Tailwind CSS v4**, and **XGBoost ML** with **SHAP** explainability. It predicts regional drought risks, recommends drought-resistant crops, and schedules dynamic irrigation plans based on live soil metrics.

## 🚀 Project Architecture
- **`/frontend`**: React 19 (Vite), Tailwind CSS v4, Framer Motion, Recharts, and React Leaflet.
- **`/backend`**: FastAPI (Uvicorn), XGBoost Classifier, SHAP (Explainable AI), and Pydantic validation.

---

## 🛠️ Local Development

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Train the machine learning model:
   ```bash
   python -m app.ml.train_model
   ```
4. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   - API Docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev -- --open
   ```
   - The application will open automatically at: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Production Deployment Guide

### 1. Frontend Deployment (Vercel)
The frontend is configured with a `vercel.json` file to support single-page application (SPA) client-side routing.

#### Option A: GitHub Integration (Recommended)
1. Go to [Vercel](https://vercel.com) and link your GitHub account.
2. Select your repository: `AI-Based-Drought-Resistance-In-Machine-Learning`.
3. Configure the following build settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add an **Environment Variable** (so the frontend knows where the deployed backend is):
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-service-url.onrender.com`
5. Click **Deploy**.

#### Option B: Vercel CLI
If you prefer deploying via terminal, run the following commands in the `frontend` folder:
```bash
cd frontend
vercel login
vercel
```
Follow the interactive prompts (use the default configurations for Vite). Once completed, you can deploy to production using:
```bash
vercel --prod
```

---

### 2. Backend Deployment (Render or Railway)
Since the backend utilizes XGBoost, SHAP, and other high-performance ML libraries, it is best suited for platform-as-a-service providers.

#### Option A: Deploying on Render (Free Tier)
1. Go to [Render](https://render.com) and log in.
2. Create a new **Web Service** and connect your GitHub repository.
3. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python -m app.ml.train_model` (this automatically trains and saves the XGBoost model during build)
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Click **Deploy Web Service**.
5. Copy your live Render URL and add it as `VITE_API_URL` in your Vercel frontend environment variables.

---

## 🔑 Demo Credentials
- **Username**: `admin`
- **Password**: `password123`
