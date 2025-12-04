import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

export default function RulesPage() {
  const { theme, loading } = useContext(ThemeContext);
  const navigate = useNavigate();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
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
    <div
      className="min-h-screen bg-[length:100%_100%] p-6 md:p-12 bg-responsive flex items-center justify-center"
      style={bgVars}
    >
      <div className="w-full max-w-3xl mx-auto text-center px-4">

        {/* Logo */}
        <div className="mx-auto mb-4">
          <div className="rounded-full mx-auto flex items-center justify-center">
            <img
              src={theme.logo}
              alt={theme.themeName || "Logo"}
              style={{ width: "200px", height: "200px" }}
              className="object-contain"
            />
          </div>
        </div>

       
        <div
          className="text-center font-bold p-[10px] rounded-[10px] inline-block w-[150px] text-base sm:text-lg md:text-xl"
          style={buttonStyle}
        >
          Rules
        </div>

      
        <div className="mt-6 px-4 md:px-0">
          <ul className="w-full md:w-3/4 mx-auto text-left space-y-6">
            {theme.rules.map((rule, index) => (
              <li
                key={index}
                className="flex items-start gap-4 text-base md:text-lg lg:text-xl"
              >
                <img
                  src="https://games.extramileplay.com/crossword/images/arrow.png"
                  alt="bullet"
                  className="mt-1 flex-shrink-0 w-5 h-5"
                />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

       
        <div className="mt-10">
          <button
            onClick={() => navigate("/game")}
            className="w-full sm:w-auto px-8 py-3 font-bold rounded-lg text-lg hover:opacity-85 transition shadow-md"
            style={{
              ...buttonStyle,
              boxShadow: "0 4px 0 rgba(59,130,246,0.12) inset",
            }}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
