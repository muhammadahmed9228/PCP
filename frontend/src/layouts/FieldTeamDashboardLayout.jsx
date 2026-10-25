import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/store/authSlice";
import { bootstrapContext, clearContext } from "../features/context/store/contextSlice";
import { useNavigate } from "react-router-dom";
import TallySheetPage from "../features/tallySheet/pages/TallySheetPage";
import FixedSheetPage from "../features/fixedSheet/pages/FixedSheetPage";
import TransitSheetPage from "../features/transitSheet/pages/TransitSheetPage";

const FieldTeamDashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { areaName, campaign, loading } = useSelector((state) => state.context);

  useEffect(() => {
    dispatch(bootstrapContext());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearContext());
    navigate("/team/login");
  };

  const renderAssignedSheet = () => {
    if (loading) return <div className="p-8 text-center text-gray-600">Loading your assignment...</div>;
    if (user?.teamType === "Mobile") return <TallySheetPage />;
    if (user?.teamType === "Fixed") return <FixedSheetPage />;
    if (user?.teamType === "Transit") return <TransitSheetPage />;
    return <div className="p-8 text-center text-red-600">Unrecognized Team Type</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white shadow-md px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-lg font-bold leading-tight">
            Team {user?.teamNo} ({user?.teamType})
          </h1>
          <p className="text-xs text-blue-200">
            {campaign?.campaignName || "Active Campaign"} • {areaName || "Assigned Area"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-900 border border-blue-600"
        >
          Logout
        </button>
      </header>


      <main className="flex-1 p-2 md:p-6 overflow-y-auto w-full max-w-4xl mx-auto">
        {renderAssignedSheet()}
      </main>
    </div>
  );
};

export default FieldTeamDashboardLayout;

// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { logoutUser } from "../features/auth/store/authSlice";
// import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import TallySheetPage from "../features/tallySheet/pages/TallySheetPage";
// import FixedSheetPage from "../features/fixedSheet/pages/FixedSheetPage";
// import TransitSheetPage from "../features/transitSheet/pages/TransitSheetPage";

// const FieldTeamDashboardLayout = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector(state => state.auth);

//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     navigate("/team/login");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Mobile-friendly Header */}
//       <header className="bg-blue-700 text-white shadow-md px-4 py-3 flex justify-between items-center sticky top-0 z-50">
//         <div>
//           <h1 className="text-lg font-bold leading-tight">Team {user?.teamNo}</h1>
//           <p className="text-xs text-blue-200">{user?.teamType} Team</p>
//         </div>
//         <button onClick={handleLogout} className="bg-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-900 border border-blue-600">
//           Logout
//         </button>
//       </header>

//       {/* Main Content (Optimized for touch/scrolling) */}
//       <main className="flex-1 p-2 md:p-6 overflow-y-auto w-full max-w-4xl mx-auto">
//         <Routes>
//           <Route
//             index
//             element={
//               <Navigate
//                 to={
//                   user?.teamType === "Fixed"
//                     ? "fixed-sheet"
//                     : user?.teamType === "Transit"
//                       ? "transit-sheet"
//                       : "tally-sheet"
//                 }
//                 replace
//               />
//             }
//           />
//           <Route path="tally-sheet" element={<TallySheetPage />} />
//           <Route path="fixed-sheet" element={<FixedSheetPage />} />
//           <Route path="transit-sheet" element={<TransitSheetPage />} />
//         </Routes>
//       </main>
//     </div>
//   );
// };




// // const ROUTE_MAP = {
// //   Fixed: "fixed-sheet",
// //   Transit: "transit-sheet",
// //   Tally: "tally-sheet",
// // };

// // const defaultRoute = ROUTE_MAP[user?.teamType] || "tally-sheet";

// // <Routes>
// //   <Route index element={<Navigate to={defaultRoute} replace />} />
// //   <Route path="tally-sheet" element={<TallySheetPage />} />
// //   <Route path="fixed-sheet" element={<FixedSheetPage />} />
// //   <Route path="transit-sheet" element={<TransitSheetPage />} />
// // </Routes>

// export default FieldTeamDashboardLayout;

