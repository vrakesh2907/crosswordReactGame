import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  theme: null,
  session: null,
  loading: true,
  error: null,
});

// const sessionId = process.env.REACT_APP_SESSION_ID;
// const organizationId = process.env.REACT_APP_ORG_ID;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadTheme() {
    try {
      const url = 
        `https://staging-games.extramileplay.com/crossword_new/admin/API/getThemeData.php?sessionId=4b13c138-8ccf-4331-8430-3b2d5c746a24&organizationId=9991e14e-2305-4086-8d75-9cd2e35913bc`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      setTheme({ ...data });
      setSession({ ...data });
    } catch (err) {
      console.error("Theme load error:", err);
      setError("Failed to load theme data");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTheme();

    // OPTIONAL auto-refresh every 30s (remove if not needed)
   // const interval = setInterval(loadTheme, 30000);

  //  return () => clearInterval(interval);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, session, loading, error }}>
      {children}
    </ThemeContext.Provider>
  );
}
