import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ClientEditProfile } from './ClientEditProfile.jsx';
import { FreelancerEditProfile } from './FreelancerEditProfile.jsx';

export const EditProfile = () => {
  const { user, isClient } = useAuth();

  // Determine if the user is a Client (case-insensitive check from auth context)
  const clientRole = isClient || user?.role?.toLowerCase() === 'client';

  return clientRole ? <ClientEditProfile /> : <FreelancerEditProfile />;
};
