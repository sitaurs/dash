import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider } from './contexts/BlogContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Pages from './pages/Pages';
import Comments from './pages/Comments';
import Stats from './pages/Stats';
import ContentLibrary from './pages/ContentLibrary';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BlogProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-400">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/posts" element={
                  <ProtectedRoute>
                    <Layout>
                      <Posts />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pages" element={
                  <ProtectedRoute>
                    <Layout>
                      <Pages />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/comments" element={
                  <ProtectedRoute>
                    <Layout>
                      <Comments />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/stats" element={
                  <ProtectedRoute>
                    <Layout>
                      <Stats />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/content" element={
                  <ProtectedRoute>
                    <Layout>
                      <ContentLibrary />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
          </Router>
        </BlogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;