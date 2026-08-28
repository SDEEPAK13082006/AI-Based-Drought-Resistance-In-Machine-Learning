import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import CropRecommendation from './pages/CropRecommendation';
import RainfallAnalytics from './pages/RainfallAnalytics';
import IndiaHeatMap from './pages/IndiaHeatMap';
import IrrigationPlanner from './pages/IrrigationPlanner';
import AIInsights from './pages/AIInsights';
import MLOpsMonitoring from './pages/MLOpsMonitoring';

// Layout for authenticated dashboard pages
const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
        <Footer />
        <AIChatbot />
      </div>
    </div>
  );
};


// Public layout (landing/login)
const PublicLayout = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/predict" element={<Prediction />} />
              <Route path="/crops" element={<CropRecommendation />} />
              <Route path="/rainfall" element={<RainfallAnalytics />} />
              <Route path="/heatmap" element={<IndiaHeatMap />} />
              <Route path="/irrigation" element={<IrrigationPlanner />} />
              <Route path="/insights" element={<AIInsights />} />
              <Route path="/mlops" element={<MLOpsMonitoring />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
