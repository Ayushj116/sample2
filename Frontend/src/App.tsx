import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CreateDealPage from './pages/CreateDealPage';
import DealDashboardPage from './pages/DealDashboardPage';
import DealDetailsPage from './pages/DealDetailsPage';
import KYCPage from './pages/KYCPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import SignInPage from './pages/SignInPage';
import WalletPage from './pages/WalletPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route 
                path="/sign-in" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <SignInPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-deal" 
                element={
                  <ProtectedRoute>
                    <CreateDealPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DealDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deal/:id" 
                element={
                  <ProtectedRoute>
                    <DealDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/kyc" 
                element={
                  <ProtectedRoute>
                    <KYCPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;