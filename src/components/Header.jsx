import React from 'react';

export default function Header({ onOpen }) {
  return (
    <header className="w-full bg-white shadow-md p-4 flex items-center lg:hidden">
      <button
        onClick={onOpen}
        className="text-blue-700 focus:outline-none"
        aria-label="Apri menu"
      >
        {/* Icona hamburger */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      <h1 className="ml-4 text-xl font-bold text-blue-700">Quiz App - React</h1>
    </header>
  );
}
