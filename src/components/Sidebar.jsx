import React from 'react';

export default function Sidebar({ isOpen, onClose, activePage, onNavigate }) {
  // Link e pagine collegate
  const menuItems = [
    { label: 'Home', page: 'home' },
    { label: 'Domande', page: 'questions' },
    { label: 'Statistiche', page: 'stats' },
    { label: 'Import', page: 'import' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-blue-700 text-white p-4
          transform lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0
        `}
      >
        <h1 className="text-2xl font-bold mb-8">Quiz App</h1>
        <nav className="flex flex-col space-y-4">
          {menuItems.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => {
                onNavigate(page);
                onClose();
              }}
              className={`
                text-left p-2 rounded
                ${activePage === page ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-600'}
              `}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
