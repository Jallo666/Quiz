import React from 'react';

export default function ImageList({
  images, selectedImageId, setSelectedImageId,
  sortField, sortOrder, filterField, filterValue
}) {
  // Ordina
  const sortedImages = [...images].sort((a, b) => {
    if (sortField === 'description') {
      if (sortOrder === 'asc') return (a.description || '').localeCompare(b.description || '');
      return (b.description || '').localeCompare(a.description || '');
    } else {
      const timeA = new Date(a[sortField]).getTime();
      const timeB = new Date(b[sortField]).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
  });

  // Filtra
  const filteredImages = sortedImages.filter(img => {
    if (!filterValue) return true;
    const val = filterValue.toLowerCase();
    switch (filterField) {
      case 'description':
        return (img.description || '').toLowerCase().includes(val);
      case 'id':
        return img.id.toLowerCase().includes(val);
      case 'questions':
        return img.questions.some(q => q.toLowerCase().includes(val));
      case 'answers':
        return img.answers.some(a => a.toLowerCase().includes(val));
      case 'createdAt':
        return new Date(img.createdAt).toLocaleDateString().includes(val);
      case 'updatedAt':
        return new Date(img.updatedAt).toLocaleDateString().includes(val);
      default:
        return true;
    }
  });

  return (
    <ul className="list-none max-h-[400px] overflow-y-auto border border-blue-300 rounded p-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
      {filteredImages.length > 0 ? (
        filteredImages.map(img => (
          <li
            key={img.id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer
              hover:bg-blue-200
              ${selectedImageId === img.id ? 'bg-blue-300 font-semibold' : 'bg-white'}
            `}
            onClick={() => setSelectedImageId(img.id)}
          >
            <img src={img.base64} alt="" className="w-16 h-16 object-cover rounded" />
            <div className="flex-1 flex flex-col text-sm">
              <span>{img.description || '(nessuna descrizione)'}</span>
              <span className="text-gray-500">Caricata: {new Date(img.createdAt).toLocaleString()}</span>
              <span className="text-gray-500">Ultima modifica: {new Date(img.updatedAt).toLocaleString()}</span>
            </div>
          </li>
        ))
      ) : (
        <li className="text-center text-blue-400 select-none">Nessuna immagine trovata</li>
      )}
    </ul>
  );
}
