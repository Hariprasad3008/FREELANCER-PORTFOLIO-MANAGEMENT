import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import { AuthGate } from './components/common/AuthGate.jsx';

import { Home } from './pages/Home.jsx';
import { BrowseTalent } from './pages/BrowseTalent.jsx';
import { BrowseProjects } from './pages/BrowseProjects.jsx';
import { BrowseClients } from './pages/BrowseClients.jsx';
import { ProjectDetails } from './pages/ProjectDetails.jsx';
import { Profile } from './pages/Profile.jsx';
import { EditProfile } from './pages/EditProfile.jsx';
import { NewProject } from './pages/NewProject.jsx';
import { Messages } from './pages/Messages.jsx';
import { SavedItems } from './pages/SavedItems.jsx';
import { Auth } from './pages/Auth.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="talent" element={<BrowseTalent />} />
        <Route path="projects" element={<BrowseProjects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="clients" element={<BrowseClients />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route
          path="edit-profile"
          element={
            <AuthGate>
              <EditProfile />
            </AuthGate>
          }
        />
        <Route
          path="post-project"
          element={
            <AuthGate requiredRole="client">
              <NewProject />
            </AuthGate>
          }
        />
        <Route
          path="messages"
          element={
            <AuthGate>
              <Messages />
            </AuthGate>
          }
        />
        <Route
          path="saved"
          element={
            <AuthGate>
              <SavedItems />
            </AuthGate>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
