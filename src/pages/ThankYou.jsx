/* eslint-disable */
import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const S3_BASE =
  "https://2023-extramileplay-php.s3.ap-south-1.amazonaws.com/UAT/crosswordnew/";

function resolveAsset(urlOrName) {
  if (!urlOrName) return null;
 
  if (/^https?:\/\//i.test(urlOrName)) return urlOrName;

  return `${S3_BASE}${urlOrName}`;
}

export default function ThankYou() {
  const { theme } = useContext(ThemeContext);

  if (!theme) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );
  }


  const bgDesk = resolveAsset(theme.background_thank_you);
  const bgMob = resolveAsset(theme.background_thank_you_mob);
  const thankYouImg = resolveAsset(theme.thank_you_page);
  const logoImg = resolveAsset(theme.logo);


  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const bgImage = isMobile ? bgMob || bgDesk : bgDesk || bgMob;

  return (
    <main
      className="min-h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-center p-6"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
      }}
    >
    
      {logoImg && (
        <img
          src={logoImg}
          alt={theme.themeName || "Logo"}
          className="mb-4 object-contain"
          style={{ maxWidth: 220 }}
        />
      )}

      {thankYouImg && (
        <img
          src={thankYouImg}
          alt="Thank You"
          className="w-full max-w-[400px] mb-6 object-contain"
        />
      )}

      <h1
        className="text-2xl md:text-4xl font-bold"
        style={{ color: theme.landing_page_title_color || "#000" }}
      >
        {theme.custom_text_thank_you_page || "Thank you for playing!"}
      </h1>

      <button
        onClick={() => (window.location.href = "/")}
        className="mt-6 px-6 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition"
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
