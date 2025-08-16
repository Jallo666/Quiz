import React from 'react';

export default function ImageFilterSort({
  sortField, setSortField,
  sortOrder, setSortOrder,
  filterField, setFilterField,
  filterValue, setFilterValue
}) {
  return (
    <>
      {/* Ordinamento */}
      <div className="flex gap-2 mb-2 items-center">
        <span className="text-blue-700 font-medium">Ordina per:</span>
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          className="border border-blue-300 rounded px-2 py-1"
        >
          <option value="createdAt">Data caricamento</option>
          <option value="updatedAt">Ultima modifica</option>
          <option value="description">Nome / descrizione</option>
        </select>
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="bg-blue-600 text-white px-2 py-1 rounded"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Filtro / ricerca */}
      <div className="flex gap-2 mb-2 items-center">
        <span className="text-blue-700 font-medium">Cerca per:</span>
        <select
          value={filterField}
          onChange={e => setFilterField(e.target.value)}
          className="border border-blue-300 rounded px-2 py-1"
        >
          <option value="description">Descrizione</option>
          <option value="id">ID Immagine</option>
          <option value="questions">ID Domande</option>
          <option value="answers">ID Risposte</option>
          <option value="createdAt">Data caricamento</option>
          <option value="updatedAt">Ultima modifica</option>
        </select>
        <input
          type="text"
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
          className="border border-blue-300 rounded px-2 py-1 flex-1"
          placeholder="Digita il termine da cercare..."
        />
      </div>
    </>
  );
}
