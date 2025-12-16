import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Departments from './pages/Departments';
import Items from './pages/Items';
import Addons from './pages/Addons';
import Combinations from './pages/Combinations';
import Estimates from './pages/Estimates';
import Orders from './pages/Orders';
import AMC from './pages/AMC';
import Complaints from './pages/Complaints';
import RMA from './pages/RMA';
import HR from './pages/HR';
import StockInventory from './pages/StockInventory';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page - Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route path="/app" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="items" element={<Items />} />
                    <Route path="addons" element={<Addons />} />
                    <Route path="combinations" element={<Combinations />} />
                    <Route path="estimates" element={<Estimates />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="amc" element={<AMC />} />
                    <Route path="complaints" element={<Complaints />} />
                    <Route path="rma" element={<RMA />} />
                    <Route path="hr" element={<HR />} />
                    <Route path="stock-inventory" element={<StockInventory />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
