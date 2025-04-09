import './App.css';
import './index.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import AddBugs from './pages/AddBugs/AddBugs';
import FoundBugs from './pages/FoundBugs/FoundBugs';
import Rewards from './pages/Rewards/Rewards';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Rewards />} />
            <Route path="bugs" element={<FoundBugs />} />
            <Route path="addbug" element={<AddBugs />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
