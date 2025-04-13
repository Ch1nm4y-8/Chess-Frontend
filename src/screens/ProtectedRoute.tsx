import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../contexts/userContext';
import React from 'react';

const ProtectedRoute = () => {
    console.log('insideeeeeeeeeeeeee ProtectedRoute')
    const { user } = useUser();
  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute
