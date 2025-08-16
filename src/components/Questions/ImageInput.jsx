import React, { useState } from 'react';
import ImageUploader from '../Images/ImageUploader';
import ImageRender from '../Images/ImageRender';
import ImageRepository from './ImageRepository';

export default function ImageInput({
  value,
  onChange,
  placeholder,
  className,
  imgClassName,
  alt,
  defaultMode = 'url',
  question = "",
  answer = "",
}) {
  const [mode, setMode] = useState(defaultMode);

  const modes = [
    { key: 'url', label: 'URL' },
    { key: 'repository', label: 'Repository' },
    { key: 'upload', label: 'Upload' },
  ];

  function handleImageUploaded(imageId) {
    onChange('imageId:' + imageId);
    setMode('repository');
  }

  function handleRepositoryConfirm(image) {
    if (!image) return;
    onChange('imageId:' + image.id);
    setMode('repository');
  }

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex mb-2 space-x-2">
        {modes.map(m => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${mode === m.key
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
        <ImageRepository
          value={value}
          onConfirm={handleRepositoryConfirm}
        />
      )}

      {mode === 'upload' && (
        <ImageUploader question={question} answer={answer} onUploaded={handleImageUploaded} />
      )}

      {value && mode !== 'upload' && (
        <ImageRender
          src={value}
          alt={alt || 'Preview immagine'}
          className={imgClassName}
        />
      )}
    </div>
  );
}
