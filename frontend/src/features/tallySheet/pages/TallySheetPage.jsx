import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { fetchTallySheet, saveTallySheetDraft, finalizeTallySheet, clearTallySheet } from "../store/tallySheetSlice";
import { fetchTeams } from "../../teams/store/teamSlice";
import SectionHouseholds from "../components/SectionHouseholds";
import SectionLinkedUnvaccinated from "../components/SectionLinkedUnvaccinated";
import SectionLogistics from "../components/SectionLogistics";
import SectionSchoolsAndOthers from "../components/SectionSchoolsAndOthers";
import SectionMedicalCases from "../components/SectionMedicalCases";
import TallySheetSummary from "../components/TallySheetSummary";
import TallySheetSnapshot from "../components/TallySheetSnapshot";

const TallySheetPage = () => {
    const dispatch = useDispatch();
    const { data: sheetData, loading } = useSelector((state) => state.tallySheet);
    const { teams } = useSelector((state) => state.teams);

    // Smart Role Detection
    const { user } = useSelector(state => state.auth);
    const isFieldTeam = user?.role === "FieldTeam";

    // Auto-select team ID if logged in as a Field Team
    const [selectedTeamId, setSelectedTeamId] = useState(isFieldTeam ? user._id : "");
    const [selectedDay, setSelectedDay] = useState("");
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
        if (selectedTeamId && selectedDay) {
            dispatch(fetchTallySheet({ teamId: selectedTeamId, day: selectedDay }));
        } else {
            dispatch(clearTallySheet());
            methods.reset();
        }
    }, [selectedTeamId, selectedDay, dispatch, methods]);

    useEffect(() => {
        if (sheetData) methods.reset(sheetData);
    }, [sheetData, methods]);

    const isFinalized = sheetData?.status === "Finalized";
    const mobileTeams = teams.filter(t => t.teamType === "Mobile");

    const handleSaveDraft = async (data) => {
        if (!selectedTeamId || !selectedDay) return;
        await dispatch(saveTallySheetDraft({ teamId: selectedTeamId, day: selectedDay, data }));
    };

    const handleFinalize = async () => {
        if (window.confirm("Finalize Tally Sheet? This will trigger math validations and lock the sheet.")) {
            await dispatch(finalizeTallySheet({ teamId: selectedTeamId, day: selectedDay }));
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mobile Team Tally Sheet</h2>

            {/* Smart Target Selection Header */}
            <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row gap-4 mb-6">
                {!isFieldTeam && (
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Select Mobile Team</label>
                        <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="w-full px-3 py-2 border rounded">
                            <option value="">-- Choose --</option>
                            {mobileTeams.map(t => <option key={t._id} value={t._id}>{t.teamNo}</option>)}
                        </select>
                    </div>
                )}
                <div className={isFieldTeam ? "flex-1" : "w-32"}>
                    <label className="block text-sm font-medium">Campaign Day</label>
                    <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option value="">-- Day --</option>
                        <option value="1">Day 1</option>
                        <option value="2">Day 2</option>
                        <option value="3">Day 3</option>
                    </select>
                </div>
            </div>

            {!selectedTeamId || !selectedDay ? (
                <div className="bg-white p-8 text-center rounded border shadow text-gray-500">
                    Select a Day to generate/view the Tally Sheet. (Requires Finalized OMP from your AIC)
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg flex flex-col">
                    <div className={`px-6 py-3 border-b flex justify-between items-center ${isFinalized ? "bg-red-50" : "bg-blue-50"}`}>
                        <span className="font-semibold text-gray-800">Status: {sheetData?.status || "No Draft"}</span>
                        {isFinalized && <span className="text-red-700 font-bold">LOCKED</span>}
                    </div>

                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(handleSaveDraft)} className="flex flex-col">
                            {/* Mount the Live Summary right at the top so it's always visible */}
                            <div className="p-6 pb-0">
                                <TallySheetSummary />
                            </div>
                            <div className="flex border-b bg-gray-50">
                                <button type="button" onClick={() => setActiveTab(1)} className={`px-6 py-3 text-sm font-bold ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>Page 1: Households & Snapshot</button>
                                <button type="button" onClick={() => setActiveTab(2)} className={`px-6 py-3 text-sm font-bold ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}>Page 2: Unvaccinated & Logistics</button>
                            </div>

                            <div className="p-6">
                                <fieldset disabled={isFinalized}>
                                    {activeTab === 1 && (
                                        <div className="space-y-6">
                                            <TallySheetSnapshot snapshot={sheetData?.snapshot} day={selectedDay} />
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

                            <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
                                <button type="submit" disabled={isFinalized || loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
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

export default TallySheetPage;