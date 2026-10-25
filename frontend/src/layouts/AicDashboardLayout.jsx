import React from "react";
import { useDispatch, useSelector } from "react-redux";
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

const AicDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { areaName, areaNo, campaign } = useSelector((state) => state.context);

  useEffect(() => {
    dispatch(bootstrapContext());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser("AIC"));
    dispatch(clearContext());
    navigate("/aic/login");
  };

  const navItems = [
    { name: "Field Teams", path: "/dashboard/aic/teams" },
    { name: "Geography (Routes/Points)", path: "/dashboard/aic/geography" },
    { name: "Area Micro Plan (AMP)", path: "/dashboard/aic/amp" },
    { name: "Operational Micro Plan (OMP)", path: "/dashboard/aic/omp" },
    { name: "Form 2A", path: "/dashboard/aic/form2a" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">AIC Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-4 py-2 rounded-md ${location.pathname === item.path
                  ? "bg-green-50 text-green-700 font-medium"
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
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/teams" element={<TeamManagementPage />} />
          <Route path="/geography" element={<GeographyManagementPage />} />
          <Route path="/amp" element={<AmpPage />} />
          <Route path="/omp" element={<OmpPage />} />
          <Route path="/form2a" element={<Form2APage />} />


        </Routes>
      </main>
    </div>
  );
};

export default AicDashboardLayout;
