import { useEffect, useState } from "react";
import "./GoogleTranslate.css";

const GoogleTranslate = ({ showTranslate }) => {
  const [isInitialized, setIsInitialized] = useState(false); // Track if the widget is initialized
  const [scriptLoaded, setScriptLoaded] = useState(false); // Track if the script is loaded

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && !isInitialized) {
      window.googleTranslateElementInit = function () {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages:
                "en,hi,bn,te,mr,ta,gu,ur,pa,kn,ml,or,as,sa,kok,mai,doi,brx,sat,ks,sd",
              layout: window.google.translate.TranslateElement.InlineLayout
                ? window.google.translate.TranslateElement.InlineLayout.SIMPLE
                : undefined,
            },
            "google_translate_element",
          );
          setIsInitialized(true);
        }
      };

      // Initialize immediately if the Google Translate API is ready
      if (window.google?.translate) {
        window.googleTranslateElementInit();
      }
    }
  }, [scriptLoaded, isInitialized]);

  return (
    <div id="google_translate_element" className={showTranslate ? "show" : ""}>
      {!isInitialized && <p>Loading translation...</p>}
    </div>
  );
};

export default GoogleTranslate;
