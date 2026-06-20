import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import Login from './pages/Login';
import Register from './pages/Register';
import { authService } from './services/api';

// Private Route: Checks user session
function PrivateRoute({ children }) {
  return authService.isAuthenticated() ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}

// Public Route: Redirects to Dashboard if session is active
function PublicRoute({ children }) {
  return !authService.isAuthenticated() ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/" replace />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-task"
          element={
            <PrivateRoute>
              <AddTask />
            </PrivateRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
