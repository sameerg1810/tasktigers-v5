// TranslationContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// Create TranslationContext
const TranslationContext = createContext();

// Custom hook to use the TranslationContext
export const useTranslation = () => useContext(TranslationContext);

// TranslationProvider component to wrap the app
export const TranslationProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language is English
  const [supportedLanguages, setSupportedLanguages] = useState([]); // State to store supported languages
  const [loadingLanguages, setLoadingLanguages] = useState(true); // Loading state for languages

  // Fetch supported languages from API
  useEffect(() => {
    const fetchSupportedLanguages = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/v1.0/core/google-translate/languages",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch supported languages");
        }
        const data = await response.json();
        setSupportedLanguages(data.languages); // Assuming 'languages' is an array
      } catch (error) {
        console.error("Error fetching supported languages:", error);
        setSupportedLanguages([]);
      } finally {
        setLoadingLanguages(false); // Stop loading
      }
    };

    fetchSupportedLanguages();
  }, []);

  // Function to change the language
  const changeLanguage = (language) => {
    setSelectedLanguage(language);
  };

  // Function to translate text using API
  const translateText = async (text) => {
    try {
      const response = await fetch(
        "http://localhost:3000/v1.0/core/google-translate/translate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, targetLanguage: selectedLanguage }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to translate text");
      }
      const data = await response.json();
      return data.translatedText; // Assuming 'translatedText' is the result
    } catch (error) {
      console.error("Error translating text:", error);
      return text; // Fallback to original text
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        selectedLanguage,
        changeLanguage,
        supportedLanguages,
        loadingLanguages,
        translateText,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};
