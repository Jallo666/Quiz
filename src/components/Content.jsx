import React from 'react';
import Import from './Import';
import Questions from './Questions/Questions';
import DatabaseManager from './DBManager';
export default function Content({ activePage }) {
  switch (activePage) {
    case 'home':
      return (
        <main className="p-6 overflow-auto">
          <h2 className="text-3xl font-semibold mb-4">Home</h2>
          <p>Benvenuto nella pagina principale del Quiz.</p>
        </main>
      );
    case 'questions':
      return (
        <main className="p-6 overflow-auto">
          <Questions />
        </main>
      );
    case 'stats':
      return (
        <main className="p-6 overflow-auto">
          <h2 className="text-3xl font-semibold mb-4">Statistiche</h2>
          <p>Qui vedrai le statistiche.</p>
        </main>
      );
    case 'import':
      return (
        <main className="p-6 overflow-auto">
          <Import />
        </main>
      );
    case 'database':
      return (
        <main className="p-6 overflow-auto">
          <DatabaseManager />
        </main>
      );
    default:
      return (
        <main className="p-6 overflow-auto">
          <h2 className="text-3xl font-semibold mb-4">Pagina non trovata</h2>
        </main>
      );
  }
}
