import './App.css';
import './index.css';

import React from 'react';

import Navbar from './components/Navbar/Navbar';
import FoundBugs from './pages/FoundBugs/FoundBugs';

function App() {
  return (
    <div>
      <Navbar />
      <FoundBugs />
    </div>
  );
}

export default App;
