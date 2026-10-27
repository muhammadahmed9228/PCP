import { useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/store/authSlice";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import TeamManagementPage from "../features/teams/pages/TeamManagementPage";
import GeographyManagementPage from "../features/geography/pages/GeographyManagementPage";
import AmpPage from "../features/amp/pages/AmpPage";
import OmpPage from "../features/omp/pages/OmpPage";
import Form2APage from "../features/form2a/pages/Form2APage";
import { useEffect } from "react";
import { bootstrapContext, clearContext } from "../features/context/store/contextSlice";
import { useTranslation } from "react-i18next";
import "../i18n/i18n";
import LangToggle from "../i18n/LangToggle";
import ProfilePage from "../features/profile/pages/ProfilePage";
import DashboardHeader from "../components/layouts/DashboardHeader";
import ScrollToTopButton from "../components/shared/ScrollToTopButton";

const AicDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(bootstrapContext());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser("AIC"));
    dispatch(clearContext());
    navigate("/aic/login");
  };

  const navItems = [
    { key: "fieldTeams", path: "/dashboard/aic/teams" },
    { key: "geography", path: "/dashboard/aic/geography" },
    { key: "areaMicroPlan", path: "/dashboard/aic/amp" },
    { key: "operationalMicroPlan", path: "/dashboard/aic/omp" },
    { key: "form2a", path: "/dashboard/aic/form2a" },
    { key: "My Profile", path: "/dashboard/aic/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="w-full bg-emerald-700 text-white shadow-md md:min-h-screen md:w-64 flex flex-col">
        <div className="border-b border-emerald-600 p-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-white">{t("aicPortal")}</h1>
            <LangToggle variant="sidebar" />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`block rounded-md px-4 py-2 ${location.pathname === item.path
                  ? "bg-emerald-500 text-white font-medium"
                  : "text-emerald-50 hover:bg-emerald-600"
                }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

      </div>
      <main id="aic-dashboard-content" className="min-w-0 flex-1 overflow-y-auto"><DashboardHeader accent="green" onLogout={handleLogout} showLanguageToggle={false} /><div className="p-4 md:p-8">
        <Routes>
          <Route path="/teams" element={<TeamManagementPage />} />
          <Route path="/geography" element={<GeographyManagementPage />} />
          <Route path="/amp" element={<AmpPage />} />
          <Route path="/omp" element={<OmpPage />} />
          <Route path="/form2a" element={<Form2APage />} />
          <Route path="/profile" element={<ProfilePage />} />


        </Routes>
      </div></main><ScrollToTopButton targetId="aic-dashboard-content" />
    </div>
  );
};

export default AicDashboardLayout;
