import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import { logoutUser } from "../features/auth/store/authSlice";
import { bootstrapContext, clearContext } from "../features/context/store/contextSlice";
import TallySheetPage from "../features/tallySheet/pages/TallySheetPage";
import FixedSheetPage from "../features/fixedSheet/pages/FixedSheetPage";
import TransitSheetPage from "../features/transitSheet/pages/TransitSheetPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import DashboardHeader from "../components/layouts/DashboardHeader";
import ScrollToTopButton from "../components/shared/ScrollToTopButton";

const FieldTeamDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  useEffect(() => { dispatch(bootstrapContext()); }, [dispatch]);
  const handleLogout = async () => { await dispatch(logoutUser()); dispatch(clearContext()); navigate("/team/login"); };
  const defaultSheet = user?.teamType === "Fixed" ? "fixed-sheet" : user?.teamType === "Transit" ? "transit-sheet" : "tally-sheet";
  const defaultSheetPath = `/dashboard/team/${defaultSheet}`;

  return <div className="min-h-screen bg-gray-50 flex flex-col"><DashboardHeader onLogout={handleLogout} /><main id="field-dashboard-content" className="flex-1 p-2 md:p-6 overflow-y-auto w-full max-w-6xl mx-auto"><Routes><Route index element={<Navigate to={defaultSheetPath} replace />} /><Route path="tally-sheet" element={<TallySheetPage />} /><Route path="fixed-sheet" element={<FixedSheetPage />} /><Route path="transit-sheet" element={<TransitSheetPage />} /><Route path="profile" element={<ProfilePage />} /><Route path="*" element={<Navigate to={defaultSheetPath} replace />} /></Routes></main><ScrollToTopButton targetId="field-dashboard-content" /></div>;
};

export default FieldTeamDashboardLayout;
