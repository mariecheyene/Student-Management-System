import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'; // For custom styles if needed

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // To manage loading state
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      navigate('/Admin');
    } else if (user && user.role === 'teacher') {
      navigate('/Teacher');
    }
  }, [navigate]);
  

  // Form validation
  const validateForm = () => {
    if (!email || !password) {
      setErrorMessage('Please fill in both fields.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    if (!validateForm()) return; // Stop if validation fails
  
    setIsLoading(true);
  
    let role = '';
    if (email === 'admin@gmail.com' && password === 'Admin_0') {
      role = 'admin';
      localStorage.setItem('user', JSON.stringify({ role }));
    } else if (email === 'teacher@gmail.com' && password === 'Teacher_0') {
      role = 'teacher';
      localStorage.setItem('user', JSON.stringify({ role }));
    } else {
      toast.error('Invalid credentials. Please try again.');
      setIsLoading(false);
      return;
    }
  
    setIsLoading(false);
    toast.success(`Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)}!`);
    navigate(role === 'admin' ? '/Admin' : '/Teacher'); // Redirect immediately
  };
  
  
  return (
  <div className="login-page">
    <h1 className="system-title">STUDENT MANAGEMENT SYSTEM</h1>
    <div className="login-container">
      <ToastContainer />
      <div className="login-box">
        <h4 className="text-center login-title">Login</h4>
        <Form onSubmit={handleLogin} className="mt-3">
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={errorMessage && !email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errorMessage}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={errorMessage && !password}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errorMessage}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </Button>
        </Form>
      </div>
    </div>
  </div>
);
}
export default Login;
