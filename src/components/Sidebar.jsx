import React, { useState } from "react";
import { version } from "../../package.json";

export default function Sidebar({ isOpen, onClose, activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: "Home", page: "home", icon: "🏠" },
    { label: "Domande", page: "questions", icon: "❓" },
    { label: "Statistiche", page: "stats", icon: "📊" },
    { label: "Import", page: "import", icon: "⬆️" },
    { label: "Database", page: "database", icon: "🗄️" },
    { label: "Immagini", page: "images", icon: "🖼️" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 
          bg-white border-r border-gray-200
          text-gray-800 p-4 flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:shadow-none
          ${collapsed ? "w-20" : "w-64"}
        `}
        aria-label="Sidebar navigation"
      >
        <div>
          {/* Header con toggle */}
          <div className="flex items-center justify-between mb-8">
            {!collapsed && (
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                Quiz <span className="text-blue-600">App</span>
              </h1>
            )}
            <button
              onClick={() => {
                if (onClose) {
                  onClose();
                }
                setCollapsed(!collapsed);
              }}
              className="p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Toggle sidebar"
            >
              {collapsed ? "≡" : "×"}
            </button>
          </div>

          {/* Menu */}
          <nav className="flex flex-col space-y-1" role="navigation">
            {menuItems.map(({ label, page, icon }) => (
              <button
                key={page}
                onClick={() => {
                  onNavigate(page);
                  onClose();
                }}
                className={`
                  group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-all duration-200
                  ${
                    activePage === page
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
                aria-current={activePage === page ? "page" : undefined}
                title={collapsed ? label : undefined}
              >
                <span
                  className={`
                    text-base transform transition-transform duration-200 
                    group-hover:scale-110 group-hover:text-blue-600
                    ${activePage === page ? "text-blue-600" : ""}
                  `}
                >
                  {icon}
                </span>
                {!collapsed && (
                  <span
                    className={`
                      transition-colors duration-200
                      group-hover:text-blue-600
                      ${activePage === page ? "text-blue-700" : ""}
                    `}
                  >
                    {label}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <footer
          className={`mt-6 text-center text-gray-400 text-xs select-none transition-all ${
            collapsed ? "text-[10px]" : ""
          }`}
        >
          {collapsed ? `v${version}` : `Versione ${version}`}
        </footer>
      </aside>
    </>
  );
}
