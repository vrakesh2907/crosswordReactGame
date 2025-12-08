import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function TopHeader({ logo, forceExternalBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const showBack = location.pathname !== "/auth";

  const handleBack = () => {
    if (forceExternalBack || location.pathname === "/") {
      window.location.href = "https://staging.extramileplay.com/";
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full flex items-center p-4 gap-3 z-50 bg-transparent">

      
      <img
        src="https://staging-games.extramileplay.com/imp/logo/extramileplay-new.png"
        alt="Brand Logo"
        className="w-[220px] h-auto cursor-pointer"
        onClick={() => navigate("/")}
      />

      
      {showBack && (
        <div className="w-px h-8 bg-gray-400 opacity-100"></div>
      )}

     
      {showBack && (
        <button
          onClick={handleBack}
          className="px-3 py-1.5 font-medium bg-[#f06c60] text-white rounded-lg shadow hover:bg-opacity-80 transition"
        >
          Back
        </button>
      )}
    </div>
  );
}
