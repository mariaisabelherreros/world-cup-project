import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import {Dashboard} from "@mui/icons-material";
import Home from './pages/Home';
import CommunityPage from './pages/CommunityPage';



function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/community" element={<CommunityPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;