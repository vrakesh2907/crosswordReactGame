import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const { theme, loading, error } = useContext(ThemeContext);
  const navigate = useNavigate(); 

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!theme) return <div className="p-8 text-center">Theme not available</div>;

  const bgVars = {
    "--bg-desk": `url(${theme.background_desk})`,
    "--bg-mob": `url(${theme.background_mob})`,
  };

  const buttonStyle = {
    backgroundColor: theme.button_color || "#e46854",
    color: theme.button_Textcolor || "#ffffff",
  };

  return (
    <main
      role="main"
      className="min-h-screen bg-[#fef6ec] flex items-center justify-center py-12 px-4 bg-responsive"
      style={bgVars}
    >
      <div className="w-full mx-auto flex flex-col items-center gap-6">

        <img
          src={theme.logo}
          alt={theme.themeName || "Logo"}
          className="mb-2 drop-shadow-lg"
          style={{ width: "520px", maxWidth: "40%", height: "auto" }}
        />

        {theme.landing_image && (
          <img
            src={theme.landing_image}
            alt="Hero"
            className="w-48 md:w-64 lg:w-80 mb-2"
          />
        )}

      
        <button
          onClick={() => navigate("/rules")}
          style={buttonStyle}
          className="px-6 py-3 font-bold rounded-lg text-lg hover:opacity-90 transition"
        >
          BEGIN PLAY
        </button>
      </div>
    </main>
  );
}
