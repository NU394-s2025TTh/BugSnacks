import React from 'react';
import { useNavigate } from 'react-router-dom';

import bugsnacks from '@/assets/bugsnacks.svg';
import caterpillar from '@/assets/caterpillar.svg'; // Adjust the path to your caterpillar file
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-screen">
      {/* Top-Left Images */}
      <div className="absolute top-4 left-4 flex items-center space-x-4">
        <img src={caterpillar} alt="a cute caterpillar" className="size-12" />
        <img
          src={bugsnacks}
          alt="logo for bugsnacks"
          className="w-full max-w-[150px] h-auto"
        />
      </div>

      {/* Left Section: Debuggers */}
      <div className="flex-1 bg-white dark:bg-black flex flex-col justify-center items-center p-8">
        <h1 className="text-5xl font-bold text-[color:var(--dark-green)] dark:text-white mb-4">
          Welcome Debuggers
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center">
          Dive into the world of debugging and help us find and fix bugs. Claim rewards
          for your contributions!
        </p>
        <Button
          className="bg-[color:var(--dark-green)] dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg text-lg hover:bg-gray-700 dark:hover:bg-gray-300"
          onClick={() => navigate('/requests')}
        >
          Enter Debuggers Portal
        </Button>
      </div>

      {/* Right Section: Developers */}
      <div className="flex-1 bg-[color:var(--dark-green)] dark:bg-black flex flex-col justify-center items-center p-8">
        <h1 className="text-5xl font-bold text-white dark:text-white mb-4">
          Welcome Developers
        </h1>
        <p className="text-lg text-gray-200 dark:text-gray-400 mb-8 text-center">
          Create projects, request testing, and collaborate with debuggers to improve your
          applications.
        </p>
        <Button
          className="bg-white dark:bg-white text-[color:var(--dark-green)] dark:text-black px-6 py-3 rounded-lg text-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => navigate('/projects')}
        >
          Enter Developers Portal
        </Button>
      </div>
    </div>
  );
}
