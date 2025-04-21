import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Landingpage from "../pages/Landingpage.jsx";
import JoyLoops from "../Components/JoyLoops/Joyloop.jsx";
import UserProfile from "../pages/UserProfile.jsx";
import SettingsPage from "../pages/Settings.jsx";
import ImpactReportPage from "../pages/ImpactReport.jsx";
import Onboarding from "../pages/Onboarding.jsx";
import DonationMap from "../pages/HeatMap.jsx";
import DeliveryTimeline from "../pages/DeliveryTimeline.jsx";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landingpage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/joyloop" element={<JoyLoops />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/impact" element={<ImpactReportPage />} />
        <Route path="/onboard" element={<Onboarding />} />
        <Route path="/map" element={<DonationMap />} />
        <Route path="/orderstatus" element={<DeliveryTimeline  currentStep={5}/>} />
        <Route
          path="/dashboard"
          element={
            // <ProtectedRoute>
              <Dashboard />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
