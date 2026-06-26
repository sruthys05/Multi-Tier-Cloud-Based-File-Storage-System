import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
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
    if (
      user?.theme &&
      (user.theme === "light" || user.theme === "dark") &&
      user.theme !== theme
    ) {
      setTheme(user.theme);
    }
  }, [user?.theme, theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";

      if (user) {
        updateTheme(newTheme).catch(() => {});
      }

      return newTheme;
    });
  }, [user, updateTheme]);

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