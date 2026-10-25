import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchOmp, saveOmpDraft, finalizeOmp, clearOmp } from "../store/ompSlice";
import { fetchTeams } from "../../teams/store/teamSlice";
import { fetchGeography } from "../../geography/store/geographySlice";
import { TabSetupLocation, TabPopulation, TabMaterials } from "../components/OmpFormTabs";
import OmpSnapshot from "../components/OmpSnapshot";

const OmpPage = () => {
  const dispatch = useDispatch();
  const { data: ompData, loading } = useSelector((state) => state.omp);
  const { teams } = useSelector((state) => state.teams);
  const { routes } = useSelector((state) => state.geography);
  const context = useSelector((state) => state.context);
  
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const activeAreaId = context?.areaId;

  const methods = useForm({
    defaultValues: ompData || {}
  });

  // Load prerequisites
  useEffect(() => {
    dispatch(fetchTeams());
    if (activeAreaId && activeAreaId.length === 24) {
      dispatch(fetchGeography(activeAreaId));
    }
  }, [dispatch, activeAreaId]);

  // When team and day change, auto-select route assigned to that team & day if available
  useEffect(() => {
    if (selectedTeamId && selectedDay && routes.length > 0) {
      const matchingRoute = routes.find(
        (r) =>
          (r.team?._id === selectedTeamId || r.team === selectedTeamId) &&
          Number(r.campaignDay) === Number(selectedDay)
      );
      if (matchingRoute) {
        setSelectedRouteId(matchingRoute._id);
      }
    }
  }, [selectedTeamId, selectedDay, routes]);

  // Load OMP when Team and Day are selected
  useEffect(() => {
    if (selectedTeamId && selectedDay) {
      dispatch(fetchOmp({ teamId: selectedTeamId, day: selectedDay, routeId: selectedRouteId }));
    } else {
      dispatch(clearOmp());
      methods.reset({});
    }
  }, [selectedTeamId, selectedDay, selectedRouteId, dispatch, methods]);

  // Sync loaded data to form
  useEffect(() => {
    if (ompData) {
      methods.reset(ompData);
      if (ompData.route) setSelectedRouteId(ompData.route);
    }
  }, [ompData, methods]);

  // Filter for Mobile Teams only
  const mobileTeams = teams.filter(t => t.teamType === "Mobile");
  const isFinalized = ompData?.status === "Finalized";

  // Filter routes for this team & day if available, otherwise show all routes for area
  const teamRoutes = routes.filter(
    (r) =>
      (!selectedTeamId || r.team?._id === selectedTeamId || r.team === selectedTeamId) &&
      (!selectedDay || Number(r.campaignDay) === Number(selectedDay))
  );
  const displayedRoutes = teamRoutes.length > 0 ? teamRoutes : routes;

  const handleSaveDraft = async (data) => {
    if (!selectedTeamId || !selectedDay || !selectedRouteId) {
      alert("Please select a Team, Day, and Route before saving.");
      return;
    }
    
    const payload = { ...data, routeId: selectedRouteId };
    await dispatch(saveOmpDraft({ teamId: selectedTeamId, day: selectedDay, data: payload }));
  };

  const handleFinalize = async () => {
    if (window.confirm("Are you sure? Finalizing will lock this OMP.")) {
      await dispatch(finalizeOmp({ teamId: selectedTeamId, day: selectedDay }));
    }
  };

  const tabs = [
    { label: "Route & Team Snapshot (Sec 0-1)", component: <OmpSnapshot data={ompData} /> },
    { label: "Location & Sequence (Sec 2)", component: <TabSetupLocation /> },
    { label: "Population & Coverage", component: <TabPopulation /> },
    { label: "Material Required (Sec 3)", component: <TabMaterials /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Operational Micro Plan (OMP)</h2>
        {context?.areaName && (
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
            Area: <strong className="text-gray-800">{context.areaName} ({context.areaNo})</strong>
          </span>
        )}
      </div>
      
      {/* Selection Header */}
      <div className="bg-white p-4 rounded-lg shadow border grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Mobile Team</label>
          <select 
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select Team --</option>
            {mobileTeams.map(t => (
              <option key={t._id} value={t._id}>Team {t.teamNo} ({t.leader?.name})</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Campaign Day</label>
          <select 
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select Day --</option>
            <option value="1">Day 1</option>
            <option value="2">Day 2</option>
            <option value="3">Day 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assigned Route</label>
          <select 
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            disabled={isFinalized}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          >
            <option value="">-- Select Route --</option>
            {displayedRoutes.map(r => (
              <option key={r._id} value={r._id}>
                Route {r.routeNo}: {r.routeName} (Day {r.campaignDay})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTeamId || !selectedDay ? (
        <div className="bg-white p-8 text-center rounded-lg shadow border">
          <p className="text-gray-500">Please select a Mobile Team and Campaign Day to view or create an OMP.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg flex flex-col">
          <div className={`px-6 py-3 border-b flex justify-between items-center ${isFinalized ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"}`}>
            <span className="font-semibold">Status: {ompData?.status || "No Draft Yet"}</span>
            {isFinalized && <span className="text-sm font-medium">Locked (Read-Only)</span>}
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSaveDraft)} className="flex flex-col flex-1">
              <div className="flex border-b overflow-x-auto bg-gray-50">
                {tabs.map((tab, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === idx ? "border-b-2 border-blue-600 text-blue-700 bg-white" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <fieldset disabled={isFinalized}>
                  {tabs[activeTab].component}
                </fieldset>
              </div>

              <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={isFinalized || loading || !selectedRouteId}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  title={!selectedRouteId ? "Please select an assigned route" : ""}
                >
                  {loading ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={methods.handleSubmit(handleFinalize)}
                  disabled={isFinalized || !ompData?._id}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Finalize & Lock
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}
    </div>
  );
};

export default OmpPage;