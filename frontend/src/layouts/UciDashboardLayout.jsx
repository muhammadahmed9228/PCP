import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { logoutUser } from "../features/auth/store/authSlice";
import { bootstrapContext, clearContext } from "../features/context/store/contextSlice";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import CampaignListPage from "../features/campaigns/pages/CampaignListPage";
import CampaignHistoryPage from "../features/campaigns/pages/CampaignHistoryPage";
import AicManagementPage from "../features/aics/pages/AicManagementPage";
import AreaManagementPage from "../features/areas/pages/AreaManagementPage"
import AmpReviewPage from "../features/amp/pages/AmpReviewPage";
import UcmpPage from "../features/ucmp/pages/UcmpPage"
import CampaignActivationPage from "../features/campaigns/pages/CampaignActivationPage";
import Form2BPage from "../features/form2b/pages/Form2BPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import DashboardHeader from "../components/layouts/DashboardHeader";
import ScrollToTopButton from "../components/shared/ScrollToTopButton";
import { useTranslation } from "react-i18next";
import "../i18n/i18n";
import LangToggle from "../i18n/LangToggle";

const UciDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(bootstrapContext());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearContext());
    navigate("/login");
  };

  const navItems = [
    { key: "campaigns", path: "/dashboard/uci" },
    { key: "manageAics", path: "/dashboard/uci/aics" },
    { key: "manageAreas", path: "/dashboard/uci/areas" },
    { key: "ucmp", path: "/dashboard/uci/ucmp" },
    { key: "ampReviewNav", path: "/dashboard/uci/amp-reviews" },
    { key: "campaignActivation", path: "/dashboard/uci/activation" },
    { key: "form2b", path: "/dashboard/uci/form2b" },
    { key: "campaignHistory", path: "/dashboard/uci/history" },
    { key: "My Profile", path: "/dashboard/uci/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-blue-700 text-white shadow-md flex flex-col">
        <div className="p-6 border-b border-blue-600">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-white">{t("uciPortal")}</h1>
            <LangToggle variant="sidebar-blue" />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`block px-4 py-2 rounded-md ${location.pathname === item.path
                ? "bg-blue-500 text-white font-medium"
                : "text-blue-50 hover:bg-blue-600"
                }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <main id="uci-dashboard-content" className="min-w-0 flex-1 overflow-y-auto"><DashboardHeader onLogout={handleLogout} showLanguageToggle={false} /><div className="p-4 md:p-8">
        <Routes>
          <Route path="/" element={<CampaignListPage />} />
          <Route path="/history" element={<CampaignHistoryPage />} />
          <Route path="/aics" element={<AicManagementPage />} />
          <Route path="/areas" element={<AreaManagementPage />} />
          <Route path="/amp-reviews" element={<AmpReviewPage />} />
          <Route path="/ucmp" element={<UcmpPage />} />
          <Route path="/activation" element={<CampaignActivationPage />} />
          <Route path="/form2b" element={<Form2BPage />} />
          <Route path="/profile" element={<ProfilePage />} />


        </Routes>
      </div></main><ScrollToTopButton targetId="uci-dashboard-content" />
    </div>
  );
};

export default UciDashboardLayout;
