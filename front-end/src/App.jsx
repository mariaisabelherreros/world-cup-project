import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Home from './pages/Home';
import CommunityPage from './pages/Community';
import Admin from './pages/Admin';
import User from './pages/User';
import TradeRequests from "./pages/TradeRequests.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/reset_password" element={<ResetPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/trade-requests" element={<TradeRequests />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/user" element={<User />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;