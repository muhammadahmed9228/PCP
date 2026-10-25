import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchTransitSheet, saveTransitSheetDraft, finalizeTransitSheet, clearTransitSheet } from "../store/transitSheetSlice";
import { fetchTeams } from "../../teams/store/teamSlice";
import { fetchGeography } from "../../geography/store/geographySlice";
import TransitTallyUI from "../components/TransitTallyUI";
import TransitSheetSnapshot from "../components/TransitSheetSnapshot";
import SectionLogistics from "../../tallySheet/components/SectionLogistics";

const TransitSheetPage = () => {
  const dispatch = useDispatch();
  const { data: sheetData, loading } = useSelector((state) => state.transitSheet);
  const { teams } = useSelector((state) => state.teams);
  const { points } = useSelector((state) => state.geography);
  const context = useSelector((state) => state.context);

  const { user } = useSelector(state => state.auth);
  const isFieldTeam = user?.role === "FieldTeam";

  const [selectedTeamId, setSelectedTeamId] = useState(isFieldTeam ? user._id : "");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedPointId, setSelectedPointId] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const activeAreaId = context?.areaId;

  useEffect(() => {
    if (!isFieldTeam) dispatch(fetchTeams());
    if (activeAreaId) dispatch(fetchGeography(activeAreaId));
  }, [dispatch, isFieldTeam, activeAreaId]);

  const methods = useForm({
    defaultValues: sheetData || { vaccinatedChildrenCount: 0 }
  });

  const transitTeams = teams.filter(t => t.teamType === "Transit");
  const transitPoints = points.filter(p => p.pointType === "Transit");

  // Auto-detect assigned Transit Point when team and day change
  useEffect(() => {
    if (selectedTeamId && selectedDay && transitPoints.length > 0) {
      const matchingPoint = transitPoints.find(
        (p) =>
          (p.team?._id === selectedTeamId || p.team === selectedTeamId) &&
          Number(p.campaignDay) === Number(selectedDay)
      );
      if (matchingPoint) {
        setSelectedPointId(matchingPoint._id);
      }
    }
  }, [selectedTeamId, selectedDay, transitPoints]);

  useEffect(() => {
    if (selectedTeamId && selectedDay) {
      dispatch(fetchTransitSheet({ teamId: selectedTeamId, day: selectedDay, pointId: selectedPointId }));
    } else {
      dispatch(clearTransitSheet());
      methods.reset({ vaccinatedChildrenCount: 0 });
    }
  }, [selectedTeamId, selectedDay, selectedPointId, dispatch, methods]);

  useEffect(() => {
    if (sheetData) {
      methods.reset(sheetData);
      if (sheetData.point) setSelectedPointId(sheetData.point);
    }
  }, [sheetData, methods]);

  const isFinalized = sheetData?.status === "Finalized";

  // Filter transit points for this team & day if available, otherwise show all transit points
  const teamPoints = transitPoints.filter(
    (p) =>
      (!selectedTeamId || p.team?._id === selectedTeamId || p.team === selectedTeamId) &&
      (!selectedDay || Number(p.campaignDay) === Number(selectedDay))
  );
  const displayedPoints = teamPoints.length > 0 ? teamPoints : transitPoints;

  const handleSaveDraft = async (data) => {
    if (!selectedTeamId || !selectedDay || !selectedPointId) {
      alert("Please select a Transit Point before saving.");
      return;
    }
    const payload = { ...data, pointId: selectedPointId };
    await dispatch(saveTransitSheetDraft({ teamId: selectedTeamId, day: selectedDay, data: payload }));
  };

  const handleFinalize = async () => {
    if (window.confirm("Finalize Transit Sheet? This will lock the tally.")) {
      await dispatch(finalizeTransitSheet({ teamId: selectedTeamId, day: selectedDay }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Transit Team Sheet</h2>
        {context?.areaName && (
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
            Area: <strong className="text-gray-800">{context.areaName} ({context.areaNo})</strong>
          </span>
        )}
      </div>

      {/* Target Selection Header */}
      <div className="bg-white p-4 rounded-lg shadow border grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {!isFieldTeam && (
          <div>
            <label className="block text-sm font-medium">Select Transit Team</label>
            <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded">
              <option value="">-- Choose --</option>
              {transitTeams.map(t => <option key={t._id} value={t._id}>Team {t.teamNo} ({t.leader?.name})</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Campaign Day</label>
          <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded">
            <option value="">-- Day --</option>
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Transit Point</label>
          <select value={selectedPointId} onChange={e => setSelectedPointId(e.target.value)} disabled={isFinalized} className="mt-1 w-full px-3 py-2 border rounded disabled:bg-gray-100">
            <option value="">-- Select Point --</option>
            {displayedPoints.map(p => <option key={p._id} value={p._id}>{p.pointNo} - {p.pointName} (Day {p.campaignDay})</option>)}
          </select>
        </div>
      </div>

      {!selectedTeamId || !selectedDay ? (
        <div className="bg-white p-8 text-center rounded border shadow text-gray-500">
          Select a Transit Team and Day to view or fill the Transit Sheet.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg flex flex-col">
          <div className={`px-6 py-3 border-b flex justify-between items-center ${isFinalized ? "bg-red-50" : "bg-blue-50"}`}>
            <span className="font-semibold text-gray-800">Status: {sheetData?.status || "No Draft"}</span>
            {isFinalized && <span className="text-red-700 font-bold">LOCKED</span>}
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSaveDraft)} className="flex flex-col">

              <div className="flex border-b bg-gray-50 overflow-x-auto">
                <button type="button" onClick={() => setActiveTab(0)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 0 ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500'}`}>0. Snapshot (Sec 1-4)</button>
                <button type="button" onClick={() => setActiveTab(1)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500'}`}>1. Vaccinations</button>
                <button type="button" onClick={() => setActiveTab(2)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500'}`}>2. Logistics</button>
              </div>

              <div className="p-6">
                <fieldset disabled={isFinalized}>
                  {activeTab === 0 && <TransitSheetSnapshot snapshot={sheetData?.snapshot} day={selectedDay} />}
                  {activeTab === 1 && <TransitTallyUI isFinalized={isFinalized} />}
                  {activeTab === 2 && <SectionLogistics />}
                </fieldset>
              </div>

              <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
                <button type="submit" disabled={isFinalized || loading || !selectedPointId} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Saving..." : "Save Draft"}
                </button>
                <button type="button" onClick={handleFinalize} disabled={isFinalized || !sheetData?._id} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                  Validate & Finalize
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}
    </div>
  );
};

export default TransitSheetPage;