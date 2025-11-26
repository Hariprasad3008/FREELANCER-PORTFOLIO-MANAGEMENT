// src/App.jsx
import NewProject from "./pages/NewProject.jsx";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import BrowseTalent from "./pages/BrowseTalent.jsx";
import BrowseProjects from "./pages/BrowseProjects.jsx";
import Profile from "./pages/Profile.jsx";
import Messages from "./pages/Messages.jsx";
import SavedProfiles from "./pages/SavedProfiles.jsx";
import About from "./pages/About.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import EditProfile from "./pages/EditProfile.jsx";

export default function App() {
  return (
    <div className="min-h-full">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/talent" element={<BrowseTalent />} />
          <Route path="/projects" element={<BrowseProjects />} />
          <Route path="/projects/new" element={<NewProject />} /> 
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/saved" element={<SavedProfiles />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Layout>
    </div>
  );
}
