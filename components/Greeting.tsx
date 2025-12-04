import React from 'react';

interface GreetingProps {
  message: string;
}

export const Greeting: React.FC<GreetingProps> = ({ message }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center transform hover:scale-105 transition-transform duration-300">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
        {message}
      </h1>
      <p className="text-gray-500">
        Bienvenue sur votre application React simple.
      </p>
    </div>
  );
};