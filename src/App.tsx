/*
  App.tsx: Root component for the BugSnacks application.
  - Wraps the app with a ThemeProvider to support light/dark mode toggling.
  - Configures client-side routing to various pages (Requests, Bugs, Projects).
  - Uses a shared Layout component to render common UI (e.g., header, navigation).
*/
// Most comments made in the file were done by OpenAI's o4-mini model

// Marks this file as a client-side React component
'use client';

// Import global CSS styles
import './App.css';
import './index.css';

import React from 'react';
// BrowserRouter provides HTML5 history API–based routing
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// ThemeProvider component for managing theme state (light/dark)
import { ThemeProvider } from '@/components/theme-provider';

// Layout wraps all pages with shared UI (e.g., header, sidebar)
import Layout from './components/layout/layout.component';
// Page components for different routes
import Requests from './pages/Debugger/Requests/requests.page';
// import AddProject from './components/ProjectForms/AddProject';
import Bugs from './pages/Developer/Bugs/bugs.page';
import Projects from './pages/Developer/Projects/projects.page';
import Landing from './pages/Landing/landing.page';
function App() {
  return (
    <div>
      {/* theme provider used for toggling b/w dark and light mode */}
      <ThemeProvider storageKey="vite-ui-theme">
        {/* Wraps the route definitions in a Router */}
        <Router>
          <Routes>
            <Route path="/landing" element={<Landing />}></Route>
            {/* Base route applies the Layout component */}
            <Route path="/" element={<Layout />}>
              {/* Default route renders the Requests page */}
              <Route index element={<Requests />} />
              {/* Explicit path for requests page */}
              <Route path="requests" element={<Requests />} />
              {/* Developer bugs page */}
              <Route path="bugs" element={<Bugs />} />
              {/* Developer projects page */}
              <Route path="projects" element={<Projects />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
