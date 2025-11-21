import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EditorSwitcher = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const buttons = [
    {
      label: "Anzeige-Editor",
      url: "/traueranzeigen/erstellen",
    },
    {
      label: "Gedenkseite erstellen",
      url: "/gedenkseite/erstellen",
    },
  ];

  return (
    <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center py-6">
      {buttons.map((btn) => {
        const isActive = location.pathname === btn.url;

        return (
          <button
            key={btn.url}
            onClick={() => navigate(btn.url)}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold transition-all duration-200 
              ${
                isActive
                  ? "bg-black text-white shadow-lg scale-105"
                  : "bg-white text-gray-800 border border-gray-200 hover:bg-blue-50 hover:scale-105"
              }`}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
};

export default EditorSwitcher;
