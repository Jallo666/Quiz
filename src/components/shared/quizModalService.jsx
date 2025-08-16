// quizModalService.js
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { FiXCircle } from "react-icons/fi";

function FancyQuizModalInstance({ title, text, subText, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-200 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">{title || "Attenzione"}</h2>
          <button onClick={handleClose}>
            <FiXCircle className="w-6 h-6 text-red-600 hover:text-red-700" />
          </button>
        </div>

        {text && <p className="text-gray-800 text-lg mb-2">{text}</p>}
        {subText && <p className="text-gray-500 text-sm">{subText}</p>}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

// Funzione globale per aprire il modale
export function showQuizModal({ title, text, subText }) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
  };

  root.render(
    <FancyQuizModalInstance
      title={title}
      text={text}
      subText={subText}
      onClose={handleClose}
    />
  );
}
