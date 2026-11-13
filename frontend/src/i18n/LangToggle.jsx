import { useTranslation } from "react-i18next";

const LangToggle = ({ variant = "default" }) => {
  const { i18n } = useTranslation();
  const isUrdu = i18n.resolvedLanguage === "ur";

  const toggleLanguage = () => {
    i18n.changeLanguage(isUrdu ? "en" : "ur");
  };

  const className = variant === "sidebar-navy"
    ? "rounded-lg border border-white/30 bg-black/20 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:border-white/70 hover:bg-black/30 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-[#173F70]"
    : variant === "sidebar-teal"
      ? "rounded-lg border border-white/30 bg-black/15 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:border-white/70 hover:bg-black/25 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-[#008C95]"
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
