import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Admin from './Dashboard/Admin';
import Teacher from './Dashboard/Teacher';

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === role ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protect routes based on roles */}
        <Route 
          path="/Admin" 
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Teacher" 
          element={
            <ProtectedRoute role="teacher">
              <Teacher />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
