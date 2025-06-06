import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CreateDealPage from './pages/CreateDealPage';
import DealDashboardPage from './pages/DealDashboardPage';
import KYCPage from './pages/KYCPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import SignInPage from './pages/SignInPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-deal" element={<CreateDealPage />} />
            <Route path="/dashboard" element={<DealDashboardPage />} />
            <Route path="/kyc" element={<KYCPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;