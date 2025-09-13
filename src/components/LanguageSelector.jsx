// LanguageSelector.js
import React from "react";
import "./LanguageSelector.css"; // Import your CSS

const LanguageSelector = ({
  selectedLanguage,
  changeLanguage,
  supportedLanguages,
  loadingLanguages,
}) => {
  if (loadingLanguages) {
    return <div>Loading languages...</div>; // Display loading indicator
  }

  return (
    <div className="language-selector-popup">
      <div className="language-tabs">
        {supportedLanguages.map((language) => (
          <button
            key={language.code}
            className={`language-tab ${
              selectedLanguage === language.code ? "active" : ""
            }`}
            onClick={() => changeLanguage(language.code)}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
