import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchTransitSheet, saveTransitSheetDraft, finalizeTransitSheet, reopenTransitSheet, clearTransitSheet } from "../store/transitSheetSlice";
import { fetchTeams } from "../../teams/store/teamSlice";
import { fetchGeography } from "../../geography/store/geographySlice";
import TransitTallyUI from "../components/TransitTallyUI";
import TransitSheetSnapshot from "../components/TransitSheetSnapshot";
import SectionLogistics from "../../tallySheet/components/SectionLogistics";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";
import ExportExcelButton from "../../../components/shared/ExportExcelButton";
import AssignedGeographyImage from "../../geography/components/AssignedGeographyImage";

const TransitSheetPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { data: sheetData, loading } = useSelector((state) => state.transitSheet);
  const { teams } = useSelector((state) => state.teams);
  const { points } = useSelector((state) => state.geography);
  const context = useSelector((state) => state.context);

  const { user } = useSelector(state => state.auth);
  const isFieldTeam = user?.role === "FieldTeam";
  const isAic = user?.role === "AIC";

  const [selectedTeamId, setSelectedTeamId] = useState(isFieldTeam ? user._id : "");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedPointId, setSelectedPointId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const activeAreaId = context?.areaId;
  const fieldAssignments = (context.assignments || []).filter((assignment) => assignment.teamType === "Transit" && assignment.assignmentType === "Point");
  const selectedAssignment = fieldAssignments.find((assignment) => String(assignment.assignmentId) === String(selectedAssignmentId));
  const operationalDay = isFieldTeam ? selectedAssignment?.campaignDay?.toString() || "" : selectedDay;
  const operationalPointId = isFieldTeam ? selectedAssignment?.assignmentId : selectedPointId;
  const operationalCampaignId = isFieldTeam ? selectedAssignment?.campaignId : context?.campaign?._id;

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
        // The selected point is synchronized from the assigned team/day context.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPointId(matchingPoint._id);
      }
    }
  }, [selectedTeamId, selectedDay, transitPoints]);

  useEffect(() => {
    if (selectedTeamId && operationalDay) {
      dispatch(fetchTransitSheet({ teamId: selectedTeamId, day: operationalDay, pointId: operationalPointId, campaignId: operationalCampaignId }));
    } else {
      dispatch(clearTransitSheet());
      methods.reset({ vaccinatedChildrenCount: 0 });
    }
  }, [selectedTeamId, operationalDay, operationalPointId, operationalCampaignId, dispatch, methods]);

  useEffect(() => {
    if (sheetData) {
      methods.reset(sheetData);
      // The server-selected point must be reflected in the controlled selector.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (!selectedTeamId || !operationalDay || !operationalPointId) {
      alert(t("selectTransitPointBeforeSaving"));
      return;
    }
    const payload = { ...data, pointId: operationalPointId, campaignId: operationalCampaignId };
    await dispatch(saveTransitSheetDraft({ teamId: selectedTeamId, day: operationalDay, data: payload }));
  };

  const handleFinalize = async () => {
    if (window.confirm(t("finalizeTransitSheetConfirm"))) {
      await dispatch(finalizeTransitSheet({ teamId: selectedTeamId, day: operationalDay, campaignId: operationalCampaignId, pointId: operationalPointId }));
    }
  };

  const handleReopen = async () => {
    const reason = window.prompt("Enter the reason for reopening this Transit Sheet:");
    if (reason?.trim()) {
      await dispatch(reopenTransitSheet({ teamId: selectedTeamId, day: selectedDay, reason }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">{t("transitTeamSheet")}</h2>
          <ExportExcelButton collectionName="transitsheet" data={sheetData} disabled={!sheetData} />
        </div>
        {context?.areaName && (
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
            {t("area")}: <strong className="text-gray-800">{context.areaName} ({context.areaNo})</strong>
          </span>
        )}
      </div>

      {/* Target Selection Header */}
      <div className="bg-white p-4 rounded-lg shadow border grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {!isFieldTeam && (
          <div>
            <label className="block text-sm font-medium">{t("selectTransitTeam")}</label>
            <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded">
              <option value="">{t("choose")}</option>
              {transitTeams.map(t => <option key={t._id} value={t._id}>Team {t.teamNo} ({t.leader?.name})</option>)}
            </select>
          </div>
        )}
        {isFieldTeam ? <div className="md:col-span-2 space-y-2">
          {fieldAssignments.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No active transit point has been assigned to this team yet.</p>}
          {fieldAssignments.map((assignment) => { const isSelected = String(assignment.assignmentId) === String(selectedAssignmentId); return <button key={assignment.assignmentId} type="button" onClick={() => setSelectedAssignmentId(assignment.assignmentId)} className={`w-full rounded-xl border p-3 text-left transition ${isSelected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"}`}><span className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900">Day {assignment.campaignDay} · {assignment.label}</span><span className="text-xs font-semibold text-slate-500">{assignment.sheetStatus}</span></span><span className="mt-1 block text-xs text-slate-500">{assignment.areaName || "Assigned area"}</span></button>; })}
        </div> : <div>
          <label className="block text-sm font-medium">{t("campaignDay")}</label>
          <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded">
            <option value="">{t("dayPlaceholder")}</option>
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>}
        {!isFieldTeam && <div>
          <label className="block text-sm font-medium">{t("transitPoint")}</label>
          <select value={selectedPointId} onChange={e => setSelectedPointId(e.target.value)} disabled={isFinalized} className="mt-1 w-full px-3 py-2 border rounded disabled:bg-gray-100">
            <option value="">{t("selectPoint")}</option>
            {displayedPoints.map(p => <option key={p._id} value={p._id}>{p.pointNo} - {p.pointName} (Day {p.campaignDay})</option>)}
          </select>
        </div>}
      </div>

      {!selectedTeamId || !operationalDay ? (
        <div className="bg-white p-8 text-center rounded border shadow text-gray-500">
          {t("selectTransitTeamDayHint")}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg flex flex-col">
          <div className={`px-6 py-3 border-b flex justify-between items-center ${isFinalized ? "bg-red-50" : "bg-blue-50"}`}>
            <span className="font-semibold text-gray-800">{t("status")}: {sheetData?.status || t("noDraft")}</span>
            {isFinalized && <span className="text-red-700 font-bold">{t("locked")}</span>}
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSaveDraft)} className="flex flex-col">

              <div className="flex border-b bg-gray-50 overflow-x-auto">
                <button type="button" onClick={() => setActiveTab(0)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 0 ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500'}`}>{t("snapshotTab")}</button>
                <button type="button" onClick={() => setActiveTab(1)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500'}`}>{t("vaccinationsTab")}</button>
                <button type="button" onClick={() => setActiveTab(2)} className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500'}`}>{t("logisticsTab")}</button>
              </div>

              <div className="p-6">
                <fieldset disabled={isFinalized}>
                  {activeTab === 0 && <><TransitSheetSnapshot snapshot={sheetData?.snapshot} day={operationalDay} /><AssignedGeographyImage kind="point" day={operationalDay} assignmentId={isFieldTeam ? operationalPointId : undefined} assignmentImage={isFieldTeam ? selectedAssignment?.image : undefined} /></>}
                  {activeTab === 1 && <TransitTallyUI isFinalized={isFinalized} />}
                  {activeTab === 2 && <SectionLogistics />}
                </fieldset>
              </div>

              <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
                {isAic && isFinalized && <button type="button" onClick={handleReopen} disabled={loading} className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">Reopen for correction</button>}
                <button type="submit" disabled={isFinalized || loading || !selectedPointId} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {loading ? t("saving") : t("saveDraft")}
                </button>
                <button type="button" onClick={handleFinalize} disabled={isFinalized || !sheetData?._id} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                  {t("validateFinalize")}
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
