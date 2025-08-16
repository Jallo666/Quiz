import React from 'react';

import ImageRender from '../Images/ImageRender';

export default function AnswersList({ answers }) {
  return (
    <ul className="ml-6 list-disc text-base space-y-3">
      {answers.map((a, i) => (
        <li
          key={i}
          className={`flex flex-col ${a.correct ? 'text-green-700 font-semibold' : 'text-gray-700'} 
                      rounded-lg p-3 bg-white shadow-sm border border-gray-200
                      hover:shadow-md transition-shadow duration-300`}
        >
          <span className="select-text">{a.text}</span>

          {a.img && (

            <ImageRender
              src={a.img}
              alt={`Immagine risposta ${i + 1}`}
              className={"max-h-20 rounded-lg mt-2 object-contain border border-gray-300 shadow-sm"}
              loading="lazy"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
