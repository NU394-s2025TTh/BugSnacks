'use client';
import './App.css';
import './index.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Layout from './components/layout/layout.component';
import Requests from './pages/Debugger/Requests/Requests';
// import AddProject from './components/ProjectForms/AddProject';
import Bugs from './pages/Developer/Bugs/Bugs';
import Projects from './pages/Developer/Projects/Projects';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Requests />} />
            <Route path="requests" element={<Requests />} />
            <Route path="bugs" element={<Bugs />} />
            <Route path="projects" element={<Projects />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
