import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/store/authSlice";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import CampaignListPage from "../features/campaigns/pages/CampaignListPage";
import AicManagementPage from "../features/aics/pages/AicManagementPage";
import AreaManagementPage from "../features/areas/pages/AreaManagementPage"
import UcmpPage from "../features/ucmp/pages/UcmpPage"
import CampaignActivationPage from "../features/campaigns/pages/CampaignActivationPage";
import Form2BPage from "../features/form2b/pages/Form2BPage";

const UciDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const navItems = [
    { name: "Campaigns", path: "/dashboard/uci" },
    { name: "Manage AICs", path: "/dashboard/uci/aics" },
    { name: "Manage Areas", path: "/dashboard/uci/areas" },
    { name: "UCMP", path: "/dashboard/uci/ucmp" },
    { name: "Campaign Activation", path: "/dashboard/uci/activation" },
    { name: "Form 2B", path: "/dashboard/uci/form2b" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">UCI Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-4 py-2 rounded-md ${location.pathname === item.path
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CampaignListPage />} />
          <Route path="/aics" element={<AicManagementPage />} />
          <Route path="/areas" element={<AreaManagementPage />} />
          <Route path="/ucmp" element={<UcmpPage />} />
          <Route path="/activation" element={<CampaignActivationPage />} />
          <Route path="/form2b" element={<Form2BPage />} />


        </Routes>
      </main>
    </div>
  );
};

export default UciDashboardLayout;
