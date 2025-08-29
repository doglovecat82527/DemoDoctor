import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Diagnosis from './pages/Diagnosis';
import Pharmacy from './pages/Pharmacy';
import Appointment from './pages/Appointment';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Diagnosis />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/appointment" element={<Appointment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
