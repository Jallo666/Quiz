import React from 'react';
import { version } from '../../package.json';

export default function Sidebar({ isOpen, onClose, activePage, onNavigate }) {
const menuItems = [
  { label: 'Home', page: 'home' },
  { label: 'Domande', page: 'questions' },
  { label: 'Statistiche', page: 'stats' },
  { label: 'Import', page: 'import' },
  { label: 'Database', page: 'database' },
  { label: 'Immagini', page: 'images' },
];
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-900
          text-white p-6 flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:shadow-none
          rounded-r-2xl
        `}
        aria-label="Sidebar navigation"
      >
        <div>
          <h1 className="text-3xl font-extrabold mb-10 tracking-wide drop-shadow-lg">
            Quiz <span className="text-indigo-300">App</span>
          </h1>

          <nav className="flex flex-col space-y-3" role="navigation">
            {menuItems.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => {
                  onNavigate(page);
                  onClose();
                }}
                className={`
                  text-left px-4 py-3 rounded-lg font-semibold text-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1
                  transition-colors duration-200
                  ${
                    activePage === page
                      ? 'bg-indigo-500 shadow-lg'
                      : 'hover:bg-indigo-600 hover:shadow-md'
                  }
                `}
                aria-current={activePage === page ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <footer className="mt-6 text-center text-indigo-300 text-sm select-none">
          Versione {version}
        </footer>
      </aside>
    </>
  );
}
