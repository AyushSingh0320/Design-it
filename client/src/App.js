import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer.js'
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Profile from './pages/Profile';
import PortfolioItem from './pages/PortfolioItem';
import CreatePortfolioItem from './pages/CreatePortfolioItem';
import EditPortfolioItem from './pages/EditPortfolioItem';
import CreateCollaborationRequest from './pages/CreateCollaborationRequest';
import LikedPortfolios from './pages/LikedPortfolios';
import Network from './pages/Network';
import DarkVeil from './Background';

const ErrorBoundary = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
      <p className="text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
    </div>
  </div>
);

const AppLayout = () => (
  <AuthProvider>
    <div className="min-h-screen relative">
      {/* Background positioned absolutely to cover entire viewport */}
      <div className="fixed inset-0 w-full h-full z-0">
        <DarkVeil />
      </div>
      
      {/* Content positioned relative to appear above background with flex layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="  flex-1 bg-transparent">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      {
        path: 'dashboard',
        element: <PrivateRoute><Dashboard /></PrivateRoute>
      },
      {
        path: 'profile',
        element: <PrivateRoute><Profile /></PrivateRoute>
      },
      {
        path: 'profile/:id',
        element: <Profile />
      },
      {
        path: 'liked-portfolios',
        element: <PrivateRoute><LikedPortfolios /></PrivateRoute>
      },
      {
        path: 'network',
        element: <PrivateRoute><Network /></PrivateRoute>
      },
      {
        path: 'portfolio/create',
        element: <PrivateRoute><CreatePortfolioItem /></PrivateRoute>
      },
      {
        path: 'portfolio/:id',
        element: <PortfolioItem />
      },
      {
        path: 'portfolio/:id/edit',
        element: <PrivateRoute><EditPortfolioItem /></PrivateRoute>
      },
      {
        path: 'collaboration/create',
        element: <PrivateRoute><CreateCollaborationRequest /></PrivateRoute>
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App; 