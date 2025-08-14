import React, { useState } from 'react';

export default function ImageInput({
  value,
  onChange,
  placeholder,
  className,
  imgClassName,
  alt,
  defaultMode = 'url', // 'url' | 'repository' | 'upload'
}) {
  const [mode, setMode] = useState(defaultMode);

  const modes = [
    { key: 'url', label: 'URL' },
    { key: 'repository', label: 'Repository' },
    { key: 'upload', label: 'Upload' },
  ];

  return (
    <div className="flex flex-col items-start w-full">
      {/* Toggle a pulsanti */}
      <div className="flex mb-2 space-x-2">
        {modes.map(m => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              mode === m.key
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'url' && (
        <input
          type="text"
          className={`w-full border border-indigo-300 rounded-lg p-3 mb-2 shadow-inner focus:ring-2 focus:ring-indigo-400 transition ${className}`}
          placeholder={placeholder || 'URL immagine (opzionale)'}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}

      {mode === 'repository' && (
        <div className="w-full border border-indigo-300 rounded-lg p-3 mb-2 shadow-inner">
          <span className="text-indigo-400">Seleziona immagine dal repository...</span>
        </div>
      )}

      {mode === 'upload' && (
        <div className="w-full border border-indigo-300 rounded-lg p-3 mb-2 shadow-inner">
          <span className="text-indigo-400">Carica immagine dal computer...</span>
        </div>
      )}

      {value && mode === 'url' && (
        <img
          src={value}
          alt={alt || 'Preview immagine'}
          className={`mb-4 max-h-56 rounded-xl shadow-lg object-contain border border-indigo-200 ${imgClassName}`}
          loading="lazy"
        />
      )}
    </div>
  );
}
