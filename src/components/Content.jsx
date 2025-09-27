import React from 'react';
import Import from './Import/Import';
import Questions from './Questions/Questions';
import DatabaseManager from './DBManager';
import QuizHome from './Quiz/QuizHome';
import ImagesManager from './Images/ImagesManager';
import StatisticsManager from './Statistic/StatisticsManager';
export default function Content({ activePage }) {
  switch (activePage) {
    case 'home':
      return (
        <main className="p-6 overflow-auto">
          <QuizHome />
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
          <StatisticsManager />
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
    case 'images':
      return (
        <main className="p-6 overflow-auto">
          <ImagesManager />
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
