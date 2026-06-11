import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Vehicles from '@/pages/Vehicles';
import Stations from '@/pages/Stations';
import Dispatch from '@/pages/Dispatch';
import Inspection from '@/pages/Inspection';
import Complaints from '@/pages/Complaints';
import Pricing from '@/pages/Pricing';
import Reports from '@/pages/Reports';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
