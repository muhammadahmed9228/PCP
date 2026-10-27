import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import ur from "./locales/ur/translation.json";
import aicEn from "./locales/en/aic.json";
import aicUr from "./locales/ur/aic.json";

const URDU_FONT_ID = "aic-noto-naskh-arabic";

const applyDocumentLanguage = (language) => {
  const isUrdu = language === "ur";
  document.documentElement.dir = isUrdu ? "rtl" : "ltr";
  document.documentElement.lang = isUrdu ? "ur" : "en";
  document.documentElement.classList.toggle("font-urdu", isUrdu);

  let fontLink = document.getElementById(URDU_FONT_ID);
  if (isUrdu && !fontLink) {
    fontLink = document.createElement("link");
    fontLink.id = URDU_FONT_ID;
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap";
    document.head.appendChild(fontLink);
  } else if (!isUrdu && fontLink) {
    fontLink.remove();
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { ...en, ...aicEn } },
      ur: { translation: { ...ur, ...aicUr } },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ur"],
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "aic-language",
    },
    interpolation: {
      escapeValue: false,
    },
  });

applyDocumentLanguage(i18n.resolvedLanguage || "en");
i18n.on("languageChanged", (language) => applyDocumentLanguage(language));

export default i18n;
