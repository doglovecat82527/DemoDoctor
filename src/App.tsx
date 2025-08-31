import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Diagnosis from './pages/Diagnosis';
import Pharmacy from './pages/Pharmacy';
import Appointment from './pages/Appointment';
import PharmacyHome from './pages/PharmacyHome';
import PharmacyPrescription from './pages/PharmacyPrescription';
import PharmacyCart from './pages/PharmacyCart';
import PharmacyCheckout from './pages/PharmacyCheckout';
import PharmacyPayment from './pages/PharmacyPayment';
import PharmacyOrderSuccess from './pages/PharmacyOrderSuccess';
import AppointmentHome from './pages/AppointmentHome';
import AppointmentSuccess from './pages/AppointmentSuccess';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Diagnosis />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/pharmacy/home" element={<PharmacyHome />} />
          <Route path="/pharmacy/prescription" element={<PharmacyPrescription />} />
          <Route path="/pharmacy/cart" element={<PharmacyCart />} />
          <Route path="/pharmacy/checkout" element={<PharmacyCheckout />} />
          <Route path="/pharmacy/payment" element={<PharmacyPayment />} />
          <Route path="/pharmacy/success" element={<PharmacyOrderSuccess />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/appointment/home" element={<AppointmentHome />} />
          <Route path="/appointment/success" element={<AppointmentSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
