import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchTallySheet, saveTallySheetDraft, finalizeTallySheet, reopenTallySheet, clearTallySheet } from "../store/tallySheetSlice";
import { fetchTeams } from "../../teams/store/teamSlice";
import SectionHouseholds from "../components/SectionHouseholds";
import SectionLinkedUnvaccinated from "../components/SectionLinkedUnvaccinated";
import SectionLogistics from "../components/SectionLogistics";
import SectionSchoolsAndOthers from "../components/SectionSchoolsAndOthers";
import SectionMedicalCases from "../components/SectionMedicalCases";
import TallySheetSummary from "../components/TallySheetSummary";
import TallySheetSnapshot from "../components/TallySheetSnapshot";
import { useTranslation } from "react-i18next";
import "../../../i18n/i18n";
import ExportExcelButton from "../../../components/shared/ExportExcelButton";
import AssignedGeographyImage from "../../geography/components/AssignedGeographyImage";

const TallySheetPage = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { data: sheetData, loading } = useSelector((state) => state.tallySheet);
    const { teams } = useSelector((state) => state.teams);
    const context = useSelector((state) => state.context);

    // Smart Role Detection
    const { user } = useSelector(state => state.auth);
    const isFieldTeam = user?.role === "FieldTeam";
    const isAic = user?.role === "AIC";

    // Auto-select team ID if logged in as a Field Team
    const [selectedTeamId, setSelectedTeamId] = useState(isFieldTeam ? user._id : "");
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [activeTab, setActiveTab] = useState(1);

    const methods = useForm({
        defaultValues: sheetData || { households: [], unvaccinatedChildren: [] }
    });

    useEffect(() => {
        if (!isFieldTeam) {
            dispatch(fetchTeams());
        }
    }, [dispatch, isFieldTeam]);

    useEffect(() => {
        const operationalAssignment = (context.assignments || []).find((assignment) => String(assignment.assignmentId) === String(selectedAssignmentId));
        const operationalDay = isFieldTeam ? operationalAssignment?.campaignDay?.toString() || "" : selectedDay;
        if (selectedTeamId && operationalDay) {
            dispatch(fetchTallySheet({ teamId: selectedTeamId, day: operationalDay, assignmentId: isFieldTeam ? selectedAssignmentId : undefined, campaignId: isFieldTeam ? operationalAssignment?.campaignId : context.campaign?._id }));
        } else {
            dispatch(clearTallySheet());
            methods.reset();
        }
    }, [selectedTeamId, selectedDay, selectedAssignmentId, context.assignments, context.campaign, isFieldTeam, dispatch, methods]);

    useEffect(() => {
        if (sheetData) methods.reset(sheetData);
    }, [sheetData, methods]);

    const isFinalized = sheetData?.status === "Finalized";
    const mobileTeams = teams.filter(t => t.teamType === "Mobile");
    const fieldAssignments = (context.assignments || []).filter((assignment) => assignment.teamType === "Mobile" && assignment.assignmentType === "Route");
    const selectedAssignment = fieldAssignments.find((assignment) => String(assignment.assignmentId) === String(selectedAssignmentId));
    const operationalDay = isFieldTeam ? selectedAssignment?.campaignDay?.toString() || "" : selectedDay;
    const operationalCampaignId = isFieldTeam ? selectedAssignment?.campaignId : context.campaign?._id;

    const handleSaveDraft = async (data) => {
        if (!selectedTeamId || !operationalDay) return;
        await dispatch(saveTallySheetDraft({ teamId: selectedTeamId, day: operationalDay, data: { ...data, routeId: isFieldTeam ? selectedAssignmentId : undefined, campaignId: operationalCampaignId } }));
    };

    const handleFinalize = async () => {
        if (window.confirm(t("finalizeTallyConfirm"))) {
            await dispatch(finalizeTallySheet({ teamId: selectedTeamId, day: operationalDay, assignmentId: isFieldTeam ? selectedAssignmentId : undefined, campaignId: operationalCampaignId }));
        }
    };

    const handleReopen = async () => {
        const reason = window.prompt("Enter the reason for reopening this Tally Sheet:");
        if (reason?.trim()) {
            await dispatch(reopenTallySheet({ teamId: selectedTeamId, day: selectedDay, reason }));
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Field operations</p>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("mobileTeamTallySheet")}</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">Capture household coverage and supporting observations for the selected campaign day.</p>
                </div>
                <ExportExcelButton collectionName="tallysheet" data={sheetData} disabled={!sheetData} />
            </div>

            {/* Smart Target Selection Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">01</div>
                    <div><h3 className="font-bold text-slate-900">Choose sheet</h3><p className="text-xs text-slate-500">{isFieldTeam ? "Open the route assigned to your team." : "Select the campaign day before entering data."}</p></div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                {!isFieldTeam && (
                    <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{t("selectMobileTeam")}</label>
                        <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                            <option value="">{t("choose")}</option>
                            {mobileTeams.map(t => <option key={t._id} value={t._id}>{t.teamNo}</option>)}
                        </select>
                    </div>
                )}
                {isFieldTeam ? (
                    <div className="flex-1 space-y-2">
                        {fieldAssignments.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No active route has been assigned to this team yet.</p>}
                        {fieldAssignments.map((assignment) => {
                            const isReady = assignment.planningStatus === "Finalized";
                            const isSelected = String(assignment.assignmentId) === String(selectedAssignmentId);
                            return <button key={assignment.assignmentId} type="button" disabled={!isReady} onClick={() => setSelectedAssignmentId(assignment.assignmentId)} className={`w-full rounded-xl border p-3 text-left transition ${isSelected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"} disabled:cursor-not-allowed disabled:opacity-60`}><span className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900">Day {assignment.campaignDay} · {assignment.label}</span><span className="text-xs font-semibold text-slate-500">{isReady ? assignment.sheetStatus : "Planning pending"}</span></span><span className="mt-1 block text-xs text-slate-500">{assignment.areaName || "Assigned area"}</span></button>;
                        })}
                    </div>
                ) : <div className="w-full sm:w-40">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{t("campaignDay")}</label>
                    <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                        <option value="">{t("dayPlaceholder")}</option>
                        <option value="1">Day 1</option>
                        <option value="2">Day 2</option>
                        <option value="3">Day 3</option>
                    </select>
                </div>}
                </div>
            </div>

            {!selectedTeamId || !operationalDay ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">⌁</div>
                    <p className="font-semibold text-slate-800">Ready when you are</p>
                    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{t("selectDayHint")}</p>
                </div>
            ) : (
                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className={`flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${isFinalized ? "bg-red-50" : "bg-blue-50/70"}`}>
                        <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("status")}</p><span className="font-semibold text-slate-800">{sheetData?.status || t("noDraft")}</span></div>
                        {isFinalized && <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{t("locked")}</span>}
                    </div>

                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(handleSaveDraft)} className="flex flex-col">
                            {/* Mount the Live Summary right at the top so it's always visible */}
                            <div className="p-3 pb-0 sm:p-6 sm:pb-0">
                                <TallySheetSummary />
                            </div>
                            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 sm:px-4">
                                <button type="button" onClick={() => setActiveTab(1)} className={`min-h-12 flex-1 whitespace-nowrap px-3 py-3 text-left text-sm font-bold transition sm:px-5 ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>{t("page1Households")}</button>
                                <button type="button" onClick={() => setActiveTab(2)} className={`min-h-12 flex-1 whitespace-nowrap px-3 py-3 text-left text-sm font-bold transition sm:px-5 ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>{t("page2Unvaccinated")}</button>
                            </div>

                            <div className="p-3 sm:p-6">
                                <fieldset disabled={isFinalized}>
                                    {activeTab === 1 && (
                                        <div className="space-y-6">
                                            <TallySheetSnapshot snapshot={sheetData?.snapshot} day={operationalDay} />
                                            <AssignedGeographyImage kind="route" day={operationalDay} assignmentId={isFieldTeam ? selectedAssignmentId : undefined} assignmentImage={isFieldTeam ? selectedAssignment?.image : undefined} />
                                            <SectionHouseholds />
                                            {/* Added Sections 7, 8, 9 */}
                                            <SectionSchoolsAndOthers />
                                        </div>
                                    )}

                                    {activeTab === 2 && (
                                        <div className="space-y-6">
                                            <SectionLinkedUnvaccinated />
                                            {/* Added Sections 12, 13 */}
                                            <SectionMedicalCases />
                                            <SectionLogistics />
                                        </div>
                                    )}
                                </fieldset>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t bg-slate-50 p-3 sm:flex-row sm:justify-end sm:p-6">
                                {isAic && isFinalized && <button type="button" onClick={handleReopen} disabled={loading} className="min-h-11 w-full rounded-xl bg-orange-600 px-6 py-2 font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-50 sm:w-auto">Reopen for correction</button>}
                                <button type="submit" disabled={isFinalized || loading} className="min-h-11 w-full rounded-xl bg-blue-600 px-6 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto">
                                    {loading ? t("saving") : t("saveDraft")}
                                </button>
                                <button type="button" onClick={handleFinalize} disabled={isFinalized || !sheetData?._id} className="min-h-11 w-full rounded-xl bg-emerald-600 px-6 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 sm:w-auto">
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

export default TallySheetPage;
