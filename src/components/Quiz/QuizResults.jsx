// QuizResults.jsx
import React from "react";

export default function QuizResults({ results }) {
  if (!results || results.length === 0) {
    return <p className="text-gray-600 text-sm">Nessun risultato da mostrare.</p>;
  }

  return (
    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-300">
      <h4 className="font-semibold text-green-700 mb-2">Risultati Quiz</h4>
      <div className="overflow-auto max-h-64">
        <table className="min-w-full divide-y divide-green-300">
          <thead className="bg-green-100 border-b border-green-300">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">ID Domanda</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">Risposta Selezionata</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-green-200">
            {results.map((r, i) => (
              <tr key={i} className="hover:bg-green-50">
                <td className="px-4 py-2 text-sm text-green-900">{r.questionId}</td>
                <td className="px-4 py-2 text-sm text-green-900">
                  {r.answerIndex !== null ? r.answerIndex + 1 : "Non selezionata"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
