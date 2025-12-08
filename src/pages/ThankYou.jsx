/* eslint-disable */
import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import TopHeader from "../pages/TopHeader";

const DEFAULT_THANK_YOU_GIF =
  "https://staging-games.extramileplay.com/crossword_new/images/thankyou.gif";

export default function ThankYou() {
  const { theme } = useContext(ThemeContext);

  if (!theme) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );
  }

  
  const bgDesk = theme.background;
  const bgMob = theme.background_mob;

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

  const bgImage = isMobile ? bgMob || bgDesk : bgDesk || bgMob;

  
  const thankYouImg = DEFAULT_THANK_YOU_GIF;


  const finalScore = localStorage.getItem("finalScore") || 0;
  const totalPoints = localStorage.getItem("totalPoints") || 0;

  const finalTimeRaw = localStorage.getItem("finalTime") || "00:00";
  const [mm, ss] = finalTimeRaw.split(":").map((v) => parseInt(v, 10) || 0);
  const finalMinutes = mm + ss / 60;

  return (
    <main
      className="min-h-screen w-screen flex flex-col items-center justify-start bg-cover bg-center bg-no-repeat text-center p-6 relative"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
      }}
    >

         <TopHeader forceExternalBack />
     
      {/* {theme.logo && (
        <img
          src={theme.logo}
          alt="Logo"
          className="mt-4 mb-6 object-contain"
          style={{ maxWidth: 180 }}
        />
      )} */}

    
      <img
        src={thankYouImg}
        alt="Thank You"
        className="w-full mt-40 max-w-[400px] mb-6 object-contain drop-shadow-xl"
      />

     
      <h1
        className="text-2xl md:text-4xl font-bold mb-6 px-4"
        style={{ color: theme.landing_page_title_color || "#000" }}
      >
        {theme.custom_text_thank_you_page || "Thank you for playing!"}
      </h1>

   
      <p className="text-lg md:text-2xl font-semibold mb-8">
        You have scored <span className="text-green-700">{finalScore}</span> out
        of <span className="text-blue-700">{totalPoints}</span> in{" "}
        <span className="text-red-700">
          {Number(finalMinutes).toFixed(2)} minutes
        </span>
      </p>

     
      <button
        onClick={() => (window.location.href = "/")}
        className="px-8 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition shadow-xl"
        style={{
          backgroundColor: theme.button_color || "#f06c60",
          color: theme.button_Textcolor || "#fff",
        }}
      >
        PLAY AGAIN
      </button>
    </main>
  );
}
