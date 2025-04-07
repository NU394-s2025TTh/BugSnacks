import './App.css';

import React, { useState } from 'react';

import logo from './394-2025-Logo.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="header">
          {' '}
          🚀 Vite + React + Typescript + Vitest 🤘 & <br />
          Eslint 🔥+ Prettier for Wildcats
        </p>

        <div className="body">
          {' '}
          <button onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
          <p> Don&apos;t forgot to install Eslint and Prettier in Your Vscode.</p>
          <p>
            Mess up the code in <code>App.tsx </code> and save the file.
          </p>
          <p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            {' | '}
            <a
              className="App-link"
              href="https://vitejs.dev/guide/features.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vite Docs
            </a>
            {' | '}
            <a
              className="App-link"
              href="https://vitest.dev/guide/features.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vitest Docs
            </a>
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
