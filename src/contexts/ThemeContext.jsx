import React, { createContext, useState, useEffect, useCallback } from "react";

export const ThemeContext = createContext({
  theme: null,
  session: null,
  loading: true,
  error: null,
  refreshTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const loadTheme = useCallback(async () => {
    const sessionId = localStorage.getItem("sessionId");
    const organizationId = localStorage.getItem("organizationId");
    const role = localStorage.getItem("role") || "PUBLIC_USER";

    if (!sessionId || !organizationId) {
      setTheme(null);
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const url = `https://staging-games.extramileplay.com/crossword_new/admin/API/getThemeData.php?sessionId=${sessionId}&organizationId=${organizationId}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!data) throw new Error("Theme API returned empty");

      setTheme(data.theme || data);

      setSession({
        sessionId,
        organizationId,
        role,
        themeData: data,
      });

      setError(null);
    } catch (err) {
      console.error("Theme load error:", err);
      setError("Failed to load theme data");
      setTheme(null);
      setSession(null);
    }

    setLoading(false);
  }, []);


  const refreshTheme = () => {
    window.dispatchEvent(new Event("refresh-theme"));
  };

 
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  
  useEffect(() => {
    const handler = () => loadTheme();
    window.addEventListener("refresh-theme", handler);
    return () => window.removeEventListener("refresh-theme", handler);
  }, [loadTheme]);

  return (
    <ThemeContext.Provider value={{ theme, session, loading, error, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
