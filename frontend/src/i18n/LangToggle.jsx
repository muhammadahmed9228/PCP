import { useTranslation } from "react-i18next";

const LangToggle = ({ variant = "default" }) => {
  const { i18n } = useTranslation();
  const isUrdu = i18n.resolvedLanguage === "ur";

  const toggleLanguage = () => {
    i18n.changeLanguage(isUrdu ? "en" : "ur");
  };

  const className = variant === "sidebar"
    ? "rounded-lg border border-emerald-300/50 bg-emerald-800/70 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:border-white/70 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-emerald-700"
    : variant === "sidebar-blue"
      ? "rounded-lg border border-blue-300/50 bg-blue-800/70 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:border-white/70 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-blue-700"
    : "rounded bg-blue-600 border border-gray-200 px-3 py-1 text-sm font-medium text-white transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/80";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={isUrdu ? "Switch to English" : "اردو میں تبدیل کریں"}
      className={className}
    >
      <span className={!isUrdu ? "text-white-700" : ""}>EN</span>
      <span className="mx-1 text-gray-400">|</span>
      <span className={isUrdu ? "text-white-700" : ""}>اردو</span>
    </button>
  );
};

export default LangToggle;
