import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, updateTheme } = useAuth();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("datavault-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  // Apply theme and save it
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("datavault-theme", theme);
  }, [theme]);

  // Sync theme from logged-in user
  useEffect(() => {
    if (user && user.theme) {
      if (user.theme === "light" || user.theme === "dark") {
        if (user.theme !== theme) {
          setTheme(user.theme);
        }
      }
    }
  }, [user, theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (user) {
      updateTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};