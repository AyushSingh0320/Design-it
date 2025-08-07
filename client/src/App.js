import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
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