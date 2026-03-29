import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing   from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login     from './pages/Login';
import { ThemeProvider } from './ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login"     element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;